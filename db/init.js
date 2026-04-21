const mysql = require("mysql2/promise");

async function initDatabase(config) {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    ssl: config.ssl,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\``,
  );
  await connection.query(`USE \`${config.database}\``);

  await connection.query(`
        CREATE TABLE IF NOT EXISTS tasks(  
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        due_date DATE,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);
  await connection.end();
}

module.exports = initDatabase;
