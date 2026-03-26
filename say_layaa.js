const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';
const text = 'Hello Layaa, Hello Layaa, Hello Layaa';
const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-IN&client=tw-ob`;

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
        title: 'Incoming Message',
        artist: 'OpenClaw TTS'
      }
    };
    player.load(media, { autoplay: true }, (err, status) => {
      if(err) {
         console.log('Error loading media:', err);
      } else {
         console.log('TTS loaded! Playing 3 times.');
      }
      setTimeout(() => client.close(), 7000); 
    });
  });
});

client.on('error', (err) => {
  console.log('Error:', err.message);
  client.close();
});
