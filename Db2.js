const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER , // replace with your MySQL username
  password: process.env.DB_PASSWORD, // replace with your MySQL password
  database: process.env.DB_NAME  // replace with your DB name
});

const createApplicationsTable = `
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  gender VARCHAR(20),
  qualification VARCHAR(255),
  contact VARCHAR(20),
  state VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  id_proof_path VARCHAR(255),
  resume_path VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL.');

  /* connection.query(createApplicationsTable, (err) => {
    if (err) throw err;
    console.log('Applications table created or already exists.');
  });

  connection.query(createReviewsTable, (err) => {
    if (err) throw err;
    console.log('Reviews table created or already exists.');
    
  }); */

   connection.query('SELECT * FROM applications', (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err.message);
      return;
    }

    console.log('--- Reviews Table Data ---');
    console.table(results);  // Pretty print in table format
  }); 

 /*   try {
    connection.execute('DELETE FROM applications'); // replace with your table name
    console.log('All rows deleted from applicationnodens table');
  } catch (err) {
    console.error('Failed to delete rows:', err);
  } finally {
    connection.end();
  } */

  
});
