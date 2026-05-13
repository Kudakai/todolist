const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "localhost",
  user: "app_read_write",
  password: "Theansweris43",
  database: "my_app"
});


// connection.connect((err) => {
//   if (err) {
//     console.log("DB connection failed");
//     console.log(err);
//     return;
//   }

//   console.log("Connected to MySQL 🐬");
// });

module.exports = connection;