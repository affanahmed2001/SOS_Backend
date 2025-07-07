const mysql = require("mysql2");

const connection = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    // port:process.env.db_port,
    waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// connection.connect((err) => {
//     if (err) {
//         console.error("Database Connection Failed:", err);
//         return;
//     }
//     console.log("Connected to MySQL Database");
// });


const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, result) => {
            if (error) {
                reject(error); 
            } else {
                resolve(result); 
            }
        });
    });
};

module.exports = { connection, executeQuery };
