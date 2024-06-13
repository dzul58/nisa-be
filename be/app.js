const express = require('express');
const HomepassController = require('./controllers/homepassController');
const { upload } = require('./middlewares/multer');
const UploadController = require('./controllers/uploadController');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const authentication = require('./middlewares/authentication');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from /home/web/upload_images
app.use('/upload_images', express.static('/home/web/upload_images'));

app.post('/login', HomepassController.login)
app.use(authentication);
app.get('/api/homepass', HomepassController.getAllHomepassRequests);
app.post('/api/homepass', HomepassController.createHomepassRequest);
app.post('/api/upload', upload.single('file'), UploadController.uploadFile); // Using upload.single('file') as callback function
app.get('/api/homepass/:id', HomepassController.getHomepassRequestById);
app.put('/api/homepass/:id', upload.single('file'), HomepassController.updateHomepassRequest);

app.listen(port, () => {
  console.log(`NISA app listening on port ${port}`);
});
