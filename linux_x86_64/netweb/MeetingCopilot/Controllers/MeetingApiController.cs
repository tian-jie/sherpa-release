using MeetingCopilot.Models;
using MeetingCopilot.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAudio.Wave;
using System.Diagnostics;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using NAudio;
using NAudio.MediaFoundation;
using System.IO;

namespace MeetingCopilot.Controllers
{
    [Authorize]
    public class MeetingApiController : Controller
    {
        private readonly ILogger<MeetingController> _logger;
        private readonly MeetingsService _meetingService;


        public MeetingApiController(ILogger<MeetingController> logger, MeetingsService meetingsService)
        {
            _logger = logger;
            _meetingService = meetingsService;
        }

        [Route("/api/Meeting")]
        [HttpPost]
        public async Task<IActionResult> Post(MeetingRecord meetingRecord)
        {
            // 进行身份认证，
            var userName = GetUserId();
            meetingRecord.UserId = userName;
            // 保存
            var id = await _meetingService.CreateOrUpdateAsync(meetingRecord);
            if (meetingRecord.VoiceData != null)
            {
                //byte[] mp3Data = Convert.FromBase64String(meetingRecord.VoiceData.Substring(meetingRecord.VoiceData.IndexOf(',') + 1));
                byte[] mp3Data = Convert.FromBase64String(meetingRecord.VoiceData.Substring(22));
                using (FileStream mp3Stream = System.IO.File.Create($"/app/media/{meetingRecord.Id}.mp3"))
                {
                    mp3Stream.Write(mp3Data, 0, mp3Data.Length);
                }
                meetingRecord.VoiceUrl = $"/media/{meetingRecord.Id}.mp3";
            }
            return Ok(new { statusCode = "Success", meetingId = id });
        }

        private string GetUserId()
        {
            // 进行身份认证，
            var identityName = ((ClaimsIdentity)User.Identity!).Claims.FirstOrDefault(a => a.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name");
            _logger.LogInformation($"user [{identityName!.Value}] logged in");
            return identityName!.Value;
        }

        private async Task ToMp3(string wavBase64, string meetingId)
        {
            await Task.Run(() =>
            {
                byte[] wavData = Convert.FromBase64String(wavBase64);

                using (MemoryStream ms = new MemoryStream(wavData))
                {
                    using (WaveFileReader wavReader = new WaveFileReader(ms))
                    {

                        //Mp3FileWriter mp3Writer = new Mp3FileWriter("test.mp3");

                        //byte[] buffer = new byte[wavReader.WaveFormat.AverageBytesPerSecond];
                        //int read;
                        //while ((read = wavReader.Read(buffer, 0, buffer.Length)) > 0)
                        //{
                        //    mp3Writer.Write(buffer, 0, read);
                        //}

                        //mp3Writer.Close();
                        var mp3file = $"/app/media/{meetingId}.mp3";
                        MediaFoundationApi.Startup();
                        MediaFoundationEncoder.EncodeToMp3(wavReader, mp3file);
                    }
                }
            });
        }
    }
}