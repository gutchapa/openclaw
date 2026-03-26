const { execSync } = require('child_process');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';

console.log('Fetching SoundCloud stream URL for Dhurandhar...');
const url = execSync('/tmp/yt-dlp -f bestaudio -g "scsearch1:dhurandhar"').toString().trim();
let title = 'Dhurandhar';
try {
  const jsonStr = execSync('/tmp/yt-dlp --dump-json "scsearch1:dhurandhar"').toString();
  const json = JSON.parse(jsonStr);
  title = json.title;
} catch(e) {}

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
      contentId: url,
      contentType: 'audio/mp3',
      streamType: 'BUFFERED',
      metadata: {
        type: 0,
        metadataType: 3, 
        title: title,
        artist: 'SoundCloud Cast'
      }
    };
    player.load(media, { autoplay: true }, (err, status) => {
      if(err) {
         console.log('Error loading media:', err);
      } else {
         console.log('Media loaded! Playing: ' + media.metadata.title);
      }
      setTimeout(() => client.close(), 2000);
    });
  });
});

client.on('error', (err) => {
  console.log('Error:', err.message);
  client.close();
});
