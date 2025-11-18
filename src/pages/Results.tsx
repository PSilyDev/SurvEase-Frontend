import React from 'react';
import Navbar from '../components/Navbar';

const Results: React.FC = () => {
  // Placeholder — real page would show aggregated results per survey
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <h2>Results</h2>
        <p>Survey results will be shown here.</p>
      </main>
    </div>
  );
};

export default Results;
