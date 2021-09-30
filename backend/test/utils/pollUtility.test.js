const { poll, distributedPoll } = require('../../node_app/utils/pollUtility');
const { RedisKeyLockedError } = require('../../node_app/utils/redisLock');
const { constructorOptionsMock, flushPromises } = require('../resources/testUtility');

describe('pollUtility', () => {
	// the poll functions use Date.now() under the hood so we need to actually advance the
	// clock when advancing the timers by mocking Date.now() -- if we upgrade to jest 26+
	// this should be easier: https://jestjs.io/docs/jest-object#jestsetsystemtimenow-number--date
	let now = 0;
	const advanceTimersByTime = async (ms) => {
		await flushPromises();
		jest.advanceTimersByTime(ms);
		now += ms;
		await flushPromises();
	};

	let dateNowSpy;
	beforeEach(() => {
		now = 0;
		jest.useFakeTimers();
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
		dateNowSpy.mockRestore();
	});

	describe('#poll()', () => {

		it('should run a function', async () => {
			const fn = jest.fn(() => { });

			poll(fn, 100);
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should run an async function', async () => {
			const fn = jest.fn(async () => { });

			poll(fn, 100, constructorOptionsMock);
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should log errors and continue', async () => {
			const fn = jest.fn(async () => { throw Error(); });
			const logger = { error: jest.fn() };

			poll(fn, 100, { logger });
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(logger.error).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
			expect(logger.error).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should not run a function again until the previous call completes', async () => {
			const fn = jest.fn(async () => { await new Promise(r => setTimeout(r, 1000)) });

			poll(fn, 100, constructorOptionsMock);
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 10;
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1);

			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(2);
		});
	});

	describe('#distributedPoll()', () => {

		it('should run a function', async () => {
			const lockManager = {
				lock: async () => ({
					unlock: async () => { },
					extend: async (ttl) => { },
				}),
			};

			const fn = jest.fn(() => { });

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager });
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
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
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
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
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(logger.error).toHaveBeenCalledTimes(1);

			const iterations = 4
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1 + iterations);
			expect(logger.error).toHaveBeenCalledTimes(1 + iterations);
		});

		it('should not run a function again until the previous call completes', async () => {
			const lockManager = {
				lock: async () => ({
					unlock: async () => { },
					extend: async (ttl) => { },
				}),
			};
			const fn = jest.fn(async () => { await new Promise(r => setTimeout(r, 1000)) });

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager });
			await advanceTimersByTime(0);

			expect(fn).toHaveBeenCalledTimes(1);

			const iterations = 10;
			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}

			expect(fn).toHaveBeenCalledTimes(1);

			for (let i = 0; i < iterations; i++) {
				await advanceTimersByTime(100);
			}
			
			expect(fn).toHaveBeenCalledTimes(2);
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
			await advanceTimersByTime(0);

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(fn).not.toHaveBeenCalled();
			expect(logger.error).not.toHaveBeenCalled();

			await advanceTimersByTime(100);
			await advanceTimersByTime(100);

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
				.mockImplementationOnce(async () => { await new Promise(r => setTimeout(r, 1001)) })
				.mockImplementation(async () => { });
			const logger = { error: jest.fn() };

			distributedPoll(fn, 100, 'lock', { ...constructorOptionsMock, lockManager, logger });
			await advanceTimersByTime(0);

			// fire one refresh
			await advanceTimersByTime(50);

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(1);
			expect(lock.unlock).not.toHaveBeenCalled();
			expect(fn).toHaveBeenCalledTimes(1);
			
			// fire 19 more refreshes
			for (let i = 0; i < 19; ++i) {
				await advanceTimersByTime(50);
			}

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(20);
			expect(lock.unlock).not.toHaveBeenCalled();
			expect(fn).toHaveBeenCalledTimes(1);

			// 1001ms function finishes
			await advanceTimersByTime(1);

			expect(lockManager.lock).toHaveBeenCalledTimes(1);
			expect(lock.extend).toHaveBeenCalledTimes(20);
			expect(lock.unlock).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledTimes(1);

			// quick function finishes without needing an extra extend
			await advanceTimersByTime(100);

			expect(lockManager.lock).toHaveBeenCalledTimes(2);
			expect(lock.extend).toHaveBeenCalledTimes(21);
			expect(lock.unlock).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledTimes(2);
		});
	});
});