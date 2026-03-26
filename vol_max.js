const Client = require('castv2-client').Client;
const host = '192.168.1.7';
const client = new Client();

client.connect(host, () => {
  console.log('Connected, getting current volume...');
  client.getVolume((err, vol) => {
    if (err) {
      console.log('Error getting volume:', err);
      client.close();
      return;
    }
    
    // Max volume
    console.log('Setting new volume to: 1.0 (MAX)');
    
    client.setVolume({ level: 1.0 }, (err, newVol) => {
      if (err) console.log('Error setting volume:', err);
      else console.log('Volume updated!');
      client.close();
    });
  });
});

client.on('error', (err) => {
  console.log('Error: %s', err.message);
  client.close();
});
