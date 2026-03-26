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
    
    // Finding a valid URL for Dhurandhar song would be ideal. I will use a direct MP3 if possible.
    const media = {
      contentId: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      contentType: 'audio/mp3',
      streamType: 'BUFFERED',
      metadata: {
        type: 0,
        metadataType: 3, // MusicTrackMediaMetadata
        title: 'Dhurandhar',
        artist: 'OpenClaw Cast'
      }
    };

    console.log('Loading media...');
    player.load(media, { autoplay: true }, (err, status) => {
      if(err) {
         console.log('Error loading media', err);
      } else {
         console.log('Media loaded! Playing song...');
      }
      client.close();
    });
  });
});

client.on('error', (err) => {
  console.log('Error: %s', err.message);
  client.close();
});
