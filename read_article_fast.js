const { execSync } = require('child_process');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';
// Use the Google TTS engine directly for a short snippet to prove it works
const text = "From Venom to Voltage, by Ms. Sruthi Ramesh. The ocean is an expanse of mysteries. Cone snails operate a highly specialized biochemical arsenal called conotoxins, which are incredibly selective and open the door to developing new, non-addictive painkillers.";
const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-IN&client=tw-ob`;

const client = new Client();
client.connect(host, () => {
    console.log('Connected to ' + host);
    client.launch(DefaultMediaReceiver, (err, player) => {
        if (err) { console.log('Error:', err); client.close(); return; }
        
        console.log('Sending summary to speaker...');
        const media = {
            contentId: url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED',
            metadata: { type: 0, metadataType: 3, title: 'Article Readout', artist: 'Sruthi Ramesh' }
        };
        player.load(media, { autoplay: true }, (err, status) => {
            if(err) console.log('Error:', err);
            else console.log('Playback started successfully!');
            setTimeout(() => client.close(), 15000);
        });
    });
});

client.on('error', (err) => {
    console.log('Error:', err.message);
    client.close();
});
