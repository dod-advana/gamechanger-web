#!/bin/bash

if [ ! -f ./metadata/dbs_created ]; then
	echo "sleeping!"
    sleep 30 && \
	sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@postgres/game_changer" && \
	sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@postgres/gc-orchestration" && \
	touch ./metadata/dbs_created && \
	nodemon index.js
else
	echo "Not sleeping!"
	sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@postgres/game_changer" && \
	sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@postgres/gc-orchestration" && \
	touch ./metadata/dbs_created && \
	nodemon index.js
fi
