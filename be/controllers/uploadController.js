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

      const imageUrl = `http://192.168.202.166:8080/${uniqueFilename}`;
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

      const imageUrl = `http://192.168.202.166:8080/${uniqueFilename}`;
      
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
        default:
          responseKey = 'imageUrl';
      }

      res.send({ message: 'File berhasil diunggah', [responseKey]: imageUrl });
    } catch (err) {
      console.error(`Error uploading ${imageType} image:`, err);
      res.status(500).send(`An error occurred while uploading the ${imageType} image.`);
    }
  }
}

module.exports = UploadController;