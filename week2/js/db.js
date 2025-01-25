const postgres = require('postgres');
const dotenv = require('dotenv');

dotenv.config();

const user = process.env.TEST_DB_USER;
const secret = process.env.TEST_DB_USER_PW;
const host = process.env.TEST_DB_HOST;
const port = process.env.TEST_DB_PORT;
const db = process.env.TEST_DB_NAME;

const url = `postgres://${user}:${secret}@${host}:${port}/${db}`;



const sql = postgres(url);

module.exports = sql;