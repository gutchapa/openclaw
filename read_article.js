const { execSync } = require('child_process');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const host = '192.168.1.7';
// Manually typed out chunks based on the photo provided
const chunks = [
    "From Venom to Voltage, by Ms. Sruthi Ramesh, 2nd Year, BTech Biotechnology, Manipal Institute of Technology.",
    "The ocean is often described as an expanse of mysteries, with life forms that have perfected survival strategies over millions of years.",
    "Among its most fascinating inhabitants are cone snails, small, unassuming creatures with a deadly secret: their venom.",
    "These predatory marine snails hunt using a complex cocktail of toxins called conotoxins.",
    "Essentially, cone snails operate a highly specialized biochemical arsenal.",
    "This venom is not just lethal to their prey; it contains hundreds of active peptides that target the nervous system with pinpoint precision.",
    "But why should biotechnology be interested in a deadly marine snail?",
    "The answer lies in the precision of the toxins.",
    "Traditional painkillers, like opioids, act broadly across the nervous system, often leading to addiction and severe side effects.",
    "Conotoxins, on the other hand, can be incredibly selective.",
    "For example, ziconotide, a drug derived from the venom of the Magician's cone snail, is used to treat severe chronic pain.",
    "It works by blocking specific calcium channels in the spinal cord, preventing pain signals from reaching the brain.",
    "This precision opens the door to developing new, non-addictive painkillers and studying complex neurological conditions.",
    "What makes this area of research even more exciting is the sheer diversity of conotoxins.",
    "With over 800 species of cone snails, and each species producing a unique venom profile, the ocean is basically a massive library of untapped neurological compounds."
];

async function playChunk(player, chunk) {
    return new Promise((resolve) => {
        // Break long strings into smaller chunks for the TTS URL limit if necessary
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk.trim())}&tl=en-IN&client=tw-ob`;
        const media = {
            contentId: url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED',
            metadata: { type: 0, metadataType: 3, title: 'Article Readout', artist: 'Sruthi Ramesh' }
        };
        player.load(media, { autoplay: true }, (err, status) => {
            if(err) { console.log('Error loading media:', err); resolve(); return; }
            
            const checkStatus = setInterval(() => {
                player.getStatus((err, status) => {
                    if (err) { clearInterval(checkStatus); resolve(); return; }
                    if (status && status.playerState === 'IDLE' && status.idleReason === 'FINISHED') {
                        clearInterval(checkStatus);
                        resolve();
                    }
                });
            }, 1000);
        });
    });
}

const client = new Client();
client.connect(host, () => {
    console.log('Connected to ' + host);
    client.launch(DefaultMediaReceiver, async (err, player) => {
        if (err) { console.log('Error:', err); client.close(); return; }
        
        console.log('Starting article playback...');
        for (const chunk of chunks) {
            console.log('Playing:', chunk);
            await playChunk(player, chunk);
        }
        console.log('Finished reading!');
        client.close();
    });
});

client.on('error', (err) => {
    console.log('Error:', err.message);
    client.close();
});
