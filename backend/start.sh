#!/usr/bin/env bash

sleep 45 && \
sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@web-postgres/game_changer" && \
sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@web-postgres/gc-orchestration" && \
sequelize --options-path ./.sequelize-jbook --env jbook db:migrate --url "postgresql://postgres:password@10.194.9.37/jbook" && \
psql -U postgres -h web-postgres -d game_changer -f /usr/src/app/node_app/init/create_clones.sql && \
psql -U postgres -h web-postgres -d game_changer -f /usr/src/app/node_app/init/create_admins.sql && \
psql -U postgres -h web-postgres -d game_changer -f /usr/src/app/node_app/init/pop_mini_RE.sql && \
nodemon index.js
