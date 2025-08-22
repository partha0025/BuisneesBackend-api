const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db'); 

const app = express();

function deleteAllUploads() {
  const dir = path.join(__dirname, 'uploads');

  fs.readdir(dir, (err, files) => {
    if (err) return console.error('Failed to list files:', err);

    for (const file of files) {
      fs.unlink(path.join(dir, file), err => {
        if (err) console.error('Failed to delete file:', file, err);
        else console.log('Deleted file:', file);
      });
    }
  });
}

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.post('/api/apply', upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      gender,
      qualification,
      contact,
      state,
      district,
      address
    } = req.body;

    const idProofPath = req.files['idProof'][0].path;
    const resumePath = req.files['resume'][0].path;

    const [result] = await db.execute(
      `INSERT INTO applications 
      (name, gender, qualification, contact, state, district, address, id_proof_path, resume_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, gender, qualification, contact, state, district, address, idProofPath, resumePath]
    );

    res.status(200).json({
      message: 'Application stored successfully!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error storing application:', error);
    res.status(500).json({ error: 'Failed to store application' });
  }
});


app.post('/api/reviews', async (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)',
      [name, rating, comment]
    );
    res.json({ message: 'Review submitted successfully!' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});


app.get('/api/reviews', async (req, res) => {
  try {
    console.log('Fetching reviews...');
    const [rows] = await db.execute('SELECT * FROM reviews ORDER BY created_at DESC');
    const total = rows.reduce((acc, r) => acc + r.rating, 0);
    const avg = rows.length ? total / rows.length : 0;
    res.json({ reviews: rows, averageRating: avg });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/delete-all', async (req, res) => {
  deleteAllUploads();
  await deleteAllTableData();
  res.send('All uploads and table data deleted');
});

app.get('/api/applications', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM applications ');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.delete("/api/applications/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const [result] = await db.execute(
      "DELETE FROM applications WHERE Contact = ?",
      [phone]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json({ message: "Person deleted successfully" });
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ message: "Server error" });
  }
});



app.listen(process.env.PORT, () => {
  console.log('Server running on port 3000');
});
