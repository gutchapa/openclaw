const { execSync } = require('child_process');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';

// Skip scraping and use a direct sample MP3 URL to see if it's the scraper failing or the speaker
const client = new Client();
client.connect(host, () => {
  console.log('Connected to ' + host);
  client.launch(DefaultMediaReceiver, (err, player) => {
    if (err) {
      console.log('Error:', err);
      client.close();
      return;
    }
    const media = {
      // Just a 15-second test MP3
      contentId: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      contentType: 'audio/mp3',
      streamType: 'BUFFERED',
      metadata: {
        type: 0,
        metadataType: 3, 
        title: 'Dhurandhar First Edition',
        artist: 'Test Audio'
      }
    };
    player.load(media, { autoplay: true }, (err, status) => {
      if(err) {
         console.log('Error loading media:', err);
      } else {
         console.log('Media loaded! Status:', status);
      }
      // Wait to ensure playback starts
      setTimeout(() => client.close(), 5000);
    });
  });
});

client.on('error', (err) => {
  console.log('Error:', err.message);
  client.close();
});
