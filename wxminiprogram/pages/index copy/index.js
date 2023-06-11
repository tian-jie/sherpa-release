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
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
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
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
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
      url: 'wss://asr.zainot.com'
    });

    socket.onOpen(res => {
      // TODO: 检查确认是200连接成功才返回ok
      console.debug('websocket opened... ', res);
      websocket = socket;
      resolve(socket);
    });
  });
}