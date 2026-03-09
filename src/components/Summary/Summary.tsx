import { FC } from 'react';
import { useSeatStore } from '../../store/useSeatStore';
import './Summary.css';

export const Summary: FC = () => {
  const { selectedSeats, maxSeats, clearSeats, getSelectedCount } = useSeatStore();
  const selectedCount = getSelectedCount();

  return (
    <div className="summary">
      <h2 className="summary-title">Your Selection</h2>
      
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Selected Seats:</span>
          <span className="stat-value">{selectedCount} / {maxSeats}</span>
        </div>
      </div>

      {selectedCount > 0 ? (
        <>
          <div className="selected-seats-list">
            <h3>Seats:</h3>
            <ul>
              {selectedSeats.map((seatId) => (
                <li key={seatId} className="selected-seat-item">
                  <span>{seatId}</span>
                </li>
              ))}
            </ul>
          </div>

          <button 
            className="clear-button"
            onClick={clearSeats}
            aria-label="Clear all selected seats"
          >
            Clear All
          </button>
        </>
      ) : (
        <p className="no-seats-message">
          Click on available seats to select them
        </p>
      )}
    </div>
  );
};