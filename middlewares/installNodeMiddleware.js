const { Client } = require('ssh2');
const fs = require('fs');

const installNodeOnEC2 = (req, res, next) => {
  const conn = new Client();
  conn
    .on('ready', () => {
      // Check if Node.js is installed
      conn.exec('node -v', (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          return next();
        }
        stream
          .on('close', (code, signal) => {
            if (code !== 0) {
              // If Node.js is not installed, proceed with the installation
              console.log('Node.js is not installed, proceeding with installation.');
              conn.exec(
                'sudo yum install -y gcc-c++ make && curl -sL https://rpm.nodesource.com/setup_18.x | sudo -E bash - && sudo yum install -y nodejs',
                (installErr, installStream) => {
                  if (installErr) {
                    console.error('Install error:', installErr);
                    return next();
                  }
                  installStream
                    .on('close', (installCode, installSignal) => {
                      console.log(`Node.js installation exited with code ${installCode}`);
                      conn.end();
                      next();
                    })
                    .on('data', (data) => console.log(`STDOUT: ${data}`))
                    .stderr.on('data', (data) => console.error(`STDERR: ${data}`));
                }
              );
            } else {
              console.log('Node.js is already installed.');
              conn.end();
              next();
            }
          })
          .on('data', (data) => console.log(`STDOUT: ${data}`))
          .stderr.on('data', (data) => console.error(`STDERR: ${data}`));
      });
    })
    .connect({
      host: '3.87.72.50',
      port: 22,
      username: 'ec2-user',
      privateKey: fs.readFileSync('C:/Users/dhanu/OneDrive/Desktop/NoSSHKeyPair.pem'),
    });
};

module.exports = installNodeOnEC2;
