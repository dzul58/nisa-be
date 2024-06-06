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
}

module.exports = UploadController;
