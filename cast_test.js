const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';
const client = new Client();

client.connect(host, () => {
  console.log('Connected to ' + host);

  client.launch(DefaultMediaReceiver, (err, player) => {
    if (err) {
      console.log('Error launching receiver: ' + err);
      client.close();
      return;
    }
    
    // Using a very reliable, absolute direct URL that Google Cast natively supports
    const media = {
      contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      contentType: 'video/mp4',
      streamType: 'BUFFERED',
      metadata: {
        type: 0,
        metadataType: 0,
        title: 'OpenClaw Audio Test', 
      }
    };

    console.log('Loading media...');
    player.load(media, { autoplay: true }, (err, status) => {
      if(err) {
         console.log('Error loading media:', err);
      } else {
         console.log('Media loaded! Status:', status);
      }
      
      // Let it play for a few seconds before closing our control socket
      setTimeout(() => client.close(), 5000);
    });
  });
});

client.on('error', (err) => {
  console.log('Error: %s', err.message);
  client.close();
});
