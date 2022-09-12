const fs = require('fs');
const ytdl = require('ytdl-core');
const download = ytdl('https://www.youtube.com/watch?v=u55JJxFSP_8', { filter: 'audioonly' });
const writeStream = fs.createWriteStream('./audio.mp3');
download.pipe(writeStream);
