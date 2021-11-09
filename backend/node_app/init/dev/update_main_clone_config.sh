#!/usr/bin/env bash
set -o nounset
set -o errexit
set -o pipefail

declare -A CLONE_CONFIG_RECORD=(\
  [id]="${CLONE_CONFIG_RECORD_ID:-1}" \
  [clone_name]="${CLONE_CONFIG_RECORD_CLONE_NAME:-'gamechanger'}" \
  [search_module]="${CLONE_CONFIG_RECORD_SEARCH_MODULE:-'policy/policySearchHandler'}" \
  [export_module]="${CLONE_CONFIG_RECORD_EXPORT_MODULE:-'simple/simpleExportHandler'}" \
  [createdAt]="${CLONE_CONFIG_RECORD_CREATED_AT:-now()}" \
  [updatedAt]="${CLONE_CONFIG_RECORD_UPDATED_AT:-now()}" \
  [display_name]="${CLONE_CONFIG_RECORD_DISPLAY_NAME:-'GAMECHANGER'}" \
  [title_bar_module]="${CLONE_CONFIG_RECORD_TITLE_BAR_MODULE:-'policy/policyTitleBarHandler'}" \
  [navigation_module]="${CLONE_CONFIG_RECORD_NAVIGATION_MODULE:-'policy/policyNavigationHandler'}" \
  [card_module]="${CLONE_CONFIG_RECORD_CARD_MODULE:-'policy/policyCardHandler'}" \
  [is_live]="${CLONE_CONFIG_RECORD_IS_LIVE:-true}" \
  [url]="${CLONE_CONFIG_RECORD_URL:-'gamechanger'}" \
  [permissions_required]="${CLONE_CONFIG_RECORD_PERMISSIONS_REQUIRED:-false}" \
  [clone_to_sipr]="${CLONE_CONFIG_RECORD_CLONE_TO_SIPR:-false}" \
  [show_graph]="${CLONE_CONFIG_RECORD_SHOW_GRAPH:-true}" \
  [show_tutorial]="${CLONE_CONFIG_RECORD_SHOW_TUTORIAL:-false}" \
  [show_crowd_source]="${CLONE_CONFIG_RECORD_SHOW_CROWD_SOURCE:-false}" \
  [show_feedback]="${CLONE_CONFIG_RECORD_SHOW_FEEDBACK:-false}" \
  [config]=${CLONE_CONFIG_RECORD_CONFIG:-$'\'{"esIndex": "gamechanger"}\''} \
  [graph_module]=${CLONE_CONFIG_GRAPH_MODULE:-"'policy/policyGraphHandler'"} \
  [main_view_module]=${CLONE_CONFIG_MAIN_VIEW_MODULE:-"'policy/policyMainViewHandler'"} \
  [available_at]=${CLONE_CONFIG_AVAILABLE_AT:-$'\'{"all", "localhost"}\''} \
  [s3_bucket]=${CLONE_CONFIG_S3_BUCKET:-"''"}
)

cat <<EOFXXX

INSERT INTO
  clone_meta (
    id,
    clone_name,
    search_module,
    export_module,
    "createdAt",
    "updatedAt",
    display_name,
    title_bar_module,
    navigation_module,
    card_module,
    is_live,
    url,
    permissions_required,
    clone_to_sipr,
    show_graph,
    show_tutorial,
    show_crowd_source,
    show_feedback,
    config,
    graph_module,
    main_view_module,
    available_at,
    s3_bucket
  )
  VALUES (
    ${CLONE_CONFIG_RECORD[id]},
    ${CLONE_CONFIG_RECORD[clone_name]},
    ${CLONE_CONFIG_RECORD[search_module]},
    ${CLONE_CONFIG_RECORD[export_module]},
    ${CLONE_CONFIG_RECORD[createdAt]},
    ${CLONE_CONFIG_RECORD[updatedAt]},
    ${CLONE_CONFIG_RECORD[display_name]},
    ${CLONE_CONFIG_RECORD[title_bar_module]},
    ${CLONE_CONFIG_RECORD[navigation_module]},
    ${CLONE_CONFIG_RECORD[card_module]},
    ${CLONE_CONFIG_RECORD[is_live]},
    ${CLONE_CONFIG_RECORD[url]},
    ${CLONE_CONFIG_RECORD[permissions_required]},
    ${CLONE_CONFIG_RECORD[clone_to_sipr]},
    ${CLONE_CONFIG_RECORD[show_graph]},
    ${CLONE_CONFIG_RECORD[show_tutorial]},
    ${CLONE_CONFIG_RECORD[show_crowd_source]},
    ${CLONE_CONFIG_RECORD[show_feedback]},
    ${CLONE_CONFIG_RECORD[config]},
    ${CLONE_CONFIG_RECORD[graph_module]},
    ${CLONE_CONFIG_RECORD[main_view_module]},
    ${CLONE_CONFIG_RECORD[available_at]}
    ${CLONE_CONFIG_RECORD[s3_bucket]}
  )
  ON CONFLICT (clone_name)
  DO
    UPDATE
      SET id = ${CLONE_CONFIG_RECORD[id]},
      SET clone_name = ${CLONE_CONFIG_RECORD[clone_name]},
      SET search_module = ${CLONE_CONFIG_RECORD[search_module]},
      SET export_module = ${CLONE_CONFIG_RECORD[export_module]},
      SET "updatedAt" = ${CLONE_CONFIG_RECORD[updatedAt]},
      SET display_name = ${CLONE_CONFIG_RECORD[display_name]},
      SET title_bar_module = ${CLONE_CONFIG_RECORD[title_bar_module]},
      SET navigation_module = ${CLONE_CONFIG_RECORD[navigation_module]},
      SET card_module = ${CLONE_CONFIG_RECORD[card_module]},
      SET is_live = ${CLONE_CONFIG_RECORD[is_live]},
      SET url = ${CLONE_CONFIG_RECORD[url]},
      SET permissions_required = ${CLONE_CONFIG_RECORD[permissions_required]},
      SET clone_to_sipr = ${CLONE_CONFIG_RECORD[clone_to_sipr]},
      SET show_graph = ${CLONE_CONFIG_RECORD[show_graph]},
      SET show_tutorial = ${CLONE_CONFIG_RECORD[show_tutorial]},
      SET show_crowd_source = ${CLONE_CONFIG_RECORD[show_crowd_source]},
      SET show_feedback = ${CLONE_CONFIG_RECORD[show_feedback]},
      SET config = ${CLONE_CONFIG_RECORD[config]},
      SET graph_module = ${CLONE_CONFIG_RECORD[graph_module]},
      SET main_view_module = ${CLONE_CONFIG_RECORD[main_view_module]},
      SET available_at = ${CLONE_CONFIG_RECORD[available_at]},
      SET s3_bucket = ${CLONE_CONFIG_RECORD[s3_bucket]}
  ;

EOFXXX

