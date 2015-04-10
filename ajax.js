function getData(filename, cb) {
  request = new XMLHttpRequest();
  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    cb(request.response);
  }
  request.send();
}

function getAudioSource(ctx, filename, cb) {
  getData(filename, function (audioData) {
    ctx.decodeAudioData(audioData,
      function (buffer) {
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        cb(source);
      },
      function (e) {
        console.log("Error decoding audio data" + e.err);
      }
    );
  });
}
