using MeetingCopilot.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text;

namespace MeetingCopilot.Services
{
    public class MeetingsService
    {
        private readonly IMongoCollection<MeetingRecord> _meetingsCollection;

        public MeetingsService(
            IOptions<MeetingCopilotDatabaseMongoSettings> databaseSettings)
        {
            var mongoClient = new MongoClient(
                databaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                databaseSettings.Value.DatabaseName);

            _meetingsCollection = mongoDatabase.GetCollection<MeetingRecord>(
                databaseSettings.Value.MeetingsCollectionName);
        }

        public async Task<List<MeetingRecord>> GetAsync() =>
            await _meetingsCollection.Find(_ => true).ToListAsync();

        public async Task<MeetingRecord?> GetAsync(string id) =>
            await _meetingsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<MeetingRecord>> GetByUserAsync(string userId) =>
            await _meetingsCollection.Find(x => x.UserId == userId).ToListAsync();

        public async Task CreateAsync(MeetingRecord newMeeting) =>
            await _meetingsCollection.InsertOneAsync(newMeeting);

        public async Task UpdateAsync(MeetingRecord updatedMeeting) =>
            await _meetingsCollection.ReplaceOneAsync(x => x.Id == updatedMeeting.Id, updatedMeeting);

        public async Task<string> CreateOrUpdateAsync(MeetingRecord meetingRecord)
        {
            if (meetingRecord.Id == null)
            {
                meetingRecord.Id = TimestampTo62Str(DateTime.Now.Ticks) + GenerateNonce(8);
                await _meetingsCollection.InsertOneAsync(meetingRecord);
            }
            else
            {
                await _meetingsCollection.ReplaceOneAsync(x => x.Id == meetingRecord.Id, meetingRecord);
            }
            return meetingRecord.Id;
        }


        public async Task RemoveAsync(string id) =>
            await _meetingsCollection.DeleteOneAsync(x => x.Id == id);

        public string GenerateNonce(int length=8, string including = "0123456789abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
        {
            StringBuilder nonce = new StringBuilder();
            Random random = new Random();
            for (int i = 0; i < length; i++)
            {
                nonce.Append(including[random.Next(including.Length)]);
            }
            return nonce.ToString();
        }

        public string TimestampTo62Str(long timestamp)
        {
            var chars = "0123456789abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var radix = chars.Length;
            var result = "";
            while (timestamp > 0)
            {
                int remainder = (int)(timestamp % radix);
                timestamp = timestamp / radix;
                result = chars[remainder] + result;
            }
            return result;
        }
    }
}
