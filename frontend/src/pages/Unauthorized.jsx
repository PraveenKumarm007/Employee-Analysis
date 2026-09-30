import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Go Home</Link>
    </div>
  );
};

export default Unauthorized;
