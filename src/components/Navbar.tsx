import React from 'react';

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #e6e6e6',
  background: '#fff',
};

const linkStyle: React.CSSProperties = {
  marginLeft: '1rem',
  textDecoration: 'none',
  color: '#111827',
  fontWeight: 500,
};

export const Navbar: React.FC = () => {
  return (
    <header style={navStyle}>
      <div style={{ fontWeight: 700 }}>SurvEase</div>
      <nav>
        <a href="/" style={linkStyle} aria-label="home">
          Home
        </a>
        <a href="/create" style={linkStyle} aria-label="create-survey">
          Create
        </a>
        <a href="/take" style={linkStyle} aria-label="take-survey">
          Take
        </a>
        <a href="/results" style={linkStyle} aria-label="results">
          Results
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
