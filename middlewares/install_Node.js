const { Client } = require('ssh2');
const fs = require('fs');
require('dotenv').config();


const cmds = [];

const runNpmInstall = () => {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✅ SSH connected.');
    conn.exec('cd /home/ec2-user/uploads/S3_linux && npm install && node server.js', (err, stream) => {
      if (err) return console.error('❌ Command error:', err);

      stream.on('close', (code) => {
        if (code === 0) {
          console.log('✅ npm install completed.');
        } else {
          console.error(`❌ npm install failed with code ${code}`);
        }
        conn.end();
      }).on('data', (data) => console.log(`📦 OUT: ${data}`))
        .stderr.on('data', (data) => console.error(`⚠️ ERR: ${data}`));
    });
  }).on('error', (err) => {
    console.error('❌ SSH failed:', err);
  }).connect({
    host: process.env.EC2_IP,
    port: 22,
    username: 'ec2-user',
    privateKey: fs.readFileSync(process.env.PEM_KEY_PATH),
  });
};

module.exports = runNpmInstall;
