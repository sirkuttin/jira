'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Need to drop the view explicitly because we are changing the datatype of sync_status
    //
    // https://www.postgresql.org/docs/9.2/sql-createview.html
    // CREATE OR REPLACE VIEW is similar, but if a view of the same name already exists, it is replaced. The new query must generate the same columns that were generated by the existing view query (that is, the same column names in the same order and with the same data types), but it may add additional columns to the end of the list. The calculations giving rise to the output columns may be completely different.

    await queryInterface.sequelize.query(`DROP VIEW analytics.subscriptions`);
    await queryInterface.sequelize.query(`
    create or replace view analytics.subscriptions(id, github_installation_id, jira_host, created_at, updated_at, repo_sync_state, selected_repositories, sync_status, sync_warning, hours_since_created_at, hours_since_updated_at) as
      SELECT "Subscriptions".id,
            "Subscriptions"."gitHubInstallationId" AS github_installation_id,
            "Subscriptions"."jiraHost"             AS jira_host,
            "Subscriptions"."createdAt"            AS created_at,
            "Subscriptions"."updatedAt"            AS updated_at,
            "Subscriptions"."repoSyncState"        AS repo_sync_state,
            "Subscriptions"."selectedRepositories" AS selected_repositories,
            "Subscriptions"."syncStatus"::text     AS sync_status,
            "Subscriptions"."syncWarning"          AS sync_warning,
            EXTRACT(EPOCH FROM current_timestamp-"Subscriptions"."createdAt")/3600  AS hours_since_created_at,
            EXTRACT(EPOCH FROM current_timestamp-"Subscriptions"."updatedAt")/3600  AS hours_since_updated_at
      FROM "Subscriptions";
    `)
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DROP VIEW analytics.subscriptions`);
    await queryInterface.sequelize.query(`
    create or replace view analytics.subscriptions(id, github_installation_id, jira_host, created_at, updated_at, repo_sync_state, selected_repositories, sync_status, sync_warning) as
      SELECT "Subscriptions".id,
            "Subscriptions"."gitHubInstallationId" AS github_installation_id,
            "Subscriptions"."jiraHost"             AS jira_host,
            "Subscriptions"."createdAt"            AS created_at,
            "Subscriptions"."updatedAt"            AS updated_at,
            "Subscriptions"."repoSyncState"        AS repo_sync_state,
            "Subscriptions"."selectedRepositories" AS selected_repositories,
            "Subscriptions"."syncStatus"           AS sync_status,
            "Subscriptions"."syncWarning"          AS sync_warning
      FROM "Subscriptions";
    `)
  }
};
