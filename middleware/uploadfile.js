const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const recordingupload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      console.log('Rejected file type:', file.mimetype);
      callback(new Error('Only image, PDF, and Word documents are allowed.'));
    }
  }
});

module.exports = recordingupload;
