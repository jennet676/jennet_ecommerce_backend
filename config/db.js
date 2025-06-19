import pg from "pg";

export const db = new pg.Client({
  user: "postgres",

  host: "localhost",

  database: "job board project",

  password: "serdar090704",

  port: 5432,
});

db.connect();
