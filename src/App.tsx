import { useState, useEffect } from 'react';
import type { Venue } from './types/venue';
import './App.css';
import { SeatMap } from '../src/components/SeatMap/SeatMap';
import { Summary } from '../src/components/Summary/Summary';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/venue.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load venue data');
        }
        return res.json();
      })
      .then((data) => {
        setVenue(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <h2>Loading venue...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error loading venue</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="app-error">
        <h2>No venue data available</h2>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{venue.name}</h1>
        <p className="venue-id">{venue.venueId}</p>
      </header>
      
      <main className="app-main">
        <div className="seating-container">
          <SeatMap venue={venue} />
        </div>
        <aside className="summary-sidebar">
          <Summary />
        </aside>
      </main>
    </div>
  );
}

export default App;