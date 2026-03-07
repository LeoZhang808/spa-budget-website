export function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        width: '100%',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}
