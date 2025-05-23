const fs = require('fs');
const { Client } = require('ssh2');
require('dotenv').config();

const cmdHandler = (req, res, next) => {
  const pemKeyPath = process.env.PEM_KEY_PATH; // Update with correct path on your Linux system
  const ec2Ip = process.env.EC2_IP; // EC2 public IP
  const ec2User = 'ec2-user'; // Amazon Linux default user
  const commandsToRun = []; // Example commands to execute on EC2, replace with your actual commands

  // Ensure PEM key has 400 permissions
  try {
    fs.chmodSync(pemKeyPath, 0o400);
    console.log('✔ PEM key permissions set to 400');
  } catch (err) {
    console.error('Failed to set key permissions:', err);
    next();  // Continue to the next middleware even on error
    return;   // Prevent further execution
  }

  const ssh = new Client();

  ssh.on('ready', () => {
    console.log('✔ SSH Connected');

    const runCommands = (index) => {
      if (index >= commandsToRun.length) {
        ssh.end();
        next();  // Continue to next middleware after all commands are done
        return;
      }

      ssh.exec(commandsToRun[index], (err, stream) => {
        if (err) {
          console.error('SSH command error:', err);
          ssh.end();
          next();  // Continue to next middleware even on error
          return;
        }
        stream.on('close', (code) => {
          console.log(`✔ Command executed with exit code ${code}: ${commandsToRun[index]}`);
          runCommands(index + 1); // Execute the next command in the list
        }).on('data', (data) => {
          console.log(`→ STDOUT: ${data.toString()}`);
        }).stderr.on('data', (data) => {
          console.error(`→ STDERR: ${data.toString()}`);
        });
      });
    };

    // Start executing commands
    runCommands(0);

  }).on('error', (err) => {
    console.error('SSH connection error:', err);
    next();  // Continue to next middleware on connection error
  }).connect({
    host: ec2Ip,
    username: ec2User,
    privateKey: fs.readFileSync(pemKeyPath), // Make sure the PEM path is correct for your Linux system
  });
};

module.exports = cmdHandler;
