namespace AiCompanion.Core.Services;

/// <summary>
/// 配置服务——JSON 配置文件读写
/// </summary>
public interface IConfigService
{
    T? Load<T>(string fileName) where T : class;
    void Save<T>(string fileName, T config) where T : class;
    string GetConfigDir();
}
