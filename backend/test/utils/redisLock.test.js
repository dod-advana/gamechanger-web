const {
	RedisLockError,
	RedisKeyLockedError,
	RedisLock,
	RedisLockManager,
} = require('../../node_app/utils/redisLock');

describe('RedisLock', () => {
	describe('#unlock', () => {
		it('should unlock using its key and value', async () => {
			const redisClient = {
				eval: jest.fn(async () => 1),
			};
			const lock = new RedisLock(redisClient, 'key', 'ABCDEF');
			await lock.unlock();
			expect(redisClient.eval).toHaveBeenCalledWith(expect.any(String) /* ?? */, 1, 'key', 'ABCDEF');
		});

		it('should throw an error if the key cannot be deleted', async () => {
			const redisClient = {
				eval: jest.fn(async () => 0), // this may be impossible
			};
			const lock = new RedisLock(redisClient, 'key', 'ABCDEF');

			expect(async () => await lock.unlock()).rejects.toThrow(RedisLockError);
		});
	});

	describe('#extend', () => {
		it('should extend using its key and value and the provided ttl', async () => {
			const redisClient = {
				eval: jest.fn(async () => 1),
			};
			const lock = new RedisLock(redisClient, 'key', 'ABCDEF');
			await lock.extend(123);
			expect(redisClient.eval).toHaveBeenCalledWith(expect.any(String) /* ?? */, 1, 'key', 'ABCDEF', 123);
		});

		it('should throw an error if the key cannot be extended', async () => {
			const redisClient = {
				eval: jest.fn(async () => null),
			};
			const lock = new RedisLock(redisClient, 'key', 'ABCDEF');

			expect(async () => await lock.extend(123)).rejects.toThrow(RedisLockError);
		});
	});
});

describe('RedisLockManager', () => {
	describe('#lock', () => {
		it('should lock using its key, value, and ttl', async () => {
			const redisClient = {
				set: jest.fn(async () => 'OK'),
			};
			const uuid = () => 'ABCDEF';

			const lockManager = new RedisLockManager({ redisClient, uuid });
			const lock = await lockManager.lock('key', 123);

			expect(redisClient.set).toHaveBeenCalledWith('key', 'ABCDEF', 'PX', 123, 'NX');
			expect(lock).toBeInstanceOf(RedisLock);
			expect(lock.key).toBe('key');
			expect(lock.value).toBe('ABCDEF');
			expect(lock.redisClient).toBe(redisClient);
		});

		it('should throw an error if the key is already locked', async () => {
			const redisClient = {
				set: jest.fn(async () => null),
			};
			const uuid = () => 'ABCDEF';

			const lockManager = new RedisLockManager({ redisClient, uuid });
			expect(async () => await lockManager.lock('key', 123)).rejects.toThrow(RedisKeyLockedError);
		});
	});
});
