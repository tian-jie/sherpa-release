using MeetingCopilot.Models;
using MeetingCopilot.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MeetingCopilot.Controllers
{
    [Authorize]
    public class MeetingController : Controller
    {
        private readonly ILogger<MeetingController> _logger;
        private readonly MeetingsService _meetingService;

        public MeetingController(ILogger<MeetingController> logger, MeetingsService meetingsService)
        {
            _logger = logger;
            _meetingService = meetingsService;
        }

        [Route("index")]
        public async Task<IActionResult> Index()
        {
            // 进行身份认证，
            var userName = GetUserId();

            // 获取列表
            var meetingList = await _meetingService.GetByUserAsync(userName);

            return View(meetingList.OrderByDescending(a=>a.StartTime));
        }

        public async Task<IActionResult> ShowRecord(string meetingId)
        {
            var userName = GetUserId();

            // 获取列表
            var meeting = await _meetingService.GetAsync(meetingId);

            return View(meeting);
        }

        public async Task<IActionResult> CreateRecord(string meetingId)
        {
            var userName = GetUserId();

            // 获取列表
            var meetingList = await _meetingService.GetAsync(meetingId);

            return View(meetingList);
        }

        private string GetUserId()
        {
            // 进行身份认证，
            var identityName = ((ClaimsIdentity)User.Identity!).Claims.FirstOrDefault(a => a.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name");
            _logger.LogInformation($"user [{identityName!.Value}] logged in");
            return identityName!.Value;
        }
    }
}