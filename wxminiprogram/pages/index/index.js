// index.js
import {
  wxHttpGet, wxLogin
} from '../../utils/wx-async'


// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  async onLoad() {
    console.log('onLoad....');
    var code = await wx.login();
    //TODO: 用code根服务器要openid
    var userInfo = {
      "openid": "u000001",
      "session_key": "xxxxx",
      "unionid": "xxxxx",
      "errcode": 0,
      "errmsg": "xxxxx"
    };

    await wx.setStorage({key: 'userInfo', data: userInfo});

    if (userInfo) {
      console.log('userInfo: ', userInfo);
      wx.redirectTo({
<<<<<<< HEAD
        url: '/pages/recorder/index?userid=u0000001',
=======
        url: '/pages/native-index/index',
>>>>>>> 01f0d568833e1c5be32e61a57f8b6b308b090d51
      })

      // wx.redirectTo({
      //   url: '/pages/recorder/recorder?userid=u0000001',
      // })
    }
  },
  getUserProfile(e) {
    return new Promise((resolve, reject) => {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          resolve(res.userInfo);
        }
      })
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