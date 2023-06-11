function wxHttpGet(url) {
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

export {
  wxHttpGet
}