// This file copies and modifies code
// from https://mdn.github.io/web-dictaphone/scripts/app.js
// and https://gist.github.com/meziantou/edb7217fddfbb70e899e

var socket;
var recognition_text = [];

function getDisplayResult() {
  let i = 0;
  let ans = '';
  for (let s in recognition_text) {
    if (recognition_text[s] == '') continue;

    ans += '' + i + ': ' + recognition_text[s] + '\n';
    i += 1;
  }
  return ans;
}

const messageHtmlTemplate = `
      <div class="text-block" id="message_@@ID" onclick="playAudio(@@starttime, @@endtime)">
      <div class="time-block">@@starttime_format</div>
      <span>@@message</span>
      </div>
`;

function initWebSocket() {
  console.log('Creating websocket')
  let protocol = 'ws://';
  if (window.location.protocol == 'https:') {
    protocol = 'wss://'
  }
  let server_ip = serverIpInput;
  let server_port = serverPortInput;
  console.log('protocol: ', protocol);
  console.log('server_ip: ', server_ip);
  console.log('server_port: ', server_port);

  let uri = protocol + server_ip + ':' + server_port;
  console.log('uri', uri);
  socket = new WebSocket(uri);

  // Listen for messages
  socket.addEventListener('message', function (event) {
    let message = JSON.parse(event.data);
    if (message.segment in recognition_text) {
      recognition_text[message.segment].message = message.text;
      currentRecogize.innerHTML = message.text;
    } else {
      recognition_text.push({ message: message.text, segment: message.segment, startTime: audioCtx.currentTime });
      if (message.segment > 0) {
        var lastSegment = recognition_text[message.segment - 1];
        lastSegment.endTime = audioCtx.currentTime;
        // 写入当前页面
        if (lastSegment.message.length > 0) {
          var messageBlockHtml = messageHtmlTemplate
            .replace("@@ID", lastSegment.segment)
            .replace("@@starttime", lastSegment.startTime)
            .replace("@@starttime_format", transTime(lastSegment.startTime))
            .replace("@@message", lastSegment.message)
            .replace("@@endtime", lastSegment.endTime);

          resultArea.innerHTML = resultArea.innerHTML + messageBlockHtml;
        }
        currentRecogize.innerHTML = "";
      }
    }

    console.log('Received message: ', event.data);
  });
}

window.onload = (event) => {
  console.log('page is fully loaded');
  console.log('protocol', window.location.protocol);
  console.log('port', window.location.port);
  // if (window.location.protocol == 'https:') {
  //   document.getElementById('ws-protocol').textContent = 'wss://';
  // }
  console.log(JSON.stringify(window.location));

  serverIpInput = window.location.hostname;
  serverPortInput = window.location.port;
};

var serverIpInput = '';
var serverPortInput = '';

const recordBtn = document.getElementById('record-button');
const canvas = document.getElementById('canvas');
const mainSection = document.querySelector('.container');
const recordImage = document.getElementById('record-image');
const currentRecogize = document.getElementById('current-recognize');
const resultArea = document.getElementById('results');
const audioSection = document.getElementById('audio-section');
const audioDuration = document.getElementById('audio-duration');
let audio; //= document.getElementsByTagName('audio')[0];

let audioCtx;
const canvasCtx = canvas.getContext('2d');
let mediaStream;
let analyser;

let expectedSampleRate = 16000;
let recordSampleRate;  // the sampleRate of the microphone
let recorder = null;   // the microphone
let leftchannel = [];  // TODO: Use a single channel

let recordingLength = 0;  // number of samples so far
let isRecording = false;
if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };

  let onSuccess = function (stream) {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    console.log(audioCtx);
    recordSampleRate = audioCtx.sampleRate;
    console.log('sample rate ' + recordSampleRate);

    // creates an audio node from the microphone incoming stream
    mediaStream = audioCtx.createMediaStreamSource(stream);

    var bufferSize = 2048;
    var numberOfInputChannels = 2;
    var numberOfOutputChannels = 2;
    if (audioCtx.createScriptProcessor) {
      recorder = audioCtx.createScriptProcessor(
        bufferSize, numberOfInputChannels, numberOfOutputChannels);
    } else {
      recorder = audioCtx.createJavaScriptNode(
        bufferSize, numberOfInputChannels, numberOfOutputChannels);
    }
    console.log(recorder);

    recorder.onaudioprocess = function (e) {
      let samples = new Float32Array(e.inputBuffer.getChannelData(0))
      samples = downsampleBuffer(samples, expectedSampleRate);

      let buf = new Int16Array(samples.length);
      for (var i = 0; i < samples.length; ++i) {
        let s = samples[i];
        if (s >= 1)
          s = 1;
        else if (s <= -1)
          s = -1;

        samples[i] = s;
        buf[i] = s * 32767;
      }

      socket.send(samples);

      leftchannel.push(buf);
      recordingLength += bufferSize;
    };

    visualize(stream);
    mediaStream.connect(analyser);

    recordBtn.onclick = function () {
      if (!isRecording) {
        startRecord();
      }
      else {
        stopRecord();
      }
    };

    function startRecord() {
      initWebSocket();
      mediaStream.connect(recorder);
      mediaStream.connect(analyser);
      recorder.connect(audioCtx.destination);

      console.log('recorder started');

      canvas.style.display = "block";
      recordImage.style.display = "none";

      isRecording = true;

    }

    function stopRecord() {
      console.log('recorder stopped');

      socket.send('Done');
      console.log('Sent Done');

      socket.close();

      console.log(recognition_text);

      // stopBtn recording
      recorder.disconnect(audioCtx.destination);
      mediaStream.disconnect(recorder);
      mediaStream.disconnect(analyser);

      isRecording = false;
      canvas.style.display = "none";
      recordImage.style.display = "block";
      audioSection.style.display = "block";
      audio = document.createElement('audio');
      audio.setAttribute('controls', '');
      //audioSection.appendChild(audio);
      //audio.controls = true;
      let samples = flatten(leftchannel);
      const blob = toWav(samples);

      leftchannel = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      audioDuration.innerText = transTime(audio.duration);

      console.log('recorder stopped');
      initAudioEvent();
    };
  };

  let onError = function (err) {
    console.log('The following error occured: ' + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log('getUserMedia not supported on your browser!');
  alert('您的浏览器不支持getUserMedia！请更换浏览器后重试。');
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  if (!analyser) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // source.connect(analyser);
  // analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = '#f44336';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 10;
    canvasCtx.strokeStyle = '#fff';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

window.onresize = function () {
};

window.onresize();
function flatten(listOfSamples) {
  let n = 0;
  console.log(listOfSamples);
  for (let i = 0; i < listOfSamples.length; ++i) {
    n += listOfSamples[i].length;
  }
  let ans = new Int16Array(n);

  let offset = 0;
  for (let i = 0; i < listOfSamples.length; ++i) {
    ans.set(listOfSamples[i], offset);
    offset += listOfSamples[i].length;
  }
  return ans;
}

function toWav(samples) {
  let buf = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buf);

  // http://soundfile.sapp.org/doc/WaveFormat/
  //                   F F I R
  view.setUint32(0, 0x46464952, true);               // chunkID
  view.setUint32(4, 36 + samples.length * 2, true);  // chunkSize
  //                   E V A W
  view.setUint32(8, 0x45564157, true);  // format
  //
  //                      t m f
  view.setUint32(12, 0x20746d66, true);          // subchunk1ID
  view.setUint32(16, 16, true);                  // subchunk1Size, 16 for PCM
  view.setUint32(20, 1, true);                   // audioFormat, 1 for PCM
  view.setUint16(22, 1, true);                   // numChannels: 1 channel
  view.setUint32(24, expectedSampleRate, true);  // sampleRate
  view.setUint32(28, expectedSampleRate * 2, true);  // byteRate
  view.setUint16(32, 2, true);                       // blockAlign
  view.setUint16(34, 16, true);                      // bitsPerSample
  view.setUint32(36, 0x61746164, true);              // Subchunk2ID
  view.setUint32(40, samples.length * 2, true);      // subchunk2Size

  let offset = 44;
  for (let i = 0; i < samples.length; ++i) {
    view.setInt16(offset, samples[i], true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

// this function is copied from
// https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js#L46
function downsampleBuffer(buffer, exportSampleRate) {
  if (exportSampleRate === recordSampleRate) {
    return buffer;
  }
  var sampleRateRatio = recordSampleRate / exportSampleRate;
  var newLength = Math.round(buffer.length / sampleRateRatio);
  var result = new Float32Array(newLength);
  var offsetResult = 0;
  var offsetBuffer = 0;
  while (offsetResult < result.length) {
    var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    var accum = 0, count = 0;
    for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
};

function playAudio(startTime, endTime) {
  var duration = endTime - startTime;
  console.log("startTime: ", startTime);
  console.log("endTime: ", endTime);
  console.log("duration: ", duration);
  audio.currentTime = startTime;
  audio.play();
  audioPlayer.src = './pic/audiopause.png';
  setTimeout(() => {
    audio.pause(); 
    audioPlayer.src = './pic/audioplay.png';
  }, duration * 1000);
}


function initAudioEvent() {
  var audioPlayer = document.getElementById('audioPlayer');

  // 点击播放/暂停图片时，控制音乐的播放与暂停
  audioPlayer.addEventListener('click', function () {
    // 监听音频播放时间并更新进度条
    audio.addEventListener('timeupdate', function () {
      document.getElementById('audioCurTime').innerText = transTime(audio.currentTime);
    }, false);

    // 监听播放完成事件
    audio.addEventListener('ended', function () {
      audioEnded();
    }, false);

    // 改变播放/暂停图片
    if (audio.paused) {
      // 开始播放当前点击的音频
      audio.play();
      audioPlayer.src = './pic/audiopause.png';
    } else {
      audio.pause();
      audioPlayer.src = './pic/audioplay.png';
    }
  }, false);

}

/**
* 播放完成时把进度调回开始的位置
*/
function audioEnded() {
  document.getElementById('audioCurTime').innerText = transTime(0);
  document.getElementById('audioPlayer').src = './pic/audioplay.png';
}

/**
* 音频播放时间换算
* @param {number} value - 音频当前播放时间，单位秒
*/
function transTime(value) {
  var time = "";
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ":" + m + ":" + s);
  } else {
    time = formatTime(m + ":" + s);
  }

  return time;
}

/**
* 格式化时间显示，补零对齐
* eg：2:4  -->  02:04
* @param {string} value - 形如 h:m:s 的字符串 
*/
function formatTime(value) {
  var time = "";
  var s = value.split(':');
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? ("0" + s[i]) : s[i];
    time += ":";
  }
  time += s[i].length == 1 ? ("0" + s[i]) : s[i];

  return time;
}