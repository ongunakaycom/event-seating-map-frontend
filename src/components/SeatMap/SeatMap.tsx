import type { FC } from 'react';
import type { Venue, Section, Seat } from '../../types/venue';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSeatStore } from '../../store/useSeatStore';
import { Badge } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from 'react';

interface SeatMapProps {
  venue: Venue;
}

interface SeatDetail {
  id: string;
  status: string;
  priceTier: number;
  sectionLabel: string;
  rowIndex: string;
  col: string;
  price: number;
}

// Constants for responsive breakpoints
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 992
} as const;

// Price configuration - Updated to match image: Tier 2 = $60
const PRICE_TIERS = {
  1: 50, // Standard - Lower Bowl C, D
  2: 60, // Premium - Lower Bowl B  
  3: 75  // VIP - Lower Bowl A
} as const;
export const SeatMap: FC<SeatMapProps> = React.memo(({ venue }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedSeatDetail, setSelectedSeatDetail] = useState<SeatDetail | null>(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  
  const { addSeat, removeSeat, isSelected, selectedSeats, maxSeats } = useSeatStore();

  // Responsive calculations
  const responsive = useMemo(() => {
    const isMobile = windowWidth < BREAKPOINTS.MOBILE;
    const isTablet = windowWidth >= BREAKPOINTS.MOBILE && windowWidth < BREAKPOINTS.TABLET;
    
    return {
      isMobile,
      isTablet,
      seatSize: isMobile ? 32 : isTablet ? 26 : 24,
      sectionWidth: isMobile ? '100%' : 'calc(50% - 12px)',
      fontSize: isMobile ? 14 : isTablet ? 13 : 12,
      headerFontSize: isMobile ? 16 : isTablet ? 15 : 14,
      gap: isMobile ? 12 : 16
    };
  }, [windowWidth]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Price tier'a göre fiyat hesaplama
  const getPriceByTier = useCallback((tier: number): number => {
    return PRICE_TIERS[tier as keyof typeof PRICE_TIERS] || PRICE_TIERS[1];
  }, []);

  // Seat ID'den koltuk bulma fonksiyonu
  const findSeatById = useCallback((seatId: string): Seat | null => {
    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) return seat;
      }
    }
    return null;
  }, [venue.sections]);

  // Accept both string and number for rowIndex
  const handleSeatClick = useCallback((
    seatId: string,
    status: string,
    sectionLabel: string = '',
    rowIndex: string | number = '',
    col: string | number = ''   // FIX
  ) => {

    const rowIndexStr = String(rowIndex);
    const colStr = String(col);   // normalize once

    const seat = findSeatById(seatId);

    if (seat) {
      setSelectedSeatDetail({
        id: seat.id,
        status: seat.status,
        priceTier: seat.priceTier,
        sectionLabel,
        rowIndex: rowIndexStr,
        col: colStr,
        price: getPriceByTier(seat.priceTier)
      });

      setShowSeatModal(true);
    }

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

  }, [
    findSeatById,
    getPriceByTier,
    isSelected,
    removeSeat,
    addSeat,
    selectedSeats.length,
    maxSeats
  ]);

  const getSeatIcon = useCallback((status: string, selected: boolean): string => {
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
  }, []);

  // Subtotal hesaplama
  const subtotal = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = findSeatById(seatId);
      return total + (seat ? getPriceByTier(seat.priceTier) : 0);
    }, 0);
  }, [selectedSeats, findSeatById, getPriceByTier]);

  // Legend items for better maintainability
  const legendItems = useMemo(() => [
    { icon: 'bi-circle-fill text-success', label: 'Available' },
    { icon: 'bi-check-circle-fill text-primary', label: 'Selected' },
    { icon: 'bi-circle-fill text-warning', label: 'Reserved' },
    { icon: 'bi-circle-fill text-danger', label: 'Sold' },
    { icon: 'bi-circle-fill text-secondary', label: 'Held' }
  ], []);

  const handleModalClose = useCallback(() => {
    setShowSeatModal(false);
  }, []);

  const handleModalSeatAction = useCallback(() => {
    if (selectedSeatDetail) {
      handleSeatClick(
        selectedSeatDetail.id,
        selectedSeatDetail.status,
        selectedSeatDetail.sectionLabel,
        selectedSeatDetail.rowIndex,
        selectedSeatDetail.col
      );
      setShowSeatModal(false);
    }
  }, [selectedSeatDetail, handleSeatClick]);

  // FIXED: Remove this function entirely and inline the button rendering
  // This eliminates the type propagation issue

  const {
    isMobile,
    seatSize,
    sectionWidth,
    fontSize,
    headerFontSize,
    gap
  } = responsive;

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
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="px-2 py-1" 
                    style={{ fontSize: fontSize - 2 }}
                  >
                    {section.rows.reduce((acc, row) => acc + row.seats.length, 0)} seats
                  </Badge>
                </div>
              </div>

              {/* Row'lar */}
              <div className="p-2 p-md-3">
                {section.rows.map((row) => {
                  // Convert once at the row level
                  const rowIndexStr = String(row.index);
                  
                  return (
                    <div key={rowIndexStr} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span style={{ fontSize: fontSize }} className="text-secondary fw-semibold">
                          Row {rowIndexStr}
                        </span>
                        <div className="flex-grow-1" style={{ height: '1px', background: '#e9ecef' }}></div>
                      </div>
                      
                      {/* Koltuklar - flex-wrap ile responsive */}
                      <div className="d-flex flex-wrap" style={{ gap: `${gap}px` }}>
                        {row.seats.map((seat) => {
                          const selected = isSelected(seat.id);
                          const isAvailable = seat.status === 'available';
                          const isClickable = isAvailable || selected;

                          // FIXED: Inline the button rendering to avoid type propagation issues
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
                              onClick={() => handleSeatClick(
                                seat.id, 
                                seat.status, 
                                section.label, 
                                rowIndexStr, // Use the string version
                                seat.col
                              )}
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
                              title={`${section.label} - Row ${rowIndexStr} - Seat ${seat.col}`}
                              aria-label={`${section.label} Row ${rowIndexStr} Seat ${seat.col} ${seat.status} ${selected ? 'selected' : ''}`}
                              aria-pressed={selected}
                              tabIndex={isClickable ? 0 : -1}
                              onKeyDown={(e) => {
                                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                                  e.preventDefault();
                                  handleSeatClick(
                                    seat.id, 
                                    seat.status, 
                                    section.label, 
                                    rowIndexStr, // Use the string version
                                    seat.col
                                  );
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>

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
              {legendItems.map((item) => (
                <div 
                  key={item.label}
                  className="d-flex align-items-center gap-2" 
                  style={{ width: isMobile ? 'calc(50% - 6px)' : 'auto' }}
                >
                  <i className={item.icon} style={{ fontSize: fontSize + 2 }}></i>
                  <span style={{ fontSize: fontSize }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal Panel */}
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
                <span className="fw-bold text-primary" style={{ fontSize: fontSize + 2 }}>
                  ${subtotal.toFixed(2)}
                </span>
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
                        <Badge 
                          key={seatId} 
                          bg="light" 
                          text="dark" 
                          className="p-1" 
                          style={{ fontSize: fontSize - 2 }}
                        >
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
      
      {/* Seat Details Modal */}
      {showSeatModal && selectedSeatDetail && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1050 
          }}
          onClick={handleModalClose}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-info-circle-fill text-primary me-2"></i>
                  Seat Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleModalClose}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <i 
                    className={getSeatIcon(selectedSeatDetail.status, isSelected(selectedSeatDetail.id))} 
                    style={{ fontSize: 40 }}
                  ></i>
                  <div>
                    <h6 className="fw-bold mb-1">
                      {selectedSeatDetail.sectionLabel} - Row {selectedSeatDetail.rowIndex} - Seat {selectedSeatDetail.col}
                    </h6>
                    <Badge bg={selectedSeatDetail.status === 'available' ? 'success' : 'secondary'}>
                      {selectedSeatDetail.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <small className="text-muted d-block">Price Tier</small>
                      <span className="fw-bold">Tier {selectedSeatDetail.priceTier}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <small className="text-muted d-block">Price</small>
                      <span className="fw-bold text-primary">${selectedSeatDetail.price}</span>
                    </div>
                  </div>
                </div>
                
                {selectedSeatDetail.status === 'available' && (
                  <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    This seat is available for selection
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleModalClose}
                >
                  Close
                </button>
                {selectedSeatDetail.status === 'available' && (
                  <button 
                    type="button" 
                    className={`btn ${isSelected(selectedSeatDetail.id) ? 'btn-danger' : 'btn-primary'}`}
                    onClick={handleModalSeatAction}
                  >
                    {isSelected(selectedSeatDetail.id) ? 'Remove Seat' : 'Select Seat'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});