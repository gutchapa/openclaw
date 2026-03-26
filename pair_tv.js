const { AndroidRemote } = require('androidtv-remote');

const host = '192.168.1.11';
const options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'androidtv-remote',
    cert: {}
};

const remote = new AndroidRemote(host, options);

remote.on('secret', () => {
    console.log('Secret required. The TV should be displaying a code right now.');
    console.log('Check the TV screen for the code and provide it.');
});

remote.on('powered', (powered) => {
    console.log('Powered :', powered);
});

remote.on('volume', (volume) => {
    console.log('Volume :', volume);
});

remote.on('current_app', (current_app) => {
    console.log('Current App :', current_app);
});

remote.on('ready', async () => {
    console.log('Ready! Attempting to send power command.');
    remote.sendKey(AndroidRemote.KEYS.POWER, AndroidRemote.KEY_CODES.SHORT);
    console.log('Power command sent. Disconnecting...');
    remote.stop();
});

remote.start().catch(console.error);

