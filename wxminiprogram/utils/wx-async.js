import {
  wechatSign,
  generateRandomString
} from '../utils/wechat-sign'

function wxHttpGetAsync(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'url',
      method: 'GET',
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        reject(res);
      }
    })
  })
}

function addSignature(data){
  data.appId = 'wx000001';
  data.appSecret = 'wx-app-appSecret';
  data.nonce = generateRandomString(16);
  data.timestamp = Math.round(new Date().getTime() / 1000, 0);
  return wechatSign(appId, appSecret, nonce, timestamp, params);
}

function wxRequestWithSignatureAsync(url, method='GET', data){
  return new Promise((resolve, reject) => {
    if(method=='POST'){
      data = addSignature(data);
    }
    wx.request({
      url: url,
      method: method,
      data: data,
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        reject(res);
      }
    })
  });
}

function wxLoginAsync(){
  return new Promise((resolve, reject) => {
    wx.login({
      success (res) {
        resolve(res.code);
      },
      fail(res){
        reject(res);
      }
    })
  });
}

export {
  wxHttpGet, wxLogin
}