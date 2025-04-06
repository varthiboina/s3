const { exec } = require('child_process');
const path = require('path');

const uploadToEc2 = async (req, resizeBy, next) => {
  const pemKeyPath = 'C:/Users/dhanu/OneDrive/Desktop/NoSSHKeyPair.pem'; // Full path to your PEM file
  const localFolder = path.join(__dirname, 'uploads'); // Path to your local folder
  const ec2Ip = '3.87.72.50'; // EC2 instance IP
  const ec2User = 'ec2-user'; // EC2 username
  const remotePath = '/home/ec2-user/'; // Destination folder on EC2

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
  });

  next(); // Proceed to the next middleware or action
};

module.exports = uploadToEc2;
