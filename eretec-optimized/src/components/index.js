// PageTitle Component
export function PageTitle({ title, sub, right }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// Modal Component
export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 18 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner() {
  return <div className="spinner"></div>;
}

// Empty State
export function EmptyState({ message }) {
  return (
    <div className="card" style={{ padding: '50px 24px', textAlign: 'center', color: 'var(--muted)' }}>
      {message}
    </div>
  );
}
