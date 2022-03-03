import axios from 'axios';
import jws from 'jws';
import Config from '../../config/config.js';

const { USER_TOKEN_ENDPOINT } = Config;

axios.defaults.withCredentials = true;

class GCAuth {
	/**
	 * Authenticate a user. Save a token string in Local Storage
	 *
	 * @param {string} token
	 */
	static saveUser(token) {
		sessionStorage.clear(); // may need to clear prefixed keys only? ex. darq-
		localStorage.removeItem('token');
		localStorage.setItem('token', token);
	}

	/**
	 * Remove a token from Local Storage.
	 *
	 */
	static removeUser() {
		localStorage.removeItem('token');
	}

	static getUserDisplayName() {
		const tokenPayload = this.getTokenPayload();
		let displayName = null;
		if (tokenPayload != null) {
			displayName = tokenPayload.displayName || '';
		}
		return displayName;
	}

	//Gluu's User id happens to be the CN so theyre one in the same
	static getUserId() {
		const tokenPayload = this.getTokenPayload();
		if (tokenPayload != null) {
			return tokenPayload.id || null;
		} else {
			return null;
		}
	}

	static getUserSandbox() {
		const tokenPayload = this.getTokenPayload();
		if (tokenPayload != null) {
			return tokenPayload.sandboxId || null;
		} else {
			return null;
		}
	}

	static getUserPermissions() {
		const tokenPayload = this.getTokenPayload();
		if (tokenPayload != null) {
			return tokenPayload.perms ? tokenPayload.perms : [];
		} else {
			return null;
		}
	}

	static userDisabled() {
		const tokenPayload = this.getTokenPayload();
		if (tokenPayload != null) {
			return tokenPayload.disabled;
		} else {
			return null;
		}
	}

	/**
	 * Get a token value.
	 *
	 * @returns {string}
	 */

	static getToken() {
		return localStorage.getItem('token');
	}

	static getTokenPayload() {
		let token = this.getToken();
		if (token != null) {
			var decodedToken = jws.decode(token);
			return decodedToken ? decodedToken.payload : null;
		} else {
			return null;
		}
	}

	static async refreshUserToken(callback, errCallback) {
		await axios
			.post(USER_TOKEN_ENDPOINT)
			.then((response) => {
				this.saveUser(response.data.token);
				if (callback) callback();
			})
			.catch((error) => {
				console.error(error);
				localStorage.removeItem('token');
				if (errCallback) errCallback();
			});
	}

	static saveDataApiToken(token) {
		localStorage.removeItem('dataApiToken');
		localStorage.setItem('dataApiToken', token);
	}

	static getDataApiToken() {
		return localStorage.getItem('dataApiToken');
	}
}

export default GCAuth;
