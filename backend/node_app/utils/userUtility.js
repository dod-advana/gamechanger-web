function getTenDigitUserId (user_id) {
	const regex = /\d{10}/g;
	const id = regex.exec(user_id);
	return id ? id[0] : null;
}

function getUserIdFromSAMLUserId (obj, fromReq = true) {
	if (!fromReq) {
		return obj.split('@')[0];
	}

	if (obj.session && obj.session.user && obj.session.user.id) {
		return obj.session.user.id.split('@')[0];
	} else if (obj.headers && obj.get('SSL_CLIENT_S_DN_CN')) {
		return obj.get('SSL_CLIENT_S_DN_CN');
	} else {
		return 'Unknown User';
	}
}

module.exports = { getTenDigitUserId, getUserIdFromSAMLUserId };