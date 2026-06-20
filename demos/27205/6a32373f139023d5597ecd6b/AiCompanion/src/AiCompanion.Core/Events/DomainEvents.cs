using AiCompanion.Core.Models;

namespace AiCompanion.Core.Events;

public class WindowActivityChangedEvent : EventArgs
{
    public WindowActivitySnapshot Snapshot { get; init; } = null!;
}

public class GameEventDetectedEvent : EventArgs
{
    public GameEvent GameEvent { get; init; } = null!;
}

public class ConversationInitiatedEvent : EventArgs
{
    public string TriggerReason { get; init; } = "";
    public string InitialMessage { get; init; } = "";
}

public class CharacterProfileChangedEvent : EventArgs
{
    public CharacterProfile NewProfile { get; init; } = null!;
}
