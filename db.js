const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "127.0.0.1",
  user: "app_read_write",
  password: "Theansweris43",
  database: "my_app"
});

module.exports = connection;