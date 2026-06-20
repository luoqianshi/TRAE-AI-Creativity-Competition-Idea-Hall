using AiCompanion.Core.Models;

namespace AiCompanion.Core.Services;

/// <summary>
/// 角色管理服务接口
/// </summary>
public interface ICharacterManager
{
    CharacterProfile CurrentCharacter { get; }
    List<CharacterProfile> SavedCharacters { get; }
    event EventHandler<CharacterProfile>? CharacterChanged;

    void SetCurrentCharacter(CharacterProfile profile);
    CharacterProfile RandomGenerate();
    CharacterProfile GetPreset(int index);
    void SaveCharacter(CharacterProfile profile);
    void DeleteCharacter(string id);
    void LoadFromStorage();
    void SaveToStorage();
}
