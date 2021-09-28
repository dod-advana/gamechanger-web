const { RedisLock, ResourceLockedError } = require('../utils/redisLock');
const LOGGER = require('../lib/logger');

async function poll(promiseFn, ms) {
	ms = Math.max(0, ms);
	while (true) {
		const start = new Date().getTime();
		try {
			await promiseFn();
		} catch (err) {
			LOGGER.error(err, 'UYD8FE');
		}
		const end = new Date().getTime();
		const timeout = Math.max(0, ms - (end - start));
		await new Promise(resolve => setTimeout(resolve, timeout));
	}
}

// this version of polling uses a lock in Redis to ensure that only
// one instance of the application runs the function at any given time
async function distributedPoll(lockName, promiseFn, ms, lockCheckMs = 1000) {
	const ttl = Math.ceil(ms);
	const redisLock = new RedisLock(lockName, {ttl});
	const autorefreshTimeout = Math.ceil(ttl / 2);
	let refreshTimer;
	poll(async () => {
		const start = new Date().getTime();
		let locked = false;
		try {
			await redisLock.lock();
			locked = true;

			// setup autorefresh of the lock while the function runs
			const autorefresh = async () => {
				if (locked) {
					try {
						await redisLock.extend(ttl);
					} catch (err) { 
						LOGGER.error(err, 'PM6SV6G');
					}
					refreshTimer = setTimeout(autorefresh, autorefreshTimeout);
					refreshTimer.unref && refreshTimer.unref();
				}
			};
			refreshTimer = setTimeout(autorefresh, autorefreshTimeout);
			refreshTimer.unref && refreshTimer.unref();

			await promiseFn();
		} catch (err) {
			// we expect the resource to sometimes already be locked
			if (!(err instanceof ResourceLockedError)) {
				LOGGER.error(err, 'M8HFXEH');
			}
		} finally {
			if (locked) {
				locked = false;
				const end = new Date().getTime();
				const timeout = Math.max(0, ms - (end - start));
				try {
					clearTimeout(refreshTimer);
					if (timeout > 0) {
						// reduce the lock timeout to the remaining poll interval
						await redisLock.extend(timeout);
					} else {
						await redisLock.unlock();
					}
				} catch (err) {
					LOGGER.error(err, 'N7FGETF');
				}
			}
		}
	}, lockCheckMs); // we check every so often if we can acquire the lock
}

module.exports = { 
	poll,
	distributedPoll,
};
