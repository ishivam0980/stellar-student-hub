import express from 'express';
import pg from 'pg';
import env from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
//install express pg ejs multer

const app = express();
const port = 3000;
env.config();

//body parser use
app.use(express.urlencoded({ extended: true }));

//use ejs
app.set('view engine', 'ejs');
app.use(express.static("public")); //to apply css 
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
console.log('Serving uploads from:', path.join(process.cwd(), 'public', 'uploads'));

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
console.log('Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created successfully');
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
} else {
  console.log('Uploads directory already exists');
}

// Check if the directory is writable
try {
  fs.accessSync(uploadDir, fs.constants.W_OK);
  console.log('Uploads directory is writable');
} catch (err) {
  console.error('Uploads directory is not writable:', err);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, 'student-' + req.body.roll + '-' + uniqueSuffix + fileExt);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports images - " + filetypes));
  }
});

// database connection and query and closing
const db = new pg.Client({
    user: "postgres", 
    host: "localhost", 
    database: "crud",
    password: process.env.DB_PASSWORD, 
    port: 5433, //enter the port number of your database usually 5432
  });

// Connect to database with proper error handling
try {
  await db.connect();
  console.log('Connected to PostgreSQL database');
  
  // Check if photo_path column exists, if not, add it
  const checkColumnQuery = `
    SELECT column_name FROM information_schema.columns 
    WHERE table_name='student' AND column_name='photo_path'`;
  const columnResult = await db.query(checkColumnQuery);
  
  if (columnResult.rows.length === 0) {
    console.log('Adding photo_path column to student table');
    await db.query(`ALTER TABLE student ADD COLUMN photo_path TEXT`);
  }
} catch (err) {
  console.error('Database connection error:', err);
  process.exit(1); // Exit if database connection fails
}

//get request
app.get('/', async (req, res) => {
  try {
      res.render("form");
  } catch (error) {
      console.error('Error rendering form:', error);
      res.status(500).send('Internal Server Error');
  }
});

//inserting data
app.post('/submit', upload.single('studentPhoto'), async (req, res) => {
  try {
    // Set photo path if a file was uploaded
    let photoPath = null;
    if (req.file) {
      photoPath = '/uploads/' + req.file.filename;
      console.log('File uploaded:', req.file);
      console.log('Photo path:', photoPath);
    }

    // Use parameterized queries to prevent SQL injection
    const query = "INSERT INTO student (name, roll, percentage, photo_path) VALUES ($1, $2, $3, $4)";
    await db.query(query, [req.body.name, req.body.roll, req.body.percentage, photoPath]);
    res.redirect("/");
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send("Error inserting data: " + error.message);
  }
});

// Handle photo upload
app.post('/upload-photo', upload.single('studentPhoto'), async (req, res) => {
  try {
    console.log('Photo upload request received');
    console.log('Request body:', req.body);
    
    if (!req.file) {
      console.error('No file in the request');
      throw new Error('No file uploaded');
    }
    
    console.log('File uploaded:', req.file);
    
    // Save file path to database
    const relativePath = '/uploads/' + req.file.filename;
    console.log('Relative path:', relativePath);
    
    // Check if student exists
    const checkQuery = "SELECT * FROM student WHERE roll = $1";
    const checkResult = await db.query(checkQuery, [req.body.roll]);
    
    if (checkResult.rows.length === 0) {
      // Student doesn't exist
      console.error('Student not found, roll:', req.body.roll);
      // Remove the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).send("Student not found. Please register the student first.");
    }
    
    console.log('Student found, updating record');
    // Update student record with photo path
    const updateQuery = "UPDATE student SET photo_path = $1 WHERE roll = $2";
    await db.query(updateQuery, [relativePath, req.body.roll]);
    console.log('Photo path updated in database');
    
    res.redirect("/");
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).send("Error uploading photo: " + error.message);
  }
});

//updating data
app.post('/update', async (req, res) => {
  try {
    // Use parameterized queries to prevent SQL injection
    const query = "UPDATE student SET name = $1, roll = $2, percentage = $3 WHERE roll = $4";
    await db.query(query, [req.body.updateName, req.body.updateRoll, req.body.updatePercentage, req.body.roll]);
    res.redirect("/");
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Error updating data: " + error.message);
  }
});

app.post('/show', async (req, res) => {
  try {
    // Use parameterized query to prevent SQL injection
    const query = "SELECT * FROM student WHERE roll = $1";
    const result = await db.query(query, [req.body.roll]);
    res.render("show", {result});
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).send("Error fetching student data: " + error.message);
  }
});

//deleting data
app.post('/delete', async (req, res) => {
  try {
    // Check if student has a photo to delete
    const checkQuery = "SELECT photo_path FROM student WHERE roll = $1";
    const checkResult = await db.query(checkQuery, [req.body.deleteRoll]);
    
    if (checkResult.rows.length > 0 && checkResult.rows[0].photo_path) {
      // Delete the photo file
      const photoPath = path.join(process.cwd(), 'public', checkResult.rows[0].photo_path);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Use parameterized query to prevent SQL injection
    const query = "DELETE FROM student WHERE roll = $1";
    await db.query(query, [req.body.deleteRoll]);
    
    // Check if the request came from the display page
    const referer = req.get('Referer');
    if (referer && referer.includes('/display')) {
      res.redirect("/display");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error deleting student data:", error);
    res.status(500).send("Error deleting student data: " + error.message);
  }
}); 

//displaying data
app.get('/display', async (req, res) => {
  try {
    const query = "SELECT * FROM student ORDER BY roll ASC";
    const result = await db.query(query);
    res.render("display", {result});
  } catch (error) {
    console.error("Error displaying student data:", error);
    res.status(500).send("Error displaying student data: " + error.message);
  }
});

// Debug route to check photo uploads
app.get('/debug-photos', async (req, res) => {
  try {
    // Get all students with photos
    const query = "SELECT roll, name, photo_path FROM student WHERE photo_path IS NOT NULL";
    const result = await db.query(query);
    
    // Check uploads directory
    let files = [];
    if (fs.existsSync(uploadDir)) {
      files = fs.readdirSync(uploadDir);
    }
    
    const debugInfo = {
      uploadDirectory: uploadDir,
      directoryExists: fs.existsSync(uploadDir),
      isWritable: true,
      files: files,
      studentsWithPhotos: result.rows,
      uploadsUrl: '/uploads'
    };
    
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
    } catch (err) {
      debugInfo.isWritable = false;
      debugInfo.writeError = err.message;
    }
    
    res.send(`
      <h1>Photo Upload Debug</h1>
      <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
    `);
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500).send("Error: " + error.message);
  }
});

// 404 handler - must be placed after all other routes
app.use((req, res) => {
  res.status(404).render("404");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Graceful shutdown function
 */
async function shutdown() {
  console.log('Closing database connection...');
  try {
    await db.end();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
}



