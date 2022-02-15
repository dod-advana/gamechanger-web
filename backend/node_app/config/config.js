const path = require('path');
const fs = require('fs');

let secretsPath = path.join(__dirname, '../../../gc_secrets.json');
let secrets = {
	'postgres_host_game_changer': 'FAKE',
	'postgres_host_gc-orchestration': 'FAKE',
	'postgres_host_uot': 'FAKE',
	'postgres_host_jbook': 'FAKE',
	'postgres_user_game_changer': 'FAKE',
	'postgres_user_gc-orchestration': 'FAKE',
	'postgres_user_uot': 'FAKE',
	'postgres_user_jbook': 'FAKE',
	'postgres_password_game_changer': 'FAKE',
	'postgres_password_gc-orchestration': 'FAKE',
	'postgres_password_uot': 'FAKE',
	'postgres_password_jbook': 'FAKE',
	'elasticsearch_password_game_changer': 'FAKE',
	'elasticsearch_password_eda': 'FAKE',
	'neo4j_password': 'FAKE',
	'mysql_password_matomo': 'FAKE',
	'data_catalog_password': 'FAKE'
};
if(fs.existsSync(secretsPath)) {
	console.log('Using secrets file');
	let rawSecrets = fs.readFileSync(secretsPath);
	secrets = JSON.parse(rawSecrets);
} else {
	console.log('Using default secrets');
}

module.exports = {
	development: {
		databases: {
			game_changer: {
				username: secrets.postgres_user_game_changer,
				password: secrets.postgres_password_game_changer,
				database: 'game_changer',
				host: secrets.postgres_host_game_changer,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			'gc-orchestration': {
				username: secrets['postgres_user_gc-orchestration'],
				password: secrets['postgres_password_gc-orchestration'],
				database: 'gc-orchestration',
				host: secrets['postgres_host_gc-orchestration'],
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			jbook: {
				username: secrets.postgres_user_jbook,
				password: secrets.postgres_password_jbook,
				database: 'jbook',
				host: secrets.postgres_host_jbook,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
		}
	},
	game_changer: {
		username: secrets.postgres_user_game_changer,
		password: secrets.postgres_password_game_changer,
		database: 'game_changer',
		host: secrets.postgres_host_game_changer,
		port: 5432,
		dialect: 'postgres',
		logging: false
	},
	'gc-orchestration': {
		username: secrets['postgres_user_gc-orchestration'],
		password: secrets['postgres_password_gc-orchestration'],
		database: 'gc-orchestration',
		host: secrets['postgres_host_gc-orchestration'],
		port: 5432,
		dialect: 'postgres',
		logging: false
	},
	jbook: {
		username: secrets.postgres_user_jbook,
		password: secrets.postgres_password_jbook,
		database: 'jbook',
		host: secrets.postgres_host_jbook,
		port: 5432,
		dialect: 'postgres',
		logging: false
	},
};
