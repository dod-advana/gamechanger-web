#!/usr/bin/env bash
set -o nounset
set -o errexit

SCRIPT_DIR="$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cat <<EOFXXX

POSTGRES_DB_GAME_CHANGER="${POSTGRES_DB_GAME_CHANGER:-postgres}"
POSTGRES_DB_GC_ORCHESTRATION="${POSTGRES_DB_GC_ORCHESTRATION:-postgres}"
POSTGRES_HOST_GAME_CHANGER="${POSTGRES_HOST_GAME_CHANGER:-postgres}"
POSTGRES_HOST_GC_ORCHESTRATION="${POSTGRES_HOST_GC_ORCHESTRATION:-postgres}"
POSTGRES_HOST_UOT="${POSTGRES_HOST_UOT:-postgres}"
POSTGRES_USER_GAME_CHANGER="${POSTGRES_USER_GAME_CHANGER:-postgres}"
POSTGRES_USER_GC_ORCHESTRATION="${POSTGRES_USER_GC_ORCHESTRATION:-postgres}"
POSTGRES_USER_UOT="${POSTGRES_USER_UOT:-postgres}"
POSTGRES_PASSWORD_GAME_CHANGER="${POSTGRES_PASSWORD_GAME_CHANGER:-password}"
POSTGRES_PASSWORD_GC_ORCHESTRATION="${POSTGRES_PASSWORD_GC_ORCHESTRATION:-password}"
POSTGRES_PASSWORD_UOT="${POSTGRES_PASSWORD_UOT:-password}"

GAMECHANGER_ELASTICSEARCH_HOST="${GAMECHANGER_ELASTICSEARCH_HOST:-elasticsearch}"
GAMECHANGER_ELASTICSEARCH_PORT="${GAMECHANGER_ELASTICSEARCH_PORT:-9200}"
GAMECHANGER_ELASTICSEARCH_USER="${GAMECHANGER_ELASTICSEARCH_USER:-}"
GAMECHANGER_ELASTICSEARCH_PASSWORD="${GAMECHANGER_ELASTICSEARCH_PASSWORD:-}"
GAMECHANGER_ELASTICSEARCH_CA_FILEPATH="${GAMECHANGER_ELASTICSEARCH_CA_FILEPATH:-/etc/secrets/gamechanger.crt}"
GAMECHANGER_ELASTICSEARCH_INDEX="${GAMECHANGER_ELASTICSEARCH_INDEX:-gamechanger}"
GAMECHANGER_ELASTICSEARCH_PROTOCOL="${GAMECHANGER_ELASTICSEARCH_PROTOCOL:-http}"
GAMECHANGER_ELASTICSEARCH_SUGGEST_INDEX="${GAMECHANGER_ELASTICSEARCH_SUGGEST_INDEX:-gamechanger}"
GAMECHANGER_ELASTICSEARCH_ENTITIES_INDEX="${GAMECHANGER_ELASTICSEARCH_ENTITIES_INDEX:-entities}"
GAMECHANGER_ELASTICSEARCH_HISTORY_INDEX="${GAMECHANGER_ELASTICSEARCH_HISTORY_INDEX:-search_history}"

EDA_ELASTICSEARCH_HOST="${EDA_ELASTICSEARCH_HOST:-elasticsearch}"
EDA_ELASTICSEARCH_PORT="${EDA_ELASTICSEARCH_PORT:-9200}"
EDA_ELASTICSEARCH_USER="${EDA_ELASTICSEARCH_USER:-}"
EDA_ELASTICSEARCH_PASSWORD="${EDA_ELASTICSEARCH_PASSWORD:-}"
EDA_ELASTICSEARCH_CA_FILEPATH="${EDA_ELASTICSEARCH_CA_FILEPATH:-/etc/secrets/gamechanger.crt}"
EDA_ELASTICSEARCH_INDEX="${EDA_ELASTICSEARCH_INDEX:-gc_eda_2021_json}"
EDA_ELASTICSEARCH_PROTOCOL="${EDA_ELASTICSEARCH_PROTOCOL:-http}"
EDA_DATA_HOST="${EDA_DATA_HOST:-}"

HERMES_ELASTICSEARCH_INDEX="${HERMES_ELASTICSEARCH_INDEX:-hermes_test_1}"

NEO4J_URL="${NEO4J_URL:-neo4j://neo4j:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-admin}"
MYSQL_HOST_MATOMO="${MYSQL_HOST_MATOMO:-mysql}"
MYSQL_USER_MATOMO="${MYSQL_USER_MATOMO:-root}"
MYSQL_PASSWORD_MATOMO="${MYSQL_PASSWORD_MATOMO:-password}"
DATA_CATALOG_HOST="${DATA_CATALOG_HOST:-}"
DATA_CATALOG_PORT="${DATA_CATALOG_PORT:-}"
DATA_CATALOG_USER="${DATA_CATALOG_USER:-}"
DATA_CATALOG_PASSWORD="${DATA_CATALOG_PASSWORD:-}"
DATA_CATALOG_CA="${DATA_CATALOG_CA:-}"

EMAIL_TRANSPORT_HOS="${EMAIL_TRANSPORT_HOS:-smtp-relay.local}"
EMAIL_TRANSPORT_PORT="${EMAIL_TRANSPORT_PORT:-25}"

DOCKER="${DOCKER:-true}"
REDIS_URL="${REDIS_URL:-redis://redis}"
GAMECHANGER_ML_API_HOST="${GAMECHANGER_ML_API_HOST:-ml-api}"

S3_REGION="${S3_REGION:-us-east-1}"

PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_UM_DB="${PG_UM_DB:-postgres}"
PG_DST_DB="${PG_DST_DB:-postgres}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-password}"
PG_LOGGING="${PG_LOGGING:-false}"

SECURE_SESSION="${SECURE_SESSION:-false}"
DISABLE_SSO="${DISABLE_SSO:-true}"

SAML_ISSUER="${SAML_ISSUER:-}"
SAML_CALLBACK_URL="${SAML_CALLBACK_URL:-}"
SAML_ENTRYPOINT="${SAML_ENTRYPOINT:-}"
SAML_CERT="${SAML_CERT:-}"
COOKIE_DOMAIN="${COOKIE_DOMAIN:-.local}"

EMAIL_ADDRESS="${EMAIL_ADDRESS:-test@example.local}"

QLIK_URL="${QLIK_URL:-}"
QLIK_WS_URL="${QLIK_WS_URL:-}"
QLIK_SYS_ACCOUNT="${QLIK_SYS_ACCOUNT:-}"
QLIK_AD_DOMAIN="${QLIK_AD_DOMAIN:-}"
QLIK_CERT_CA="${QLIK_CERT_CA:-}"
QLIK_CERT_KEY="${QLIK_CERT_KEY:-}"
QLIK_CERT="${QLIK_CERT:-}"

SERVICE_ACCOUNT_USER="${SERVICE_ACCOUNT_USER:-webapp-serviceaccount}"
SERVICE_ACCOUNT_PASSWORD="${SERVICE_ACCOUNT_PASSWORD:-password}"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_EMAIL:-test@example.local}"
SERVICE_ACCOUNT_PHONE="${SERVICE_ACCOUNT_PHONE:-555-555-5555}"
SERVICE_ACCOUNT_ORG="${SERVICE_ACCOUNT_ORG:-TEST_ORG}"
SERVICE_ACCOUNT_ENV="${SERVICE_ACCOUNT_ENV:-PUBLIC_ENV}"

GAMECHANGER_DEMO_DEPLOYMENT="${GAMECHANGER_DEMO_DEPLOYMENT:-true}"

DISABLE_FRONT_END_CONFIG="${DISABLE_FRONT_END_CONFIG:-false}"
REACT_APP_GC_DECOUPLED="${REACT_APP_GC_DECOUPLED:-true}"
REACT_APP_NODE_ENV="${REACT_APP_NODE_ENV:-development}"
REACT_APP_GLUU_SSO="${REACT_APP_GLUU_SSO:-disabled}"
REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL:-http://localhost:8080}"
REACT_APP_MATOMO_LINK="${REACT_APP_MATOMO_LINK:-http://matomo}"
REACT_APP_DATA_CATALOG_LINK="${REACT_APP_DATA_CATALOG_LINK:-http://data-catalog.local:8443}"
REACT_APP_CLASSIFICATION_BANNER="${REACT_APP_CLASSIFICATION_BANNER:-UNCLASSIFIED}"
REACT_APP_CLASSIFICATION_BANNER_COLOR="${REACT_APP_CLASSIFICATION_BANNER_COLOR:-GREEN}"
REACT_APP_MEGA_MENU_ENDPOINT="${REACT_APP_MEGA_MENU_ENDPOINT:-http://localhost:8080/api/gamechanger/megamenu/links}"
REACT_APP_TUTORIAL_HREF="${REACT_APP_TUTORIAL_HREF:-http://localhost:8080}"
REACT_APP_USER_TOKEN_ENDPOINT="${REACT_APP_USER_TOKEN_ENDPOINT:-http://localhost:8080/api/auth/token}"
REACT_APP_SUPPORT_HREF="${REACT_APP_SUPPORT_HREF:-https://support.local/plugins/servlet/desk/portal/5/create/113}"
REACT_APP_WIKI_HREF="${REACT_APP_WIKI_HREF:-http://wiki.local}"
REACT_APP_LOGIN_ROUTE="${REACT_APP_LOGIN_ROUTE:-http://localhost:8080/login}"

EXPRESS_TRUST_PROXY="${EXPRESS_TRUST_PROXY:-true}"
APPROVED_API_CALLERS="${APPROVED_API_CALLERS:-"http://localhost:8080 https://localhost:8080"}"

TLS_KEY_PASSPHRASE="${TLS_KEY_PASSPHRASE:-wildcard}"
TLS_KEY_FILEPATH="${TLS_KEY_FILEPATH:-"/opt/app-root/src/secrets/tls_key.key"}"
TLS_CERT_FILEPATH="${TLS_CERT_FILEPATH:-"/opt/app-root/src/secrets/tls_cert.cer"}"
TLS_CERT_CA_FILEPATH="${TLS_CERT_CA_FILEPATH:-"/opt/app-root/src/secrets/ca_bundle.pem"}"

EOFXXX