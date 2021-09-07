async function poll(promiseFn, ms) {
	ms = Math.max(0, ms);
	while (true) {
		await promiseFn();
		await new Promise(resolve => setTimeout(resolve, ms));
	}
}

module.exports = { poll };
