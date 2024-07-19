const express = require('express');
const HomepassController = require('./controllers/homepassController');
const { upload } = require('./middlewares/multer');
const UploadController = require('./controllers/uploadController');
const app = express();
const port = 8000;
const cors = require('cors');
const path = require('path');
const authentication = require('./middlewares/authentication');
const LoginController = require('./controllers/loginController');
const AuthorizationController = require('./controllers/authorizationController');

app.use(cors({
  origin: ['https://moving-address.oss.myrepublic.co.id', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/upload_images', express.static('/home/web/upload_images'));

app.get('/auto-login', LoginController.autoLogin);
app.post('/login', LoginController.login);

app.use(authentication);

app.get('/api/authorization-cs', AuthorizationController.authorizationCs);
app.get('/api/authorization-hpm', AuthorizationController.authorizationHpm);
app.get('/api/homepass', HomepassController.getAllHomepassRequests);
app.post('/api/homepass', HomepassController.createHomepassRequest);

// New image upload endpoints
app.post('/api/upload-photo-front-of-house', upload.single('photo_front_of_house'), UploadController.uploadImageFrontOfHouse);
app.post('/api/upload-photo-left-of-house', upload.single('photo_left_of_house'), UploadController.uploadImageLeftOfHouse);
app.post('/api/upload-photo-right-of-house', upload.single('photo_right_of_house'), UploadController.uploadImageRightOfHouse);
app.post('/api/upload-photo-old-fat', upload.single('photo_old_fat'), UploadController.uploadImageOldFat);
app.post('/api/upload-photo-new-fat', upload.single('photo_new_fat'), UploadController.uploadImageNewFat);
app.post('/api/upload', upload.single('file'), UploadController.uploadFile);

app.get('/api/status-taken/:id', AuthorizationController.updateTakenAccess) //buat endpoint get untuk response_hpm_status menjadi Taken
app.get('/api/status-untaken/:id', AuthorizationController.updateUntakenAccess)
app.get('/api/homepass/:id', HomepassController.getHomepassRequestById);
app.put('/api/update-homepass/:id', HomepassController.updateHomepassRequest);
app.put('/api/edit-homepass/:id', HomepassController.editHomepassRequest);

app.listen(port, () => {
  console.log(`NISA app listening on port ${port}`);
});