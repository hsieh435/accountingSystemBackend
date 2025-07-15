import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "accountingSystem",
  password: "0000",
  port: 5432,
});

export default pool;
