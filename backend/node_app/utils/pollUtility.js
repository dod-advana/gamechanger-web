const { RedisLockManager, RedisKeyLockedError } = require('../utils/redisLock');
const LOGGER = require('../lib/logger');

async function poll(promiseFn, ms, opts = {}) {
	const {
		logger = LOGGER,
	} = opts;

	ms = Math.max(0, Math.ceil(ms));
	while (true) {
		const start = Date.now();
		try {
			await promiseFn();
		} catch (err) {
			logger.error(err, 'UYD8FE');
		}
		const end = Date.now();
		const timeout = Math.max(0, ms - (end - start));
		await new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}
}

// this version of polling uses a lock in Redis to ensure that only
// one instance of the application runs the function at any given time
async function distributedPoll(promiseFn, ms, lockName, opts = {}) {
	ms = Math.max(0, Math.ceil(ms));
	const {
		lockCheckMs = Math.min(1000, ms),
		lockManager = new RedisLockManager(),
		logger = LOGGER,
	} = opts;
	const autorefreshTimeout = Math.floor(ms / 2);

	let refreshTimer;
	poll(async () => { // we poll every so often if we can acquire the lock
		const start = Date.now();
		let locked = false;
		let lock;
		try {
			lock = await lockManager.lock(lockName, ms);
			locked = true;

			// setup autorefresh of the lock while the function runs
			const autorefresh = async () => {
				if (locked) {
					try {
						await lock.extend(ms);
					} catch (err) {
						logger.error(err, 'PM6SV6G');
					}
					refreshTimer = setTimeout(autorefresh, autorefreshTimeout);
				}
			};
			refreshTimer = setTimeout(autorefresh, autorefreshTimeout);

			await promiseFn();
		} catch (err) {
			// we expect the resource to sometimes already be locked
			if (!(err instanceof RedisKeyLockedError)) {
				logger.error(err, 'M8HFXEH');
			}
		} finally {
			if (locked) {
				locked = false;
				clearTimeout(refreshTimer);
				const end = Date.now();
				const timeout = Math.max(0, ms - (end - start));
				try {
					if (timeout > 0) {
						// reduce the lock timeout to the remaining poll interval
						await lock.extend(timeout);
					} else {
						await lock.unlock();
					}
				} catch (err) {
					logger.error(err, 'N7FGETF');
				}
			}
		}
	}, 
	lockCheckMs, { logger });
}

module.exports = {
	poll,
	distributedPoll,
};
