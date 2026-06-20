namespace AiCompanion.Core.Utils;

/// <summary>
/// 时间段判断工具
/// </summary>
public static class TimeOfDayHelper
{
    public static string GetTimeOfDay(DateTime? time = null)
    {
        var hour = (time ?? DateTime.Now).Hour;
        return hour switch
        {
            >= 5 and < 9 => "清晨",
            >= 9 and < 12 => "上午",
            >= 12 and < 14 => "中午",
            >= 14 and < 18 => "下午",
            >= 18 and < 22 => "傍晚",
            >= 22 or < 2 => "深夜",
            _ => "凌晨"
        };
    }

    public static string GetGreeting(DateTime? time = null)
    {
        var hour = (time ?? DateTime.Now).Hour;
        return hour switch
        {
            >= 5 and < 9 => "早上好",
            >= 9 and < 12 => "上午好",
            >= 12 and < 14 => "中午好",
            >= 14 and < 18 => "下午好",
            >= 18 and < 22 => "晚上好",
            _ => "还没睡吗"
        };
    }

    public static bool IsLateNight() => DateTime.Now.Hour >= 22 || DateTime.Now.Hour < 2;
}
