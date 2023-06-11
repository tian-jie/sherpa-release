using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MeetingCopilot.Models;

public class SysUser : IdentityUser
{
    public SysUser()
    {
    }
}

