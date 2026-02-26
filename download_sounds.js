const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      if (response.statusCode === 301 || response.statusCode === 302) {
          return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Using direct github raw URLs for reliable audio files (no 404s/captchas)
async function run() {
    await download("https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/audio/key_press_1.mp3", "./public/sounds/type.mp3");
    await download("https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/audio/error.mp3", "./public/sounds/error.mp3");
    console.log("Done");
}
run();
