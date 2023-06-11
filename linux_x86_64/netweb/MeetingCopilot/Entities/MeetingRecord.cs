using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using NuGet.Packaging.Signing;

namespace MeetingCopilot.Models;

public class MeetingRecord
{
    [BsonId]
    public string Id { get; set; } = "";

    [BsonElement("Name")]
    public string Name { get; set; } = "";

    public string UserId { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public Timestamp Duration { get; set; } = null!;

    public string VoiceUrl { get; set; } = "";
    public string VoiceData { get; set; } = "";

    public List<PieceOfSentence> Sentences { get; set; } = new List<PieceOfSentence>();
}

public class PieceOfSentence
{
    public string startTime { get; set; } = "";
    public string endTime { get; set; } = "";
    public string message { get; set; } = "";
    public int segment { get; set; } = -1;

}