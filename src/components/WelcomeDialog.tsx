import { Modal } from "./Modal";
import { IconArrowRight, IconCup } from "./icons";

interface WelcomeDialogProps {
  onEnter: () => void;
  onExit: () => void;
}

export function WelcomeDialog({ onEnter, onExit }: WelcomeDialogProps) {
  return (
    <Modal labelledBy="welcome-title">
      <span className="modal-eyebrow">
        <IconCup width={13} height={13} /> The barista&apos;s breakroom
      </span>
      <h1 id="welcome-title">Brew a better work session.</h1>
      <p className="modal-copy">
        A pomodoro timer disguised as a tiny coffee shop. Pick a cup from the
        wall, choose your roast, and let the machine pull your reward while you
        focus. Then take a proper break — coffee in hand.
      </p>

      <ol className="welcome-list">
        <li>
          <span aria-hidden="true">01</span>
          <div>
            <strong>Pick a wall cup</strong>
            <p>Six glazes on the pegboard. The one you choose is yours to sip from.</p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">02</span>
          <div>
            <strong>Set focus &amp; break</strong>
            <p>Classic 25 minutes, a 5-minute break, or any lengths you like.</p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">03</span>
          <div>
            <strong>Earn the coffee</strong>
            <p>
              The machine brews while you focus. During the break, every sip
              lowers the cup — the café takes care of the rest.
            </p>
          </div>
        </li>
      </ol>

      <div className="modal-actions">
        <button type="button" className="btn btn--primary" onClick={onEnter}>
          Enter the café <IconArrowRight width={16} height={16} />
        </button>
        <button type="button" className="btn btn--ghost" onClick={onExit}>
          Not now
        </button>
      </div>

      <p className="modal-footnote">
        No account, no noise. Preferences stay on this device.
      </p>
    </Modal>
  );
}
