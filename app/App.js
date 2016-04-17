import { ctx } from 'sine/audio';
import { connect } from 'sine/util';
import { createGain } from 'sine/nodes';
import getAudioBuffer from 'sine/ajax';
import { SingleBufferSampler } from 'sine/sampler';
import Scheduler from 'sine/scheduler';

const channels = [];

// label name, beat number, length
const fastPattern = {
  loopLength: 32,
  offsetMap: {
    short1: 51.61,
    short2: 50.24
  },
  notes: [
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
  ]
};

const slowPattern = {
  loopLength: 8,
  offsetMap: {
    main: 35.52
  },
  notes: [
    ['main', 0, 8]
  ]
};

const cymbalPattern = {
  loopLength: 4,
  offsetMap: {
    cymbal: 42.73
  },
  notes: [
    ['cymbal', 0, 3]
  ]
};

const drumPattern = {
  loopLength: 32,
  offsetMap: {
    drum: 38.45
  },
  notes: [
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
  ]
};

const process = (buffer, pattern) => {
  const sampler = new SingleBufferSampler(buffer, pattern.offsetMap);
  pattern.sampler = sampler;

  // convert notes to format required by Scheduler
  pattern.notes = pattern.notes.map(note => {
    return { label: note[0], beatOffset: note[1], length: note[2], sampler: sampler };
  });

  return pattern;
};

const start = (buffer) => {
  // Create channels
  for (let i = 0; i < 4; i++) {
    channels[i] = createGain(0);
    connect(channels[i], ctx.destination);
  }

  channels[0].gain.value = 0.5; // Start with first channel turned up only

  channels.forEach(function (channel, index) {
    $('input[data-channel=' + index + ']').val(channel.gain.value);
  });

  // Format each pattern as needed by Scheduler
  [fastPattern, slowPattern, cymbalPattern, drumPattern].forEach((pattern) => {
    process(buffer, pattern);
  });

  connect(fastPattern.sampler, channels[0]);
  connect(slowPattern.sampler, channels[1]);
  connect(cymbalPattern.sampler, channels[2]);
  connect(drumPattern.sampler, channels[3]);

  const scheduler = new Scheduler(360, (note, when, length) => {
    note.sampler.play(note.label, when, length);
  });

  [fastPattern, slowPattern, cymbalPattern, drumPattern].forEach((pattern) => {
    scheduler.addLoop(pattern.loopLength, pattern.notes);
  });

  scheduler.start();
};

getAudioBuffer('cissy-strut-start.mp3').then((buffer) => {
  const $start = $('.start');
  $start.show();

  $start.click(function () {
    start(buffer);
    $start.hide();
  });

  $(".loading").hide();

  $('.sliders input').on("input", function () {
    const $el = $(this);
    const channel = $el.data('channel');
    const value = $el.val();
    channels[channel].gain.value = value;
  });
});
