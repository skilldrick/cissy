(function () {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var bpm = 90;
  var beatLength = 60 / bpm;


  function playBufferFrom(buffer, when, offset, length, num) {
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    //source.loop = true;
    source.connect(ctx.destination);
    console.log(when, offset, length);
    source.start(when, offset, length);
    source.onended = function () { if (num > 1) playBufferFrom(buffer, 0, offset, length, num - 1); };
  }

  getAudioSource(ctx, 'cissy-strut.mp3', function (source) {
    var buff = source.buffer;

    playBufferFrom(buff, ctx.currentTime, 35.52, beatLength * 2, 4);
    //playBufferFrom(buff, ctx.currentTime + beatLength, 35.52, beatLength * 2, 4);
  });
})();
