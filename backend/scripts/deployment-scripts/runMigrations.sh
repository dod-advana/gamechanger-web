#!/bin/bash

sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url 'postgresql://postgres:password@postgres/game_changer'
sequelize --options-path ./.sequelize-gc-orchestration --env gc-orchestration db:migrate --url 'postgresql://postgres:password@postgres/gc-orchestration'