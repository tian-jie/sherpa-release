import {
  wechatSign,
  generateRandomString
} from '../../utils/wechat-sign'
// pages/recorder.js

import {
  wxHttpGet
} from '../../utils/wx-async'

const baseUrl = 'https://asr.zainot.com'
//const baseUrl = 'https://localhost:7270'
Page({

  /**
   * Page initial data
   */
  data: {
    webUrl: baseUrl + '/meeting/index'
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    console.log(options)
    var appId = 'wx000001';
    var appSecret = 'wx-app-appSecret';
    var params = {
      userid: options.userid
    }

    var nonce = generateRandomString(16);
    var timestamp = Math.round(new Date().getTime() / 1000, 0);
    // 做签名
    var sign = wechatSign(appId, appSecret, nonce, timestamp, params);
    // // 到服务器获取jwt token
    // var result = await wxHttpGet(baseUrl + `/home/login?appid=${appId}&nonce=${nonce}&timestamp=${timestamp}&sign=${sign}&userid=${params.userid}`);
    // // 如果正确获得了jwt token，则继续访问
    // 生成跳转页面
    var webUrl = baseUrl + `/wxlogin?appid=${appId}&nonce=${nonce}&timestamp=${timestamp}&sign=${sign}&userid=${params.userid}`;
    console.log(webUrl);
    this.setData({
      webUrl: webUrl
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})