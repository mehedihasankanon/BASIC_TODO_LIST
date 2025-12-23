const { Pool } = require("pg");
require("dotenv").config();

const dbPassword = (process.env.POSTGRES_U_PASS).trim();

const pool = new Pool({
  user: "postgres",
  password: dbPassword,
  host: "localhost",
  port: 5432,
  database: "newtest",
});

module.exports = { pool };
