import type { FC } from 'react';
import type { Venue, Section } from '../../types/venue';
import { useState, useEffect } from 'react';
import { useSeatStore } from '../../store/useSeatStore';
import { Badge } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface SeatMapProps {
  venue: Venue;
}

export const SeatMap: FC<SeatMapProps> = ({ venue }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const { addSeat, removeSeat, isSelected, selectedSeats, maxSeats } = useSeatStore();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSeatClick = (seatId: string, status: string) => {
    if (status !== 'available') return;
    
    if (isSelected(seatId)) {
      removeSeat(seatId);
    } else {
      if (selectedSeats.length < maxSeats) {
        addSeat(seatId);
      } else {
        alert(`You can only select up to ${maxSeats} seats`);
      }
    }
  };

  const getSeatIcon = (status: string, selected: boolean) => {
    if (selected) return 'bi bi-check-circle-fill text-primary';
    
    switch(status) {
      case 'available': 
        return 'bi bi-circle-fill text-success';
      case 'reserved': 
        return 'bi bi-circle-fill text-warning';
      case 'sold': 
        return 'bi bi-circle-fill text-danger';
      case 'held': 
        return 'bi bi-circle-fill text-secondary';
      default: 
        return 'bi bi-circle-fill text-light';
    }
  };

  // Responsive boyutlar
  // Responsive boyutlar
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;
  
  const seatSize = isMobile ? 32 : isTablet ? 26 : 24;
  const sectionWidth = isMobile ? '100%' : 'calc(50% - 12px)'; // 2 kolon için %50 - gap
  const fontSize = isMobile ? 14 : isTablet ? 13 : 12;
  const headerFontSize = isMobile ? 16 : isTablet ? 15 : 14;
  const gap = isMobile ? 12 : 16;

  // Price tier'a göre fiyat hesaplama
  const getPriceByTier = (tier: number) => {
    switch(tier) {
      case 1: return 50; // Standard
      case 2: return 75; // Premium
      case 3: return 100; // VIP
      default: return 50;
    }
  };

  // Seat ID'den koltuk bulma fonksiyonu
  const findSeatById = (seatId: string) => {
    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) return seat;
      }
    }
    return null;
  };

  // Subtotal hesaplama
  const subtotal = selectedSeats.reduce((total, seatId) => {
    const seat = findSeatById(seatId);
    return total + (seat ? getPriceByTier(seat.priceTier) : 0);
  }, 0);

  return (
    <div className="seat-map-container w-100 h-100 overflow-auto">
      <div className="container-fluid py-3 px-2 px-md-3">
        {/* Başlık */}
        <div className="mb-3">
          <h5 style={{ fontSize: headerFontSize + 2 }} className="fw-bold text-dark mb-1">
            Interactive Seat Map
          </h5>
          <p style={{ fontSize: fontSize }} className="text-muted">
            Click on available seats to select (max {maxSeats})
          </p>
        </div>

        {/* Section grid - flexbox ile 2 kolon */}
        <div className="d-flex flex-wrap" style={{ gap: `${gap}px` }}>
          {venue.sections.map((section: Section) => (
            <div
              key={section.id}
              className="bg-white rounded-4 shadow-sm"
              style={{
                width: sectionWidth,
                minWidth: isMobile ? '100%' : '300px',
                flex: isMobile ? '0 0 100%' : '1 1 auto',
                border: '1px solid #e9ecef',
                marginBottom: isMobile ? gap : 0,
              }}
            >
              {/* Section başlık */}
              <div className="p-2 p-md-3 border-bottom bg-light bg-opacity-50 rounded-top-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 style={{ fontSize: headerFontSize }} className="fw-bold text-primary mb-0">
                    {section.label}
                  </h6>
                  <Badge bg="light" text="dark" className="px-2 py-1" style={{ fontSize: fontSize - 2 }}>
                    {section.rows.reduce((acc, row) => acc + row.seats.length, 0)} seats
                  </Badge>
                </div>
              </div>

              {/* Row'lar */}
              <div className="p-2 p-md-3">
                {section.rows.map((row) => (
                  <div key={row.index} className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ fontSize: fontSize }} className="text-secondary fw-semibold">
                        Row {row.index}
                      </span>
                      <div className="flex-grow-1" style={{ height: '1px', background: '#e9ecef' }}></div>
                    </div>
                    
                    {/* Koltuklar - flex-wrap ile responsive */}
                    <div className="d-flex flex-wrap" style={{ gap: `${gap}px` }}>
                      {row.seats.map((seat) => {
                        const selected = isSelected(seat.id);
                        const isAvailable = seat.status === 'available';
                        const isClickable = isAvailable || selected;

                        return (
                          <button
                            key={seat.id}
                            className={`btn p-0 border-0 ${isClickable ? 'opacity-100' : 'opacity-50'}`}
                            style={{ 
                              width: seatSize, 
                              height: seatSize,
                              transform: 'scale(1)',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: isClickable ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => handleSeatClick(seat.id, seat.status)}
                            onMouseEnter={(e) => {
                              if (isClickable && !isMobile) {
                                e.currentTarget.style.transform = 'scale(1.15)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isClickable && !isMobile) {
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                            title={`${section.label} - Row ${row.index} - Seat ${seat.col}`}
                            aria-label={`${section.label} Row ${row.index} Seat ${seat.col} ${seat.status} ${selected ? 'selected' : ''}`}
                            aria-pressed={selected}
                            tabIndex={isClickable ? 0 : -1}
                            onKeyDown={(e) => {
                              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleSeatClick(seat.id, seat.status);
                              }
                            }}
                          >
                            <i 
                              className={getSeatIcon(seat.status, selected)}
                              style={{ 
                                fontSize: seatSize,
                                filter: selected ? 'drop-shadow(0 2px 4px rgba(13,110,253,0.3))' : 'none'
                              }}
                            ></i>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend ve Info panel - yan yana desktop'ta */}
        {/* Legend, Subtotal ve Info panel - yan yana desktop'ta */}
        <div className="d-flex flex-wrap mt-4" style={{ gap: `${gap}px` }}>
          {/* Legend */}
          <div
            className="bg-white rounded-3 shadow-sm p-3"
            style={{
              flex: '1 1 auto',
              minWidth: isMobile ? '100%' : '300px',
              border: '1px solid #dee2e6'
            }}
          >
            <h6 style={{ fontSize: headerFontSize }} className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill text-primary"></i>
              Status
            </h6>
            
            <div className="d-flex flex-wrap" style={{ gap: isMobile ? 12 : 16 }}>
              <div className="d-flex align-items-center gap-2" style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}>
                <i className="bi bi-circle-fill text-success" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}>
                <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}>
                <i className="bi bi-circle-fill text-warning" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Reserved</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}>
                <i className="bi bi-circle-fill text-danger" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Sold</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}>
                <i className="bi bi-circle-fill text-secondary" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Held</span>
              </div>
            </div>
          </div>

          {/* Subtotal Panel - YENİ */}
          <div
            className="bg-white rounded-3 shadow-sm p-3"
            style={{
              flex: '1 1 auto',
              minWidth: isMobile ? '100%' : '250px',
              border: '1px solid #dee2e6'
            }}
          >
            <h6 style={{ fontSize: headerFontSize }} className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cart3 text-primary"></i>
              Your Selection
            </h6>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: fontSize }}>Selected Seats:</span>
                <span className="fw-bold" style={{ fontSize: fontSize }}>{selectedSeats.length} / {maxSeats}</span>
              </div>
              
              {/* Subtotal */}
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <span className="fw-semibold" style={{ fontSize: fontSize }}>Subtotal:</span>
                <span className="fw-bold text-primary" style={{ fontSize: fontSize + 2 }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Selected seats list (collapsible if many) */}
            {selectedSeats.length > 0 && (
              <div className="mt-2">
                <details>
                  <summary className="small text-muted" style={{ fontSize: fontSize - 1 }}>
                    View selected seats ({selectedSeats.length})
                  </summary>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {selectedSeats.map(seatId => {
                      const seat = findSeatById(seatId);
                      return seat ? (
                        <Badge key={seatId} bg="light" text="dark" className="p-1" style={{ fontSize: fontSize - 2 }}>
                          {seatId} (${getPriceByTier(seat.priceTier)})
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div
            className="bg-white rounded-3 shadow-sm p-3"
            style={{
              flex: '1 1 auto',
              minWidth: isMobile ? '100%' : '250px',
              border: '1px solid #dee2e6'
            }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-center" style={{ gap: isMobile ? 12 : 16 }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-hand-index-thumb text-primary" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Click to select</span>
              </div>
              <div className="vr d-none d-md-block"></div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-layers text-primary" style={{ fontSize: fontSize + 2 }}></i>
                <span style={{ fontSize: fontSize }}>Max {maxSeats} seats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};