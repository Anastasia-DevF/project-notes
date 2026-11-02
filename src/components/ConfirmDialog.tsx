interface ConfirmDialogProps {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <>
      <p className="confirm-message">{message}</p>
      <div className="modal__actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button--danger" type="button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </>
  );
}
