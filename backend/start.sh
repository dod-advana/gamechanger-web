#!/bin/bash
# if [ ! -f ./metadata/es_loaded ]; then
# 	sleep 30 && curl -X PUT "elasticsearch:9200/gamechanger?pretty"
# 	touch ./metadata/es_loaded
# fi

if [ ! -f ./metadata/dbs_created ]; then
    sleep 30 && \
	sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@postgres/game_changer" && \
	sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@postgres/gc-orchestration" && \
	touch ./metadata/dbs_created && \
	nodemon index.js
else
	sleep 10 && \
	sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@postgres/game_changer" && \
	sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@postgres/gc-orchestration" && \
	touch ./metadata/dbs_created && \
	nodemon index.js
fi
