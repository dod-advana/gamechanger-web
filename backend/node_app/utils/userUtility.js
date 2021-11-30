function getTenDigitUserId (user_id) {
	const regex = /\d{10}/g;
	const id = regex.exec(user_id)
	return id ? id[0] : null
}

function getUserIdFromSAMLUserId (userId) {
	return userId.split('@')[0];
}

module.exports = { getTenDigitUserId, getUserIdFromSAMLUserId } 