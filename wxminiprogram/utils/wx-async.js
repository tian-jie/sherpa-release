import {
  wechatSign,
  generateRandomString
} from '../utils/wechat-sign'

<<<<<<< HEAD
import {lame } from '../utils/lame'

//const baseUrl = 'https://asr.zainot.com'
const baseUrl = 'http://localhost:5001'

function wxRequestGet(url) {
=======
function wxHttpGetAsync(url) {
>>>>>>> 01f0d568833e1c5be32e61a57f8b6b308b090d51
  return new Promise((resolve, reject) => {
    wx.request({
      url: url + (url.indexOf('?') > 0 ? '&Token=' : '?Token=') + wx.getStorageSync('token'),
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

<<<<<<< HEAD
function wxRequestPost(url, data) {
  return new Promise((resolve, reject) => {
    data.Token = wx.getStorageSync('token');
    wx.request({
      url: url,
      method: 'POST',
=======
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
>>>>>>> 01f0d568833e1c5be32e61a57f8b6b308b090d51
      data: data,
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        reject(res);
      }
    })
<<<<<<< HEAD
  })
}

async function wxApiLogin(userid) {
    var appId = 'wx000001';
    var appSecret = 'wx-app-appSecret';
    var nonce = generateRandomString(16);
    var timestamp = Math.round(new Date().getTime() / 1000, 0);
    var params = {
      userid: userid
    }

    // 做签名
    var sign = wechatSign(appId, appSecret, nonce, timestamp, params);
    // // 到服务器获取jwt token
    // var result = await wxHttpGet(baseUrl + `/home/login?appid=${appId}&nonce=${nonce}&timestamp=${timestamp}&sign=${sign}&userid=${params.userid}`);
    // // 如果正确获得了jwt token，则继续访问
    // 生成跳转页面
    var webUrl = baseUrl + `/account/wxlogin?appid=${appId}&nonce=${nonce}&timestamp=${timestamp}&sign=${sign}&userid=${params.userid}`;
    console.log(webUrl);
    // this.setData({
    //   webUrl: webUrl
    // })
    var userData = await wxRequestGet(webUrl);
    console.log(userData.data.Data.ApiToken);
    wx.setStorageSync('token', userData.data.Data.ApiToken);
    return userData.data.Data;
}

function lameDecodeMp3(mp3ArrayBuffer){
    return new Promise((resolve, reject) => {
      lame.decodeMP3(mp3ArrayBuffer, (pcmChunk) => {
        /* PCM 数据 */
        resolve(pcmChunk);
       });

    });
}

export {
  wxRequestGet,
  wxRequestPost,
  wxApiLogin,
  lameDecodeMp3
=======
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
>>>>>>> 01f0d568833e1c5be32e61a57f8b6b308b090d51
}