const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const addEc2ToKnownHosts = (req, res, next) => {
  const ec2Ip = '3.87.72.50'; // EC2 IP address (hardcoded or retrieved from the request)
  const knownHostsPath = path.join('C:', 'Users', 'dhanu', '.ssh', 'known_hosts'); // Windows path

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

    // Use ssh-keyscan to get the SSH key for the EC2 instance, using the shell for proper redirection
    const command = `ssh-keyscan -H ${ec2Ip} >> "${knownHostsPath}"`; // Using shell redirection
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
