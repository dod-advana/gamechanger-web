#!/bin/bash

sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/game_changer"
sequelize --options-path ./.sequelize-gc-orchestration --env gc-orchestration db:migrate --url "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/gc-orchestration"