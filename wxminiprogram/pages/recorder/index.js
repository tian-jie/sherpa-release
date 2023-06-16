// index.js
// 获取应用实例
const app = getApp()
import {
  WaveView
} from '../../utils/WaveView';

import {
  wxRequestGet,
  wxRequestPost,
  wxApiLogin,
  lameDecodeMp3
} from '../../utils/wx-async'

let recorderManager; // 录音管理器
let websocket; // websocket 连接


Page({

  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    recordFinished: false,
    isRecording: false,
    waveView: null,
    recordDuration: 0, // 录音时长
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  async onClickRecordButton() {
    console.debug('onClickRecordButton clicked');
    if (!this.data.isRecording) {
      this.setData({
        isRecording: true
      });
      await startRecord(this);
    } else {
      await stopRecord(this);
    }
  },
  async onLoad(options) {
    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
    await wxApiLogin(options.userid);
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

})


function initWaveView(that) {
  const query = this.createSelectorQuery();
  query.select('#canvas')
    .fields({
      node: true,
      size: true
    })
    .exec((res) => {
      const canvas = res[0].node
      const waveView = new WaveView({
        elem: canvas,
        width: 100,
        height: 100,
        scale: 1
      });
      that.setData({
        waveView: waveView
      });
    })
}

let firstRecordClipTime = -1;
let recorderTime = 0;
let recorderTimeIntervalHandler = -1;

async function startRecord(that) {
  console.debug('startRecord...');
  // 创建录音管理器
  recorderManager = wx.getRecorderManager();
  // 创建 websocket 连接
  await initWebsocket(that);
  console.debug('starting recorderManager...');

  recorderManager.start({
    sampleRate: 16000,
    numberOfChannels: 1,
    //encodeBitRate: 96000,
    format: 'mp3',
    frameSize: 8
  }); // 开始录音


  recorderTimeIntervalHandler = setInterval(() => {
    recorderTime++;
  }, 100);

  let firstRecordClipTime = -1;
  let leftchannel = []; // TODO: Use a single channel
  let recordingLength = 0; // number of samples so far

  recorderManager.onFrameRecorded(async (res) => {
    console.debug('recorderManager.onFrameRecorded...');
    if (firstRecordClipTime == -1) {
      console.log('firstRecordClipTime: ', firstRecordClipTime);
      firstRecordClipTime = recorderTime + 10;
    }
    var wav = await lameDecodeMp3(res.frameBuffer);
    let samples = new Float32Array(wav);
    console.log(samples);
    // let samples = new Float32Array(res.frameBuffer);
    // let samplesWithTime = new Float32Array(samples.length + 1);
    // samplesWithTime[0] = (recorderTime - firstRecordClipTime) / 10.0;
    // // 将samples复制到另外一个samplesWithTime里，从第一个字节开始复制
    // for (var i = 0; i < samples.length; ++i) {
    //   samplesWithTime[i + 1] = samples[i];
    // }

    // let buf = new Int16Array(samples.length);

    // for (var i = 0; i < samples.length; ++i) {
    //   let s = samples[i];
    //   // if (s >= 1)
    //   //   s = 1;
    //   // else if (s <= -1)
    //   //   s = -1;

    //   samples[i] = s;
    //   //buf[i] = s * 32767;
    //   buf[i] = s;
    // }
    // console.log('samples: ', buf);
    // leftchannel.push(buf);
    // recordingLength += 2048;

    //console.info(res);
    websocket.send({
      data: samplesWithTime,
      complete: (res) => {
        console.debug(res);
      }
    })
  })


}

function stopRecord(that) {
  that.setData({
    isRecording: false,
    recordFinished: true
  });
  recorderManager.stop() // 停止录音
  clearInterval(recorderTimeIntervalHandler);
}


function initWebsocket(that) {
  return new Promise((resolve, reject) => {
    console.debug('initWebsocket...');
    var socket = wx.connectSocket({
      url: 'wss://sherpa.zainot.com',
      success: function (res) {
        console.debug('wx.connectSocket success ', res);
      },
      fail: function (res) {
        console.error('wx.connectSocket fail ', res);
      },
    });

    socket.onOpen(res => {
      // TODO: 检查确认是200连接成功才返回ok
      console.debug('websocket opened... ', res);
      websocket = socket;
      resolve(socket);
    });

    socket.onError(res => {
      console.debug('websocket opened... ', res);
      websocket = socket;
      resolve(socket);
    });
  });
}