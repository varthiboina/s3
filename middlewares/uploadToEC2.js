const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const uploadToEc2 = async (req, resizeBy, next) => {
  // Full path to your PEM file (Ensure this is correct)
  const pemKeyPath = process.env.PEM_KEY_PATH; 
  const localFolder = path.join(__dirname, 'uploads'); // Path to your local folder
  const ec2Ip = process.env.EC2_IP; // EC2 instance IP
  const ec2User = 'ec2-user'; // EC2 username
  const remotePath = '/home/ec2-user/'; // Destination folder on EC2

  // Ensure the PEM file has the correct permissions: only readable by the owner
  exec(`chmod 400 "${pemKeyPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error setting PEM key permissions:', err);
      return;
    }
    if (stderr) {
      console.error('Permission setting error:', stderr);
      return;
    }

    console.log('PEM Key permissions set successfully');

    // SCP command to upload files/folders
    const scpCommand = `scp -i "${pemKeyPath}" -r "${localFolder}" ${ec2User}@${ec2Ip}:${remotePath}`;

    // Execute SCP command to transfer the folder
    exec(scpCommand, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing SCP command:', err);
        return;
      }
      if (stderr) {
        console.error('SCP Error:', stderr);
        return;
      }
      console.log('SCP Output:', stdout);
      next();
    });
  });

  
};

module.exports = uploadToEc2;
