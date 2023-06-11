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
            var sign = Request.Query["sign"];
            var userid = Request.Query["userid"];

            List<KeyValuePair<string, string>> kvs = new List<KeyValuePair<string, string>>();
            kvs.Add(new KeyValuePair<string, string>("appId", appId));
            kvs.Add(new KeyValuePair<string, string>("appSecret", appSecret));
            kvs.Add(new KeyValuePair<string, string>("nonce", nonce));
            kvs.Add(new KeyValuePair<string, string>("timestamp", timestamp.ToString()));
            kvs.Add(new KeyValuePair<string, string>("userid", userid));

            var s = SortParams(kvs);
            var checkSign = MD5Hash(s);

            //if (sign != checkSign)
            //{
            //    _logger.LogError($"checksign failed. sign={sign}, checkSign={checkSign}");
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







        private string CreateJwt()
        {

            // 1. 定义需要使用到的Claims
            var claims = new[]
            {
                new Claim("userid", "userid"),
            };

            // 2. 从 appsettings.json 中读取SecretKey
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));

            // 3. 选择加密算法
            var algorithm = SecurityAlgorithms.HmacSha256;

            // 4. 生成Credentials
            var signingCredentials = new SigningCredentials(secretKey, algorithm);

            // 5. 从 appsettings.json 中读取Expires
            var expires = Convert.ToDouble(_configuration["JWT:Expires"]);

            // 6. 根据以上，生成token
            var token = new JwtSecurityToken(
                _configuration["JWT:Issuer"],       //Issuer
                _configuration["JWT:Audience"],     //Audience
                claims,                             //Claims,
                DateTime.Now,                       //notBefore
                DateTime.Now.AddDays(expires),      //expires
                signingCredentials                  //Credentials
            );

            // 7. 将token变为string
            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            return jwtToken;
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
