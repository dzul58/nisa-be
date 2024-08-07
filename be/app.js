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
const KpiController = require('./controllers/kpiController');

app.use(cors({
  origin: ['https://moving-address.oss.myrepublic.co.id', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/upload_images', express.static('/home/web/upload_images'));
app.use('/videos', express.static('/home/web/upload_videos')); // New static directory for videos

app.get('/auto-login', LoginController.autoLogin);
app.post('/login', LoginController.login);

app.use(authentication);

app.get('/api/authorization-cs', AuthorizationController.authorizationCs);
app.get('/api/authorization-hpm', AuthorizationController.authorizationHpm);
app.get('/api/authorization-ops', AuthorizationController.authorizationOps);
app.get('/api/areas', HomepassController.searchAreas);
app.get('/api/homepass', HomepassController.getAllHomepassRequests);
app.get('/api/update-history', HomepassController.GetAllUpdateHistory);
app.get('/api/cs-kpi', authentication, KpiController.getAllCsKpi);
app.get('/api/hpm-kpi', authentication, KpiController.getAllHpmKpi);
app.post('/api/homepass', HomepassController.createHomepassRequest);
app.put('/api/update-ticket-taken', AuthorizationController.UpdateTicketTaken);

// Image upload endpoints
app.post('/api/upload-photo-front-of-house', upload.single('photo_front_of_house'), UploadController.uploadImageFrontOfHouse);
app.post('/api/upload-photo-left-of-house', upload.single('photo_left_of_house'), UploadController.uploadImageLeftOfHouse);
app.post('/api/upload-photo-right-of-house', upload.single('photo_right_of_house'), UploadController.uploadImageRightOfHouse);
app.post('/api/upload-photo-old-fat', upload.single('photo_old_fat'), UploadController.uploadImageOldFat);
app.post('/api/upload-photo-new-fat', upload.single('photo_new_fat'), UploadController.uploadImageNewFat);
app.post('/api/upload-survey-ops-photo1', upload.single('photo_survey_ops1'), UploadController.uploadSurveyOpsPhoto1);
app.post('/api/upload-survey-ops-photo2', upload.single('photo_survey_ops2'), UploadController.uploadSurveyOpsPhoto2);
app.post('/api/upload-survey-ops-photo3', upload.single('photo_survey_ops3'), UploadController.uploadSurveyOpsPhoto3);
app.post('/api/upload-survey-ops-photo4', upload.single('photo_survey_ops4'), UploadController.uploadSurveyOpsPhoto4);
app.post('/api/upload', upload.single('file'), UploadController.uploadFile);

// Video upload endpoint
app.post('/api/upload-video', upload.single('video'), UploadController.uploadVideo);

app.get('/api/status-taken/:id', AuthorizationController.updateTakenAccess);
app.get('/api/status-untaken/:id', AuthorizationController.updateUntakenAccess);
app.get('/api/homepass/:id', HomepassController.getHomepassRequestById);
app.put('/api/update-homepass/:id', HomepassController.updateHomepassRequest);
app.put('/api/update-ops/:id', HomepassController.updateSurveyOpsData);
app.put('/api/edit-homepass/:id', HomepassController.editHomepassRequest);

app.listen(port, () => {
  console.log(`NISA app listening on port ${port}`);
});
