import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#fee2e2',
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
        marginBottom: 16
      }}>
        🔒
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
        Access Denied
      </h2>
      <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: 420, margin: '0 0 24px 0' }}>
        Access denied. Administrator privileges are required to view this area.
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: 10 }}>
        Return to Home / Login
      </Link>
    </div>
  );
};

export default Unauthorized;
