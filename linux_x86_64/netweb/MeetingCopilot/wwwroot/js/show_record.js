
const audioSection = document.getElementById('audio-section');
const audioDuration = document.getElementById('audio-duration');
let audio; //= document.getElementsByTagName('audio')[0];


let recordingLength = 0;  // number of samples so far
let isRecording = false;


function setAudioUrl(audioURL) {
    audio = document.createElement('audio');
    audio.setAttribute('controls', '');
    audio.src = audioURL;

    audio.addEventListener('canplay', (event) => {
        console.log('audio.duration: ', audio.duration);
        audioDuration.innerText = transTime(audio.duration);
        initAudioEvent();
  });

}

let timeoutHandle = -1;

function playAudio(startTime, endTime) {
    var duration = endTime - startTime;
    console.log('record piece: ', startTime, endTime, duration);
    audio.currentTime = startTime;
    audio.play();
    audioPlayer.src = '/pic/audiopause.png';
    if (timeoutHandle != -1) {
        clearTimeout(timeoutHandle);
        timeoutHandle = -1;
    }
    timeoutHandle = setTimeout(() => {
        audio.pause();
        audioPlayer.src = '/pic/audioplay.png';
        timeoutHandle = -1;
    }, duration * 1000);
}

let currentHilightIndex = -1;

function initAudioEvent() {
    var audioPlayer = document.getElementById('audioPlayer');

    // 监听音频播放时间并更新进度条
    audio.addEventListener('timeupdate', function () {
        document.getElementById('audioCurTime').innerText = transTime(audio.currentTime);
        // 从recognition_text里面找出startTime小于audio.currentTime的最后一条记录
        var index = recognition_text.findLastIndex((element) => {
            return element.startTime <= audio.currentTime;
        }, audio.currentTime);

        // 根据播放的时间，自动选中当前的识别段落
        if (index != currentHilightIndex) {
            // TODO: 以防万一，全部取消高亮，然后将选定的再高亮
            var toHilightElement = document.getElementById('message_' + index);
            if (toHilightElement != null) {
                toHilightElement.className = "text-playing-block";
                if (currentHilightIndex != -1) {
                    document.getElementById('message_' + currentHilightIndex).className = "text-block"
                }
                currentHilightIndex = index;
            }
            else {
                if (currentHilightIndex != -1) {
                    document.getElementById('message_' + currentHilightIndex).className = "text-block"
                }
                currentHilightIndex = -1;
            }

        }

    }, false);

    // 监听播放完成事件
    audio.addEventListener('ended', function () {
        audioEnded();
    }, false);

    // 点击播放/暂停图片时，控制音乐的播放与暂停
    audioPlayer.addEventListener('click', function () {

        // 改变播放/暂停图片
        if (audio.paused) {
            // 开始播放当前点击的音频
            audio.play();
            audioPlayer.src = '/pic/audiopause.png';
        } else {
            audio.pause();
            audioPlayer.src = '/pic/audioplay.png';
        }
    }, false);

}

/**
* 播放完成时把进度调回开始的位置
*/
function audioEnded() {
    document.getElementById('audioCurTime').innerText = transTime(0);
    document.getElementById('audioPlayer').src = '/pic/audioplay.png';
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


function base64ToBlob(base64) {
    console.log(base64);

    var byteString = atob(base64);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab]);
    return blob;
}