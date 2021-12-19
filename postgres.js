const pgp = require("pg-promise")();

const connection = {
  host: "localhost",
  port: 25432,
  database: "recommender_system",
  user: "postgres",
  password: "password",
};

const db = pgp(connection);

module.exports = db;
