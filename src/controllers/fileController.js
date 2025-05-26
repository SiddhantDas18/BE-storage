const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../../public');

const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

const fileController = {
  uploadFile: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let filename = req.file.filename;
    if (req.body.newName) {
      const ext = getFileExtension(req.file.originalname);
      const newFilename = req.body.newName + (ext ? '.' + ext : '');
      
      // Check if file with same name exists in filesystem
      const newPath = path.join(PUBLIC_DIR, newFilename);
      if (fs.existsSync(newPath)) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'File with this name already exists' });
      }

      const oldPath = req.file.path;
      fs.renameSync(oldPath, newPath);
      filename = newFilename;
    }

    res.json({
      message: 'File uploaded successfully',
      filename,
      originalName: req.file.originalname,
      path: `/files/${filename}`
    });
  },

  listFiles: async (req, res) => {
    try {
      const files = fs.readdirSync(PUBLIC_DIR)
        .filter(file => fs.statSync(path.join(PUBLIC_DIR, file)).isFile())
        .map(filename => ({
          filename,
          path: `/files/${filename}`
        }));

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list files' });
    }
  },

  deleteFile: async (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(PUBLIC_DIR, filename);

    try {
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlinkSync(filepath);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
};

module.exports = fileController;