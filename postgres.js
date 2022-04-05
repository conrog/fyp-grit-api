const pgp = require("pg-promise")();
require("dotenv").config();

const connection = {
  host: process.env.PSQL_HOSTNAME,
  port: process.env.PSQL_PORT,
  database: process.env.PSQL_DB_NAME,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASSWORD,
};

const db = pgp(connection);

module.exports = db;
