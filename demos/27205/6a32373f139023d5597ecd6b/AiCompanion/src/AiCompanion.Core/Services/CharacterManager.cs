using AiCompanion.Core.Models;
using AiCompanion.Core.Utils;

namespace AiCompanion.Core.Services;

/// <summary>
/// 角色管理器实现
/// </summary>
public class CharacterManager : ICharacterManager
{
    private const string StorageFileName = "characters.json";
    private readonly IConfigService _configService;

    public CharacterProfile CurrentCharacter { get; private set; }
    public List<CharacterProfile> SavedCharacters { get; private set; } = new();
    public event EventHandler<CharacterProfile>? CharacterChanged;

    public CharacterManager(IConfigService configService)
    {
        _configService = configService;
        CurrentCharacter = CharacterGenerator.CreateRandom();
    }

    public void SetCurrentCharacter(CharacterProfile profile)
    {
        CurrentCharacter = profile;
        CharacterChanged?.Invoke(this, profile);
        SaveToStorage();
    }

    public CharacterProfile RandomGenerate()
    {
        var profile = CharacterGenerator.CreateRandom();
        SetCurrentCharacter(profile);
        return profile;
    }

    public CharacterProfile GetPreset(int index)
    {
        var profile = CharacterGenerator.CreatePreset(index);
        SetCurrentCharacter(profile);
        return profile;
    }

    public void SaveCharacter(CharacterProfile profile)
    {
        var existing = SavedCharacters.FindIndex(c => c.Id == profile.Id);
        if (existing >= 0)
            SavedCharacters[existing] = profile;
        else
            SavedCharacters.Add(profile);
        SaveToStorage();
    }

    public void DeleteCharacter(string id)
    {
        SavedCharacters.RemoveAll(c => c.Id == id);
        SaveToStorage();
    }

    public void LoadFromStorage()
    {
        var chars = _configService.Load<List<CharacterProfile>>(StorageFileName);
        if (chars != null && chars.Count > 0)
        {
            SavedCharacters = chars;
            CurrentCharacter = chars[0];
            CharacterChanged?.Invoke(this, CurrentCharacter);
        }
    }

    public void SaveToStorage()
    {
        _configService.Save(StorageFileName, SavedCharacters);
    }
}
