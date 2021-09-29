const crypto = require('crypto');
const asyncRedisLib = require('async-redis');

const redisAsyncClientDB = 7;

function randomHex(bytes = 16) {
	return crypto.randomBytes(bytes).toString('hex');
}

class ResourceLockedError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ResourceLockedError';
	}
}

class RedisLock {
	constructor(key, opts = {}) {
		this.key = key;
		const {
			ttl = 5000,
			timeout = 5000,
			uuid = randomHex,
			redisClient,
		} = opts;
		this.ttl = Math.floor(ttl);
		this.timeout = timeout;
		this.id = uuid();

		if (!redisClient) {
			this.redisClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost', { db: redisAsyncClientDB });
		}

		this.lock = this.lock.bind(this);
		this.unlock = this.unlock.bind(this);
		this.extend = this.extend.bind(this);
		this.hasLock = this.hasLock.bind(this);
	}

	async lock() {
		const res = await this.redisClient.set(this.key, this.id, 'PX', this.ttl, 'NX');
		//failed to get lock
		if (!res) {
			throw new ResourceLockedError('the lock has already been locked');
		}
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
		const res = await this.redisClient.eval(deleteScript, 1, this.key, this.id);
		if (res !== 1) {
			throw new Error('unable to unlock');
		}
	}

	async extend(ttl = undefined) {
		ttl = Math.floor((ttl !== undefined) ? ttl : this.ttl);

		const extendScript = `
		-- extend the ttl only if the id matches
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2])
		else
			return nil
		end
		`;
		const res = await this.redisClient.eval(extendScript, 1, this.key, this.id, ttl);
		if (!res) {
			throw new Error('unable to extend lock ttl, the lock may have already expired');
		}
	}

	async hasLock() {
		const value = await this.redisClient.get(this.key);
		return value === this.id;
	}
}

module.exports = {
	RedisLock,
	ResourceLockedError,
}