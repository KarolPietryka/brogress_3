import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

/** Breakpoint aligned with `styles.css` composer mobile rules. */
const SHEET_MAX_WIDTH_PX = 640;

export type ComposerPickListItem =
  | string
  | {
      key: string;
      label: string;
      disabled?: boolean;
      deletable?: boolean;
      exerciseId?: number;
    };

function normalize(item: ComposerPickListItem): {
  key: string;
  label: string;
  disabled?: boolean;
  deletable?: boolean;
  exerciseId?: number;
} {
  if (typeof item === "string") return { key: item, label: item };
  return item;
}

export type ComposerPickListPortalProps = {
  open: boolean;
  title: string;
  items: readonly ComposerPickListItem[];
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onPick: (item: ComposerPickListItem) => void;
  onItemDelete?: (item: Exclude<ComposerPickListItem, string>) => void;
};

function computePopoverStyle(
  anchor: HTMLElement,
): CSSProperties | undefined {
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(
    Math.max(rect.width, 200),
    Math.min(400, vw - margin * 2),
  );
  let left = rect.left;
  if (left + width > vw - margin) left = vw - margin - width;
  if (left < margin) left = margin;

  const spaceBelow = vh - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

  if (!openUp) {
    const top = rect.bottom + 6;
    return {
      position: "fixed",
      left,
      width,
      top,
      maxHeight: Math.min(360, Math.max(120, spaceBelow - 6)),
    };
  }
  const bottom = vh - rect.top + 6;
  return {
    position: "fixed",
    left,
    width,
    bottom,
    maxHeight: Math.min(360, Math.max(120, spaceAbove - 6)),
  };
}

export function ComposerPickListPortal({
  open,
  title,
  items,
  anchorRef,
  onClose,
  onPick,
  onItemDelete,
}: ComposerPickListPortalProps) {
  const [sheet, setSheet] = useState(true);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (!open) return;

    function syncLayout() {
      const narrow = window.innerWidth <= SHEET_MAX_WIDTH_PX;
      setSheet(narrow);
      if (narrow) {
        setPopoverStyle(undefined);
        return;
      }
      const el = anchorRef.current;
      if (!el) return;
      setPopoverStyle(computePopoverStyle(el));
    }

    syncLayout();
    window.addEventListener("resize", syncLayout);
    window.addEventListener("scroll", syncLayout, true);
    return () => {
      window.removeEventListener("resize", syncLayout);
      window.removeEventListener("scroll", syncLayout, true);
    };
  }, [open, anchorRef, items, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const panelClass = sheet
    ? "pickList-panel pickList-panel--sheet"
    : "pickList-panel pickList-panel--popover";

  return createPortal(
    <div className="pickList-root" role="presentation">
      <button
        type="button"
        className="pickList-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className={panelClass} style={sheet ? undefined : popoverStyle}>
        {sheet ? <div className="pickList-sheetGrip" aria-hidden /> : null}
        <div className="pickList-header">{title}</div>
        <ul className="pickList-list" role="listbox">
          {items.map((raw) => {
            const n = normalize(raw);
            const isObject = typeof raw !== "string";
            const showDelete =
              Boolean(onItemDelete) && isObject && Boolean(n.deletable);

            const pickBtn = (
              <button
                type="button"
                role="option"
                className="pickList-item"
                disabled={n.disabled}
                aria-selected={false}
                onClick={() => {
                  if (n.disabled) return;
                  onPick(raw);
                  onClose();
                }}
              >
                {n.label}
              </button>
            );

            return (
              <li key={n.key} role="presentation">
                {showDelete && isObject ? (
                  <div className="pickList-itemRow">
                    {pickBtn}
                    <button
                      type="button"
                      className="pickList-itemDelete"
                      aria-label={`Remove ${n.label}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onItemDelete?.(raw);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  pickBtn
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
