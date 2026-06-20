using CommunityToolkit.Mvvm.ComponentModel;
using AiCompanion.Core.Models;

namespace AiCompanion.App.ViewModels;

/// <summary>
/// 设置页 ViewModel
/// </summary>
public partial class SettingsViewModel : ObservableObject
{
    private readonly Core.Services.ICharacterManager _charMgr;

    [ObservableProperty] private string _characterName = "";
    [ObservableProperty] private string _characterPersonality = "";
    [ObservableProperty] private string _characterIdentity = "";
    [ObservableProperty] private string _status = "就绪";

    public SettingsViewModel(Core.Services.ICharacterManager charMgr)
    {
        _charMgr = charMgr;
        LoadCurrentCharacter();
    }

    public void LoadCurrentCharacter()
    {
        var c = _charMgr.CurrentCharacter;
        CharacterName = c.Name;
        CharacterPersonality = c.Personality;
        CharacterIdentity = c.Identity;
    }

    public void RandomGenerate()
    {
        var profile = _charMgr.RandomGenerate();
        CharacterName = profile.Name;
        CharacterPersonality = profile.Personality;
        CharacterIdentity = profile.Identity;
        Status = $"已生成新角色: {profile.Name}";
    }

    public void SaveCharacter()
    {
        _charMgr.CurrentCharacter.Name = CharacterName;
        _charMgr.CurrentCharacter.Personality = CharacterPersonality;
        _charMgr.CurrentCharacter.Identity = CharacterIdentity;
        _charMgr.SaveToStorage();
        Status = "角色已保存 ✓";
    }

    public void ToggleAutoStart(bool enabled)
    {
        if (enabled)
            Infrastructure.Startup.StartupManager.EnableStartup();
        else
            Infrastructure.Startup.StartupManager.DisableStartup();
        Status = enabled ? "开机自启已启用" : "开机自启已禁用";
    }
}
