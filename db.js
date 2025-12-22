const { Pool } = require("pg");
const fs = require("fs");

// import password from a local file for security
const dbPassword = fs.readFileSync(__dirname + "/db_pass.txt", "utf8").trim();

const pool = new Pool({
  user: "postgres",
  password: dbPassword,
  host: "localhost",
  port: 5432,
  database: "newtest",
});

const userInfoPool = new Pool({
  user: "postgres",
  password: dbPassword,
  host: "localhost",
  port: 5432,
  database: "user_info",
});

module.exports = pool;

module.exports = userInfoPool;
