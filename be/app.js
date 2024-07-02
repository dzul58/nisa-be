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
  origin: ['https://moving-address.oss.myrepublic.co.id'],
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
app.post('/api/upload', upload.single('file'), UploadController.uploadFile);
app.get('/api/homepass/:id', HomepassController.getHomepassRequestById);
app.put('/api/update-homepass/:id', HomepassController.updateHomepassRequest);
app.put('/api/edit-homepass/:id', upload.single('file'), HomepassController.editHomepassRequest);

app.listen(port, () => {
  console.log(`NISA app listening on port ${port}`);
});