const postgres = require('postgres');

const sql = postgres('postgres://fastapi_user:fastapi_password@localhost:5432/fastapi_db');

module.exports = sql;