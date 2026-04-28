import React from 'react';

export default function EmptyState({ icon, title, message }) {
  return (
    <div className="text-center py-4 text-muted" role="status">
      {icon && (
        <div aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {icon}
        </div>
      )}
      <p className="fw-semibold mb-1">{title}</p>
      {message && <p className="small mb-0">{message}</p>}
    </div>
  );
}
