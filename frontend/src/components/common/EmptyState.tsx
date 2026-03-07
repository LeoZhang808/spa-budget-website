interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>∅</div>
      <p style={{ margin: 0, fontSize: '0.95rem' }}>{message}</p>
      {actionLabel && onAction && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
