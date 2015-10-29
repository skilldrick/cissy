(function () {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var bpm = 90;
  var beatLength = 60 / bpm;
  var quarterBeatLength = beatLength / 4;
  var buffer;
  var channels = [];

  // Locations of each sample within cissy-strut.mp3
  var labels = {
    main: 35.52,
    short1: 51.61,
    short2: 50.24,
    cymbal: 42.73,
    drum: 38.45,
  };

  // label name, quarter-beat number, length
  var fastPattern = [
    ['short1',  0,      1],
    ['short1',  2,      1],
    ['short1',  5,      1],
    ['short1',  7,      1],
    ['short1',  8,      1],
    ['short1',  9,      1],
    ['short2', 10,      1],
    ['short2', 11,      1],
    ['short1', 12,      1],
    ['short1', 13,      1],
    ['short2', 14,      1],
    ['short1', 15,    .33],
    ['short1', 15.33, .33],
    ['short1', 15.66, .33],
    ['short1', 16,      1],
    ['short1', 18,      1],
    ['short1', 21,      1],
    ['short1', 23,    .33],
    ['short1', 23.33, .33],
    ['short1', 23.66, .33],
    ['short1', 24,      1],
    ['short1', 25,      1],
    ['short2', 26,      1],
    ['short2', 27,      1],
    ['short1', 28,      1],
    ['short1', 29,      1],
    ['short2', 30,    .33],
    ['short2', 30.33, .33],
    ['short2', 30.66,   1]
  ];

  var slowPattern = [
    ['main',  0, 8],
    ['main',  8, 8],
    ['main', 16, 8],
    ['main', 24, 8]
  ];

  var cymbalPattern = [
    ['cymbal',  0, 3],
    ['cymbal',  4, 3],
    ['cymbal',  8, 3],
    ['cymbal', 12, 3],
    ['cymbal', 16, 3],
    ['cymbal', 20, 3],
    ['cymbal', 24, 3],
    ['cymbal', 28, 3]
  ];

  var drumPattern = [
    ['drum',  0, 1],
    ['drum',  2, 1],
    ['drum',  4, 1],
    ['drum',  6, 1],
    ['drum',  8, 2],
    ['drum', 10, 1],
    ['drum', 12, 2],
    ['drum', 14, 1],
    ['drum', 15, 1],
    ['drum', 16, 1],
    ['drum', 18, 1],
    ['drum', 20, 2],
    ['drum', 22, 1],
    ['drum', 23, 1],
    ['drum', 24, 2],
    ['drum', 26, 1],
    ['drum', 28, 1],
    ['drum', 29, 1],
    ['drum', 30, 2]
  ];

  function playBufferFrom(when, offset, length, output) {
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(output);
    source.start(when, offset, length);
  }

  // start is measured in quarter-beats from start of playing
  // length is measured in quarter-beats
  function playSample(label, start, length, output) {
    playBufferFrom(
      ctx.currentTime + start * quarterBeatLength,
      labels[label],
      length * quarterBeatLength,
      output
    );
  }

  // pattern is one of the four patterns above
  function playPattern(pattern, patternNumber, output) {
    pattern.forEach(function (sample) {
      playSample(
        sample[0],
        patternNumber * 32 + sample[1],
        sample[2],
        output
      );
    });
  }

  function start() {
    // Create four channels, each of which is a gain node connected to the
    // destination node
    for (var i = 0; i < 4; i++) {
      channels[i] = ctx.createGain();
      channels[i].gain.value = 0;
      channels[i].connect(ctx.destination);
    }

    channels[0].gain.value = 0.5; // Start with first channel turned up only

    // Queue up each of the four patterns to play on the four channels,
    // 32 times.
    for (var i = 0; i < 32; i++) {
      playPattern(slowPattern, i, channels[0]);
      playPattern(fastPattern, i, channels[1]);
      playPattern(cymbalPattern, i, channels[2]);
      playPattern(drumPattern, i, channels[3]);
    }

    channels.forEach(function (channel, index) {
      $('input[data-channel=' + index + ']').val(channel.gain.value);
    });
  }

  getAudioBuffer(ctx, 'cissy-strut-start.mp3', function (_buffer) {
    buffer = _buffer; // Expose buffer in outer scope

    var $start = $('.start');
    $start.show();

    $start.click(function () {
      start();
      $start.hide();
    });

    $(".loading").hide();
  });

  $('.sliders input').on("input", function () {
    var $el = $(this);
    var channel = $el.data('channel');
    var value = $el.val();
    channels[channel].gain.value = value;
  });
})();
