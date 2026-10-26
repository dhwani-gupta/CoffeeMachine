import { CUP_STYLES } from "../data/cafe";
import { cupStyleVars } from "../lib/cup";
import type { CupId } from "../types";
import { IconCheck } from "./icons";

interface CupRackProps {
  selectedCupId: CupId;
  disabled: boolean;
  onSelect: (cupId: CupId) => void;
}

export function CupRack({ selectedCupId, disabled, onSelect }: CupRackProps) {
  const selected = CUP_STYLES.find((cup) => cup.id === selectedCupId);

  return (
    <section className="cup-rack" aria-label="Choose your cup from the wall">
      <div className="cup-rack__heading">
        <span className="cup-rack__eyebrow">The mug wall</span>
        <span className="cup-rack__selected">
          {selected ? `${selected.name} in hand` : "Pick a cup"}
        </span>
      </div>

      <div className="cup-rack__shelf">
        <div className="cup-rack__rail" aria-hidden="true" />
        <div className="cup-rack__row" role="group" aria-label="Cup colours">
          {CUP_STYLES.map((cup) => {
            const isSelected = cup.id === selectedCupId;
            return (
              <button
                key={cup.id}
                type="button"
                className={`rack-cup${isSelected ? " is-selected" : ""}`}
                style={cupStyleVars(cup)}
                onClick={() => onSelect(cup.id)}
                disabled={disabled}
                aria-pressed={isSelected}
                title={`${cup.name} cup${isSelected ? " (selected)" : ""}`}
                aria-label={`Choose the ${cup.name.toLowerCase()} cup`}
              >
                <span className="rack-cup__peg" aria-hidden="true" />
                <span className="rack-cup__body" aria-hidden="true" />
                <span className="rack-cup__handle" aria-hidden="true" />
                {isSelected ? (
                  <span className="rack-cup__check" aria-hidden="true">
                    <IconCheck width={11} height={11} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <span className="cup-rack__caption">
        {disabled
          ? "Cup changes paused during a session"
          : "Tap a cup to make it yours"}
      </span>
    </section>
  );
}
