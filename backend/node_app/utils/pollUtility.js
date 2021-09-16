const { RedisLock, ResourceLockedError } = require('../utils/redisLock');
const LOGGER = require('../lib/logger');

async function poll(promiseFn, ms) {
	ms = Math.max(0, ms);
	while (true) {
		const start = new Date().getTime();
		await promiseFn();
		const end = new Date().getTime();
		const timeout = Math.max(0, ms - (end - start));
		await new Promise(resolve => setTimeout(resolve, timeout));
	}
}

// this version of polling uses a lock in Redis to ensure that only
// one instance of the application runs the function at any given time
async function distributedPoll(lockName, promiseFn, ms, lockCheckMs = 1000) {
	const ttl = Math.max(Math.ceil(ms), 60000); // timeout lock after at least 60s
	const redisLock = new RedisLock(lockName, {ttl});
	poll(async () => {
		const start = new Date().getTime();
		let locked = false;
		try {
			await redisLock.lock();
			locked = true;
			await promiseFn();
		} catch (err) {
			// we expect the resource to sometimes already be locked
			if (!(err instanceof ResourceLockedError)) {
				LOGGER.error(err, 'M8HFXEH');
			}
		} finally {
			if (locked) {
				const end = new Date().getTime();
				const timeout = Math.max(0, ms - (end - start));
				try {
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
