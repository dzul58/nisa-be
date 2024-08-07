const path = require('path');
const Client = require('ssh2-sftp-client');
const crypto = require('crypto');

class UploadController {
  static async uploadFile(req, res) {
    try {
      const uploadedFile = req.file;
      if (!uploadedFile) {
        return res.status(400).send('No files were uploaded.');
      }

      // Generate a unique identifier for the filename
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const originalName = path.parse(uploadedFile.originalname).name;
      const extension = path.extname(uploadedFile.originalname);
      const uniqueFilename = `${originalName}-${uniqueSuffix}${extension}`;

      const remoteFilePath = `/home/web/upload_images/${uniqueFilename}`;

      const sftp = new Client();
      await sftp.connect({
        host: '192.168.202.166', // IP server Ubuntu
        port: '22', // Port SSH (default 22)
        username: 'web', // Replace with your username on the Ubuntu server
        password: 'Myrep123!' // Replace with your password on the Ubuntu server
      });

      // Upload the file buffer directly
      await sftp.put(uploadedFile.buffer, remoteFilePath);

      sftp.end();

      const imageUrl = `https://ma-storage.oss.myrepublic.co.id/${uniqueFilename}`;
      res.send({ message: 'File berhasil diunggah', imageUrl });
    } catch (err) {
      console.error('Error uploading file:', err);
      res.status(500).send('An error occurred while uploading the file.');
    }
  }

  
  static async uploadImageFrontOfHouse(req, res) {
    await UploadController.handleImageUpload(req, res, 'front_of_house');
  }

  static async uploadImageLeftOfHouse(req, res) {
    await UploadController.handleImageUpload(req, res, 'left_of_house');
  }

  static async uploadImageRightOfHouse(req, res) {
    await UploadController.handleImageUpload(req, res, 'right_of_house');
  }

  static async uploadImageOldFat(req, res) {
    await UploadController.handleImageUpload(req, res, 'old_fat');
  }

  static async uploadImageNewFat(req, res) {
    await UploadController.handleImageUpload(req, res, 'new_fat');
  }

  static async uploadSurveyOpsPhoto1(req, res) {
    await UploadController.handleImageUpload(req, res, 'survey_ops_1');
  }
  
  static async uploadSurveyOpsPhoto2(req, res) {
    await UploadController.handleImageUpload(req, res, 'survey_ops_2');
  }
  
  static async uploadSurveyOpsPhoto3(req, res) {
    await UploadController.handleImageUpload(req, res, 'survey_ops_3');
  }
  
  static async uploadSurveyOpsPhoto4(req, res) {
    await UploadController.handleImageUpload(req, res, 'survey_ops_4');
  }

  static async handleImageUpload(req, res, imageType) {
    try {
      const uploadedFile = req.file;
      if (!uploadedFile) {
        return res.status(400).send('No files were uploaded.');
      }

      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const originalName = path.parse(uploadedFile.originalname).name;
      const extension = path.extname(uploadedFile.originalname);
      const uniqueFilename = `${imageType}-${originalName}-${uniqueSuffix}${extension}`;

      const remoteFilePath = `/home/web/upload_images/${uniqueFilename}`;

      const sftp = new Client();
      await sftp.connect({
        host: '192.168.202.166',
        port: '22',
        username: 'web',
        password: 'Myrep123!'
      });

      await sftp.put(uploadedFile.buffer, remoteFilePath);

      sftp.end();

      const imageUrl = `https://ma-storage.oss.myrepublic.co.id/images/${uniqueFilename}`;
      
      // Adjust the imageUrl name based on the image type
      // Menyesuaikan nama imageUrl berdasarkan jenis gambar
      let responseKey;
      switch (imageType) {
        case 'front_of_house':
          responseKey = 'imageUrlFrontOfHouse';
          break;
        case 'left_of_house':
          responseKey = 'imageUrlLeftOfHouse';
          break;
        case 'right_of_house':
          responseKey = 'imageUrlRightOfHouse';
          break;
        case 'old_fat':
          responseKey = 'imageUrlOldFat';
          break;
        case 'new_fat':
          responseKey = 'imageUrlNewFat';
          break;
        case 'survey_ops_1':
          responseKey = 'imageUrlSurveyOps1';
          break;
        case 'survey_ops_2':
          responseKey = 'imageUrlSurveyOps2';
          break;
        case 'survey_ops_3':
          responseKey = 'imageUrlSurveyOps3';
          break;
        case 'survey_ops_4':
          responseKey = 'imageUrlSurveyOps4';
          break;
        default:
          responseKey = 'imageUrl';
      }

      res.send({ message: 'File berhasil diunggah', [responseKey]: imageUrl });
    } catch (err) {
      console.error(`Error uploading ${imageType} image:`, err);
      res.status(500).send(`An error occurred while uploading the ${imageType} image.`);
    }
  }

  static async uploadVideo(req, res) {
    try {
      const uploadedFile = req.file;
      if (!uploadedFile) {
        return res.status(400).send('No video was uploaded.');
      }
  
      // Generate a unique identifier for the filename
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const originalName = path.parse(uploadedFile.originalname).name;
      const extension = path.extname(uploadedFile.originalname);
      const uniqueFilename = `video-${originalName}-${uniqueSuffix}${extension}`;
  
      const remoteFilePath = `/home/web/upload_videos/${uniqueFilename}`;
  
      const sftp = new Client();
      await sftp.connect({
        host: '192.168.202.166',
        port: '22',
        username: 'web',
        password: 'Myrep123!'
      });
  
      // Upload the video file buffer directly
      await sftp.put(uploadedFile.buffer, remoteFilePath);
  
      sftp.end();
  
      const videoUrl = `https://ma-storage.oss.myrepublic.co.id/videos/${uniqueFilename}`;
      res.send({ message: 'Video berhasil diunggah', videoUrl });
    } catch (err) {
      console.error('Error uploading video:', err);
      res.status(500).send('An error occurred while uploading the video.');
    }
  }
}

module.exports = UploadController;