import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const resultDbVersion = await database.query("SHOW server_version;");
  const valueDbVersion = resultDbVersion.rows[0].server_version;

  const resultDbMaxConnections = await database.query("SHOW max_connections;");
  const valueDbMaxConnections = resultDbMaxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const resultDbOpenedConnections = await database.query({
    text: "SELECT count(*)::int from pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const valueDbOpenedConnections = resultDbOpenedConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: valueDbVersion,
        max_connections: parseInt(valueDbMaxConnections),
        opened_connections: parseInt(valueDbOpenedConnections),
      },
    },
  });
}

export default status;
