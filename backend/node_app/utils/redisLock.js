const crypto = require('crypto');
const asyncRedisLib = require('async-redis');

const redisAsyncClientDB = 7;

function randomHex(bytes = 16) {
	return crypto.randomBytes(bytes).toString('hex');
}

class RedisLockError extends Error {
	constructor(message) {
		super(message);
		this.name = 'RedisLockError';
	}
}

class RedisKeyLockedError extends RedisLockError {
	constructor(message) {
		super(message);
		this.name = 'RedisKeyLockedError';
	}
}

// this class should not be directly instantiated, it is created by
// calling `RedisLockManager.lock`
class RedisLock {
	constructor(redisClient, key, value) {
		this.redisClient = redisClient;
		this.key = key;
		this.value = value;
	}

	async unlock() {
		const deleteScript = `
		-- do nothing if key doesn't exist
		if redis.call("exists", KEYS[1]) == 0 then
			return 1
		end
		-- delete only if the id matches
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			-- consider unlocked as a different lock owns this key
			return 1
		end`;
		const res = await this.redisClient.eval(deleteScript, 1, this.key, this.value);
		if (res !== 1) { // can this actually happen?
			throw new RedisLockError('unable to unlock');
		}
	}

	async extend(ttl) {
		ttl = Math.ceil(ttl);

		const extendScript = `
		-- extend the ttl only if the id matches
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2])
		else
			return nil
		end
		`;
		const res = await this.redisClient.eval(extendScript, 1, this.key, this.value, ttl);
		if (!res) {
			throw new RedisLockError('unable to extend lock ttl, the lock may have already expired');
		}
	}
}

class RedisLockManager {
	constructor(opts = {}) {
		({
			uuid: this.uuid = randomHex,
			redisClient: this.redisClient,
		} = opts);

		if (!this.redisClient) {
			this.redisClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost', { db: redisAsyncClientDB });
		}
	}

	async lock(key, ttl) {
		const value = this.uuid();
		const res = await this.redisClient.set(key, value, 'PX', ttl, 'NX');
		//failed to get lock
		if (!res) {
			throw new RedisKeyLockedError('the lock has already been locked');
		}
		return new RedisLock(this.redisClient, key, value);
	}
}

module.exports = {
	RedisLockError,
	RedisKeyLockedError,
	RedisLock, // exposed for tests
	RedisLockManager,
}