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
    console.log('Current volume:', vol);
    
    // Increase volume by 0.2 (20%), max 1.0
    let newLevel = Math.min(1.0, (vol.level || 0.5) + 0.2);
    console.log('Setting new volume to:', newLevel);
    
    client.setVolume({ level: newLevel }, (err, newVol) => {
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
