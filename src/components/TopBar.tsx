import {
  IconCup,
  IconHelp,
  IconMusic,
  IconPause,
  IconPlay,
  IconSpeaker,
  IconSparkle,
} from "./icons";

interface TopBarProps {
  sessions: number;
  muted: boolean;
  musicPlaying: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenHelp: () => void;
}

export function TopBar({
  sessions,
  muted,
  musicPlaying,
  onToggleMute,
  onToggleMusic,
  onOpenHelp,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-badge" aria-hidden="true">
          <IconCup width={22} height={22} />
        </span>
        <span className="brand-copy">
          <span className="brand-name">Breakroom Focus Desk</span>
          <span className="brand-tag">Pomodoro café · est. 2026</span>
        </span>
      </div>

      <div className="top-actions">
        <span
          className="session-chip"
          title={`${sessions} focus ${sessions === 1 ? "session" : "sessions"} brewed on this device`}
        >
          <IconSparkle width={14} height={14} />
          <span className="session-chip__count">{sessions}</span>
          <span className="session-chip__label">
            {sessions === 1 ? "session" : "sessions"}
          </span>
        </span>

        <div className="sound-group" role="group" aria-label="Sound controls">
          <button
            type="button"
            className={`icon-button${muted ? " is-muted" : ""}`}
            onClick={onToggleMute}
            aria-pressed={muted}
            title={muted ? "Unmute all audio (M)" : "Mute all audio (M)"}
            aria-label={muted ? "Unmute all audio" : "Mute all audio"}
          >
            <IconSpeaker muted={muted} />
          </button>

          <button
            type="button"
            className={`icon-button${musicPlaying ? " is-active" : ""}`}
            onClick={onToggleMusic}
            aria-pressed={musicPlaying}
            title="Toggle lo-fi ambience"
          >
            {musicPlaying ? <IconPause /> : <IconPlay />}
            <IconMusic width={14} height={14} />
            <span className="icon-button__label">Lo-fi</span>
          </button>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onOpenHelp}
          title="Help & shortcuts (?)"
          aria-label="Help and keyboard shortcuts"
        >
          <IconHelp />
        </button>
      </div>
    </header>
  );
}
