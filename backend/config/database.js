// config/database.js (PostgreSQL + Supabase compatible)
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL is not set. Database queries will fail until it is configured.");
}

const pgPool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const toPostgresSql = (sql = "") => {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
};

const formatResult = (result) => [result.rows, result];

const createConnectionWrapper = (client) => ({
  query: async (sql, params = []) => {
    const shouldAppendReturning =
      /^\s*insert\s+/i.test(sql) && !/\breturning\b/i.test(sql);

    const normalizedSql = shouldAppendReturning
      ? `${sql.trim().replace(/;$/, "")} RETURNING id`
      : sql;

    const pgSql = toPostgresSql(normalizedSql);
    const result = await client.query(pgSql, params);

    // mysql2 compatibility for INSERT/UPDATE calls that read insertId/affectedRows
    if (result.command === "INSERT") {
      const firstRow = result.rows?.[0] || {};
      return [
        {
          insertId:
            firstRow.id ??
            firstRow.insertid ??
            null,
          affectedRows: result.rowCount,
        },
      ];
    }

    if (result.command === "UPDATE" || result.command === "DELETE") {
      return [{ affectedRows: result.rowCount }];
    }

    return formatResult(result);
  },
  beginTransaction: async () => client.query("BEGIN"),
  commit: async () => client.query("COMMIT"),
  rollback: async () => client.query("ROLLBACK"),
  release: () => client.release(),
});

const pool = {
  query: async (sql, params = []) => {
    const client = await pgPool.connect();
    try {
      const wrapped = createConnectionWrapper(client);
      return await wrapped.query(sql, params);
    } finally {
      client.release();
    }
  },

  getConnection: async () => {
    const client = await pgPool.connect();
    return createConnectionWrapper(client);
  },

  end: async () => pgPool.end(),
};

// Optional: test connection once at startup
(async () => {
  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL database");
    client.release();
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL database:", error.message);
  }
})();

export default pool;