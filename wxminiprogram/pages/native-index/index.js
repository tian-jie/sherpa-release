// index.js


// 获取应用实例
const app = getApp()
import {
  WaveView
} from '../../utils/WaveView';

let recorderManager; // 录音管理器
let websocket; // websocket 连接

Page({

  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    recordFinished: false,
    isRecording: false,
    waveView: null,
    recordDuration: 0, // 录音时长
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
  onLoad() {
    var userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.redirectTo({
        url: '/pages/index/index',
      });
    }
    
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
    encodeBitRate: 96000,
    format: 'PCM',
    frameSize: 8
  }); // 开始录音
  recorderManager.onFrameRecorded((res) => {
    console.debug('recorderManager.onFrameRecorded...');
    console.info(res);
    websocket.send({
      data: res.frameBuffer,
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
  })
  recorderManager.stop() // 停止录音
}


function initWebsocket(that) {
  return new Promise((resolve, reject) => {
    console.debug('initWebsocket...');
    var socket = wx.connectSocket({
      url: 'wss://sherpa.zainot.com'
    });

    socket.onOpen(res => {
      // TODO: 检查确认是200连接成功才返回ok
      console.debug('websocket opened... ', res);
      websocket = socket;
      resolve(socket);
    });
  });
}