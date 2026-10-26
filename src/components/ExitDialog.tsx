import { Modal } from "./Modal";
import { IconArrowRight } from "./icons";

interface ExitDialogProps {
  onReturn: () => void;
}

export function ExitDialog({ onReturn }: ExitDialogProps) {
  return (
    <Modal labelledBy="exit-title">
      <span className="modal-eyebrow">Standby</span>
      <h1 id="exit-title">The machine is idling.</h1>
      <p className="modal-copy">
        Your cup count is saved locally, and the breakroom light stays on. Come
        back whenever you need another cup.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn btn--primary" onClick={onReturn}>
          Return to the café <IconArrowRight width={16} height={16} />
        </button>
      </div>
      <p className="modal-footnote">
        Tip: the pause that refreshes is allowed.
      </p>
    </Modal>
  );
}
