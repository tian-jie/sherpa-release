namespace MeetingCopilot.Models;

public class MeetingCopilotDatabaseMongoSettings
{
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string MeetingsCollectionName { get; set; } = null!;
}