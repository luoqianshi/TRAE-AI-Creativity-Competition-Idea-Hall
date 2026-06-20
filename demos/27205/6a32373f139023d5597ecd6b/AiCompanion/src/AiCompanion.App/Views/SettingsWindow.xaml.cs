using System.Windows;
using System.Windows.Input;

namespace AiCompanion.App.Views;

/// <summary>
/// 设置窗口
/// </summary>
public partial class SettingsWindow : Window
{
    public SettingsWindow()
    {
        InitializeComponent();

        CmbProvider.Items.Add("Ollama (本地)");
        CmbProvider.Items.Add("OpenAI (云端)");
        CmbProvider.SelectedIndex = 0;

        BtnRandomChar.Click += (_, _) => ((dynamic)DataContext)?.RandomGenerate();
        BtnSaveChar.Click += (_, _) => ((dynamic)DataContext)?.SaveCharacter();
        ChkAutoStart.Checked += (_, _) => ((dynamic)DataContext)?.ToggleAutoStart(true);
        ChkAutoStart.Unchecked += (_, _) => ((dynamic)DataContext)?.ToggleAutoStart(false);

        this.KeyDown += (s, e) => { if (e.Key == Key.Escape) Hide(); };
    }

    public void SetStatus(string message) => TxtStatus.Text = message;

    public void UpdateCharacterFields(string name, string personality, string identity)
    {
        CharName.Text = name;
        CharPersonality.Text = personality;
        CharIdentity.Text = identity;
    }

    public void UpdateAiFields(string ollamaModel, string apiKey)
    {
        OllamaModel.Text = ollamaModel;
        ApiKey.Text = apiKey;
    }
}
