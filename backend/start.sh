
#!/bin/bash

sleep 45 && \
sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://postgres:password@postgres/game_changer" && \
sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://postgres:password@postgres/gc-orchestration" && \
psql -U postgres -h postgres -d game_changer -f /usr/src/app/node_app/sql/v89.0_insert_game_changer_clone_meta.sql && \
nodemon index.js
