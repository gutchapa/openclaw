const { AndroidRemote } = require('androidtv-remote');

const host = '192.168.1.22';
const options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'openclaw',
    cert: {}
};

const remote = new AndroidRemote(host, options);

remote.on('secret', () => {
    console.log('Secret required on BRAVIA. Waiting for PIN.');
});
remote.start().catch(console.error);
setTimeout(() => { remote.stop(); process.exit(0); }, 5000);
