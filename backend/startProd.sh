#!/usr/bin/env bash

sequelize --options-path ./.sequelize-game_changer --env game_changer db:migrate --url "postgresql://${POSTGRES_USER_GAME_CHANGER}:${POSTGRES_PASSWORD_GAME_CHANGER}@${POSTGRES_HOST_GAME_CHANGER}/game_changer" && \
sequelize --options-path ./.sequelize-gc-orchestration --env gc_orchestration db:migrate --url "postgresql://${POSTGRES_USER_GC_ORCHESTRATION}:${POSTGRES_PASSWORD_GC_ORCHESTRATION}@${POSTGRES_HOST_GC_ORCHESTRATION}/gc-orchestration" && \
sequelize --options-path ./.sequelize-jbook --env jbook db:migrate --url "postgresql://${POSTGRES_USER_JBOOK}:${POSTGRES_PASSWORD_JBOOK}@${POSTGRES_HOST_JBOOK}/jbook" && \
ode index.js