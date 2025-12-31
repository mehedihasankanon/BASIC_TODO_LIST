import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const { Pool } = pg;
const dbPassword = process.env.POSTGRES_U_PASS?.trim();

const pool = new Pool({
  user: "postgres",
  password: dbPassword,
  host: "localhost",
  port: 5432,
  database: "newtest",
});

export { pool };
