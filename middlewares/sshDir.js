const fs = require('fs');
const path = require('path');

const setupSSHDirectory = async(req,res,next) => {
  const sshDir = path.join(process.env.HOME, '.ssh');
  const knownHostsPath = path.join(sshDir, 'known_hosts');
  
  // Check if .ssh directory exists
  if (!fs.existsSync(sshDir)) {
    console.log('Creating ~/.ssh directory');
    fs.mkdirSync(sshDir, { mode: 0o700 }); // Create the directory with 700 permissions
  }

  // Check if known_hosts file exists
  if (!fs.existsSync(knownHostsPath)) {
    console.log('Creating ~/.ssh/known_hosts file');
    fs.closeSync(fs.openSync(knownHostsPath, 'w')); // Create the file if it doesn't exist
    fs.chmodSync(knownHostsPath, 0o644); // Set the correct permissions for the file (644)
  }
  next();

  console.log('SSH directory and known_hosts file are set up.');
}

// Run the middleware
module.exports = setupSSHDirectory
