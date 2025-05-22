const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');

app.use(cors());
app.use(express.static(PUBLIC_DIR));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PUBLIC_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Upload with optional rename
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  let filename = req.file.filename;
  if (req.body.newName) {
    const ext = getFileExtension(req.file.originalname);
    const newFilename = req.body.newName + (ext ? '.' + ext : '');
    const oldPath = req.file.path;
    const newPath = path.join(PUBLIC_DIR, newFilename);
    fs.renameSync(oldPath, newPath);
    filename = newFilename;
  }
  res.json({
    message: 'File uploaded successfully',
    filename,
    path: `/public/${filename}`
  });
});

// Rename after upload
app.patch('/files/:filename', (req, res) => {
  const oldFilename = req.params.filename;
  const newName = req.body.newName;
  if (!newName) {
    return res.status(400).json({ error: 'newName is required' });
  }
  const ext = getFileExtension(oldFilename);
  const newFilename = newName + (ext ? '.' + ext : '');
  const oldPath = path.join(PUBLIC_DIR, oldFilename);
  const newPath = path.join(PUBLIC_DIR, newFilename);
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found or could not be renamed' });
    }
    res.json({ message: 'File renamed successfully', filename: newFilename, path: `/public/${newFilename}` });
  });
});

app.get('/files', (req, res) => {
  fs.readdir(PUBLIC_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to list files' });
    }
    const fileList = files.map(filename => ({
      name: filename,
      url: `/public/${filename}`
    }));
    res.json({ files: fileList });
  });
});


app.delete('/files/:filename', (req, res) => {
  const filePath = path.join(PUBLIC_DIR, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found or could not be deleted' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});