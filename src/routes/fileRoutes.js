const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');

const router = express.Router();
const PUBLIC_DIR = path.join(__dirname, '../../public');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PUBLIC_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/files', fileController.listFiles);
router.delete('/files/:filename', fileController.deleteFile);

module.exports = router;