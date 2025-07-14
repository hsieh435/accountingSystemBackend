import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "accountSystem",
  password: "0000",
  port: 5432,
});

export default pool;
