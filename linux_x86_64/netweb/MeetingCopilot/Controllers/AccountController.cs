using MeetingCopilot.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Sockets;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MeetingCopilot.Controllers
{
    public class AccountController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;
        //private readonly SignInManager<SysUser> _signInManager;
        //private readonly UserManager<SysUser> _userManager;


        public AccountController(ILogger<HomeController> logger, IConfiguration configuration
            //SignInManager<SysUser> signInManager,
            //UserManager<SysUser> userManager
            )
        {
            _logger = logger;
            _configuration = configuration;
            //_signInManager = signInManager;
            //_userManager = userManager;
        }

        [HttpGet]
        [Route("wxlogin")]
        public async Task<IActionResult> WxLogin()
        {
            // 计算签名，做身份认证
            var appId = Request.Query["appId"];
            var appSecret = "wx-app-appSecret";
            var nonce = Request.Query["nonce"];
            var timestamp = int.Parse(Request.Query["timestamp"]);
            var sign = Request.Query["sign"].ToString();
            var userid = Request.Query["userid"];

            List<KeyValuePair<string, string>> kvs = new List<KeyValuePair<string, string>>();
            kvs.Add(new KeyValuePair<string, string>("appId", appId));
            kvs.Add(new KeyValuePair<string, string>("appSecret", appSecret));
            kvs.Add(new KeyValuePair<string, string>("nonce", nonce));
            kvs.Add(new KeyValuePair<string, string>("timestamp", timestamp.ToString()));
            kvs.Add(new KeyValuePair<string, string>("userid", userid));

            var s = SortParams(kvs);
            var checkSign = MD5Hash(s);

            _logger.LogDebug($"connects: {s}, sign: {sign}, checkSign: {checkSign}");

            //// 检查签名
            //if (sign.ToLower() != checkSign.ToLower())
            //{
            //    _logger.LogError($"checksign failed. sign={sign}, checkSign={checkSign}");
            //    return StatusCode(401);
            //}

            //// 检查有效时间，超过30秒的，认为是无效登录
            //var currentTime = DateTime.UtcNow;
            //var signTime = new DateTime(1970, 1, 1).AddSeconds(timestamp);

            //var timeDiff = Math.Abs((signTime.Ticks - currentTime.Ticks) / TimeSpan.TicksPerSecond);
            //_logger.LogDebug($"timeDiff={timeDiff}");
            //if (timeDiff > 30)
            //{
            //    _logger.LogError($"time check failed. timeDiff={signTime.Ticks/ TimeSpan.TicksPerSecond} - {currentTime.Ticks/ TimeSpan.TicksPerSecond} = {timeDiff}");
            //    return StatusCode(401);
            //}

            var user = new SysUser()
            {
                UserName = userid
            };


            var principal = new ClaimsPrincipal(new ClaimsIdentity[]
            {
                new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userid),
                }, "Cookies", "user", "role")
            });

            await HttpContext.SignInAsync(principal);

            return RedirectToAction("Index", "Meeting");
        }


        public string MD5Hash(string input)
        {
            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }


        // 将给定的List<KeyValuePair>的内容，按照key的顺序进行字母序排序，然后用md5进行加密
        private string SortParams(List<KeyValuePair<string, string>> kvs)
        {
            StringBuilder sb = new StringBuilder();
            var newKvs = kvs.OrderBy(a => a.Key).ToList();
            foreach (var kv in newKvs)
            {
                sb.Append(kv.Value);
            }
            return sb.ToString();
        }

    }
}
