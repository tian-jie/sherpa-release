import md5 from "./md5";

function wechatSign(appId, appSecret, nounce, timestamp, params) {

  var appkey = 'VerificationSign2019'; //key是自定义
  var newObj = objKeySort(params);
  let connects = '';
  params.appId = appId;
  params.appSecret = appSecret;
  params.nounce = nounce;
  params.timestamp = timestamp;

  
  for (let item in newObj) {
    connects += newObj[item];
  }

  return md5(connects);
}


function objKeySort(obj, typesort = 'sort') { //排序的函数
  if (typesort == 'sort') {
    var newkey = Object.keys(obj).sort(); //升序
  } else {
    var newkey = Object.keys(obj).sort().reverse(); //降序
  }
  //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
  var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
  for (var i = 0; i < newkey.length; i++) { //遍历newkey数组
    newObj[newkey[i]] = obj[newkey[i]]; //向新创建的对象中按照排好的顺序依次增加键值对
  }
  return newObj; //返回排好序的新对象
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    randomString += chars[index];
  }
  return randomString;
}

export {
  wechatSign,
  generateRandomString
}