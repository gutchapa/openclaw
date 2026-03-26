const { AndroidRemote } = require('androidtv-remote');
const host = '192.168.1.22'; // BRAVIA
const options = {
    pairing_port: 6467,
    remote_port: 6466,
    name: 'OpenClaw API',
    cert: {} 
};

const remote = new AndroidRemote(host, options);

remote.on('secret', () => {
    console.log('[[WAITING_FOR_PIN]] The TV should be showing the 6-digit code right now.');
});

remote.on('error', (err) => {
    console.log('Error:', err);
});

console.log('Sending pairing request to', host, '...');
remote.start().catch(e => console.log("Failed to start", e));

setTimeout(() => {
    console.log('Timeout expired.');
    process.exit(0);
}, 120000);
