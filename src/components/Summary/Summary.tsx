import type { FC } from 'react';
import { useSeatStore } from '../../store/useSeatStore';
import { Button, ListGroup, Badge, Stack } from 'react-bootstrap';

export const Summary: FC = () => {
  const { selectedSeats, maxSeats, clearSeats, getSelectedCount } = useSeatStore();
  const selectedCount = getSelectedCount();

  const calculatePrice = (seatId: string) => {
    const basePrice = 50;
    const seatNumber = parseInt(seatId.split('-').pop() || '0');
    return basePrice + (seatNumber % 3) * 10;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + calculatePrice(seat), 0);

  return (
    <div className="summary">
      <div className="mb-4">
        <h5 className="d-flex justify-content-between align-items-center mb-3">
          <span>Your Selection</span>
          <Badge 
            bg={selectedCount === maxSeats ? 'warning' : 'primary'} 
            pill
            className="px-3 py-2"
          >
            {selectedCount}/{maxSeats}
          </Badge>
        </h5>
        
        <div className="bg-light p-3 rounded-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Maximum Seats:</span>
            <strong>{maxSeats}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Remaining:</span>
            <strong className={maxSeats - selectedCount === 0 ? 'text-warning' : ''}>
              {maxSeats - selectedCount}
            </strong>
          </div>
        </div>
      </div>

      {selectedCount > 0 ? (
        <>
          <div className="mb-4">
            <h6 className="mb-3">Selected Seats:</h6>
            <ListGroup variant="flush" className="border rounded-3">
              {selectedSeats.map((seatId, index) => {
                const price = calculatePrice(seatId);
                return (
                  <ListGroup.Item 
                    key={seatId} 
                    className="d-flex justify-content-between align-items-center py-3"
                  >
                    <div>
                      <span className="fw-bold font-monospace">{seatId}</span>
                      <small className="text-muted ms-2">Seat {index + 1}</small>
                    </div>
                    <Badge bg="primary" pill className="px-3 py-2">
                      ${price}
                    </Badge>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>

          <div className="border-top pt-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Total Amount:</h5>
              <h4 className="mb-0 text-primary fw-bold">${totalPrice}</h4>
            </div>
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              All prices include taxes
            </small>
          </div>

          <Stack direction="horizontal" gap={2}>
            <Button 
              variant="danger" 
              onClick={clearSeats}
              className="flex-grow-1"
              size="lg"
            >
              Clear All
            </Button>
          </Stack>
        </>
      ) : (
        <div className="text-center py-5 px-3 bg-light rounded-3">
          <div className="mb-3">
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className="text-muted"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-muted mb-0 fst-italic">
            Click on available seats to select them
          </p>
          <small className="text-muted">
            You can select up to {maxSeats} seats
          </small>
        </div>
      )}
    </div>
  );
};