import { Modal } from "./Modal";

interface HelpDialogProps {
  onClose: () => void;
}

export function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <Modal labelledBy="help-title" onClose={onClose} showClose>
      <span className="modal-eyebrow">Barista notes</span>
      <h1 id="help-title">How the breakroom works.</h1>
      <p className="modal-copy">
        Choose a cup from the wall, load it onto the machine, and start a focus
        session. The machine brews your coffee while you work. When focus ends,
        start a break and sip — the cup empties a little with every sip while
        the café hums along.
      </p>

      <dl className="shortcut-list">
        <dt>Choose a wall cup</dt>
        <dd>Tap a coloured cup</dd>
        <dt>Load or return the mug</dt>
        <dd>
          <kbd>Tap</kbd> / drag the cup
        </dd>
        <dt>Start, pause or resume</dt>
        <dd>
          <kbd>Space</kbd>
        </dd>
        <dt>Take a sip during a break</dt>
        <dd>
          <kbd>S</kbd> or tap the cup
        </dd>
        <dt>Mute all sound</dt>
        <dd>
          <kbd>M</kbd>
        </dd>
        <dt>Open this panel</dt>
        <dd>
          <kbd>?</kbd>
        </dd>
        <dt>Close a dialog</dt>
        <dd>
          <kbd>Esc</kbd>
        </dd>
      </dl>

      <div className="help-note">
        <strong>Break length is yours.</strong> Pick 5, 10 or 15 minutes, set a
        custom length before the break, or add five more minutes mid-break. The
        steam hiss and lo-fi chords are synthesised in your browser — silence is
        always one button away.
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Back to the desk
        </button>
      </div>
    </Modal>
  );
}
