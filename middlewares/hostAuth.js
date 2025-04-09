require('dotenv').config();  // Load environment variables from .env file
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Use environment variables for EC2 IP and known_hosts path
const ec2Ip = process.env.EC2_IP; 
const knownHostsPath = path.join('/home', 'ec2-user', '.ssh', 'known_hosts');

const addEc2ToKnownHosts = (req, res, next) => {
  // Check if the host already exists in the known_hosts file
  fs.readFile(knownHostsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading known_hosts file:', err);
      return next(); // Proceed to next middleware even if there is an error reading the file
    }

    // Check if the EC2 IP address already exists in the known_hosts file (skip adding if it does)
    if (data.includes(ec2Ip)) {
      console.log(`Host ${ec2Ip} already exists in known hosts.`);
      return next(); // Skip adding and proceed to next middleware
    }

    // Use ssh-keyscan to get the SSH key for the EC2 instance, with no prompt
    const command = `ssh-keyscan -H ${ec2Ip} >> "${knownHostsPath}"`;

    exec(command, { shell: true }, (execErr, stdout, stderr) => {
      if (execErr) {
        console.error('Error with ssh-keyscan:', execErr);
        console.error('stderr:', stderr);  // Log stderr for more details
        return next(); // Proceed to next middleware in case of error
      }

      console.log(`Successfully added ${ec2Ip} to known hosts`);
      next(); // Proceed to the next middleware after successful addition
    });
  });
};

module.exports = addEc2ToKnownHosts;

