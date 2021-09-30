const { poll, distributedPoll } = require('../../node_app/utils/pollUtility');
const { RedisKeyLockedError } = require('../../node_app/utils/redisLock');
const { constructorOptionsMock, flushPromises } = require('../resources/testUtility');

describe('pollUtility', () => {

	describe('#poll()', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.clearAllTimers();
			jest.useRealTimers();
		});

		it('should run a function', async () => {
			const fn = jest.fn(() => { });

			poll(fn, 100, constructorOptionsMock);
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should run an async function', async () => {
			const fn = jest.fn(async () => { });

			poll(fn, 100, constructorOptionsMock);
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should log errors and continue', async () => {
			const fn = jest.fn(async () => { throw Error(); });
			const logger = { error: jest.fn() };

			poll(fn, 100, { logger });
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(logger.error).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
			expect(logger.error).toHaveBeenCalledTimes(1 + iterations);
		});
	});

	describe('#distributedPoll()', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.clearAllTimers();
			jest.useRealTimers();
		});

		it('should run a function', async () => {
			const lockManager = {
				lock: async () => ({
					unlock: async () => { },
					extend: async (ttl) => { },
				}),
			};

			const fn = jest.fn(() => { });

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager });
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should run an async function', async () => {
			const lockManager = {
				lock: async () => ({
					unlock: async () => { },
					extend: async (ttl) => { },
				}),
			};

			const fn = jest.fn(async () => { });
			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager });
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should log errors and continue', async () => {
			const lockManager = {
				lock: async () => ({
					unlock: async () => { },
					extend: async (ttl) => { },
				}),
			};

			const fn = jest.fn(async () => { throw Error(); });
			const logger = { error: jest.fn() };

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager, logger });
			await flushPromises();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(logger.error).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				jest.advanceTimersByTime(100);
				await flushPromises();
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
			expect(logger.error).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should recheck lock if already locked', async () => {
			const lock = {
				unlock: async () => { },
				extend: async (ttl) => { },
			};
			const lockManager = {
				lock: jest
					.fn()
					.mockRejectedValueOnce(new RedisKeyLockedError())
					.mockResolvedValue(lock),
			};

			const fn = jest.fn(async () => { });
			const logger = { error: jest.fn() };

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager, logger, lockCheckMs: 200 });
			await flushPromises();

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(fn).not.toHaveBeenCalled();
			expect(logger.error).not.toHaveBeenCalled();

			jest.advanceTimersByTime(100);
			await flushPromises();
			jest.advanceTimersByTime(100);
			await flushPromises();

			expect(lockManager.lock).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should refresh lock in background', async () => {
			const lock = {
				unlock: jest.fn(async () => { }),
				extend: jest.fn(async (ttl) => { }),
			};
			const lockManager = {
				lock: jest.fn().mockResolvedValue(lock),
			};

			const fn = jest
				.fn()
				.mockImplementationOnce(async () => { await new Promise(r => setTimeout(r, 1001)); })
				.mockImplementation(async () => { });
			const logger = { error: jest.fn() };

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager, logger });
			await flushPromises();

			// fire one refresh
			jest.advanceTimersByTime(50);
			await flushPromises();

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledTimes(1);
			
			// fire 19 more refreshes
			for (let i = 0; i < 19; ++i) {
				jest.advanceTimersByTime(50);
				await flushPromises();
			}

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(20);
			expect(fn).toHaveBeenCalledTimes(1);

			// 1001ms function finishes
			jest.advanceTimersByTime(1);
			await flushPromises();

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(21);
			expect(fn).toHaveBeenCalledTimes(1);

			// quick function finishes without needing an extra extend
			jest.advanceTimersByTime(100);
			await flushPromises();

			expect(lockManager.lock).toHaveBeenCalledTimes(2);
			expect(lock.extend).toHaveBeenCalledTimes(22);
			expect(fn).toHaveBeenCalledTimes(2);
		});
	});
});