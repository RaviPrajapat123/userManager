import React from 'react';
import { Link } from 'react-router-dom';

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  color: 'inherit'
};

const cardHoverStyle = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
};

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
  padding: '2rem'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  maxWidth: '1200px',
  margin: '5rem auto 0'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem'
};

const iconWrapperStyle = (bg, color) => ({
  padding: '0.75rem',
  borderRadius: '0.75rem',
  marginRight: '1rem',
  backgroundColor: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const titleStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1f2937'
};

const textStyle = {
  color: '#4b5563'
};

const App = () => {
  const cards = [
    {
      to: '/users',
      title: 'Users',
      text: 'Manage all user accounts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: '#dbeafe',
      color: '#2563eb'
    },
    {
      to: '/Blog',
      title: 'Blogs',
      text: 'Manage all blog posts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      bg: '#d1fae5',
      color: '#059669'
    },
    {
      to: '/TagsTable',
      title: 'Tags',
      text: 'Manage blog tags',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      bg: '#ede9fe',
      color: '#7c3aed'
    },
    {
      to: '/CategoriesTable',
      title: 'Categories',
      text: 'Manage blog categories',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      bg: '#ffedd5',
      color: '#ea580c'
    }
  ];

  return (
    <div style={containerStyle}>
      <header style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>Data Management</h1>
      </header>

      <div style={gridStyle}>
        {cards.map((card, index) => (
          <Link
            to={card.to}
            key={index}
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <div style={{ padding: '1.5rem' }}>
              <div style={cardHeaderStyle}>
                <div style={iconWrapperStyle(card.bg, card.color)}>
                  {card.icon}
                </div>
                <h2 style={titleStyle}>{card.title}</h2>
              </div>
              <p style={textStyle}>{card.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default App;
