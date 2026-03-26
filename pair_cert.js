const { AndroidRemote } = require('androidtv-remote');
const crypto = require('crypto');
const forge = require('node-forge');

// Generate a valid self-signed certificate for the Android TV to accept
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
var attrs = [{ name: 'commonName', value: 'openclaw' }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey, forge.md.sha256.create());

const pemCert = forge.pki.certificateToPem(cert);
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

const host = '192.168.1.11'; // TV 1
const options = {
    pairing_port: 6467,
    remote_port: 6466,
    name: 'androidtv-remote',
    cert: { key: pemKey, cert: pemCert }
};

const remote = new AndroidRemote(host, options);

remote.on('secret', () => {
    console.log('[[WAITING_FOR_PIN]] Valid cert generated. Check TV screen.');
});

remote.start().catch(console.error);

setTimeout(() => { process.exit(0); }, 60000);
