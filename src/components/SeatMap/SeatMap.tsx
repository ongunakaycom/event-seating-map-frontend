import type { FC } from 'react';
import type { Venue } from '../../types/venue';
import { useState, useEffect } from 'react';
import { useSeatStore } from '../../store/useSeatStore';

interface SeatMapProps {
  venue: Venue;
}

export const SeatMap: FC<SeatMapProps> = ({ venue }) => {
  const [seatSize, setSeatSize] = useState(8);
  const [fontSize, setFontSize] = useState(12);
  const [scale, setScale] = useState(1);
  
  const { addSeat, removeSeat, isSelected, selectedSeats, maxSeats } = useSeatStore();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 576) { // xs
        setSeatSize(5);
        setFontSize(10);
      } else if (width < 768) { // sm
        setSeatSize(6);
        setFontSize(11);
      } else if (width < 992) { // md
        setSeatSize(7);
        setFontSize(12);
      } else if (width < 1200) { // lg
        setSeatSize(8);
        setFontSize(13);
      } else { // xl
        setSeatSize(9);
        setFontSize(14);
      }

      const container = document.querySelector('.seat-map-container');
      if (container) {
        const containerWidth = container.clientWidth - 32;
        if (containerWidth < venue.map.width) {
          setScale(containerWidth / venue.map.width);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [venue.map.width]);

  const handleSeatClick = (seatId: string, status: string) => {
    if (status !== 'available') return;
    
    if (isSelected(seatId)) {
      removeSeat(seatId);
    } else {
      if (selectedSeats.length < maxSeats) {
        addSeat(seatId);
      } else {
        // Daha kullanıcı dostu bir alert
        alert(`You can only select up to ${maxSeats} seats. Please deselect a seat first.`);
      }
    }
  };

  const getSeatColor = (status: string, selected: boolean) => {
    if (selected) return '#0d6efd'; // Bootstrap primary blue
    
    switch(status) {
      case 'available': return '#28a745'; // success green
      case 'reserved': return '#ffc107'; // warning yellow
      case 'sold': return '#dc3545'; // danger red
      case 'held': return '#6c757d'; // secondary gray
      default: return '#dee2e6'; // light gray
    }
  };

  const getSeatStatus = (status: string, selected: boolean) => {
    if (selected) return 'Selected';
    switch(status) {
      case 'available': return 'Available';
      case 'reserved': return 'Reserved';
      case 'sold': return 'Sold';
      case 'held': return 'Held';
      default: return status;
    }
  };

  return (
    <div className="seat-map-container w-100 d-flex justify-content-center">
      <div style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top left',
        transition: 'transform 0.2s ease'
      }}>
        <svg
          width={venue.map.width}
          height={venue.map.height}
          viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
          style={{
            display: 'block',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {/* Arka plan deseni */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e9ecef" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={venue.map.width} height={venue.map.height} fill="url(#grid)" />
          
          {/* Sections */}
          {venue.sections.map((section) => (
            <g
              key={section.id}
              transform={`translate(${section.transform.x}, ${section.transform.y}) scale(${section.transform.scale})`}
            >
              {/* Section background */}
              <rect
                x={-20}
                y={-30}
                width={section.rows.reduce((max, row) => 
                  Math.max(max, ...row.seats.map(s => s.x + 50)), 0)}
                height={section.rows.length * 50 + 50}
                fill="rgba(13, 110, 253, 0.02)"
                rx={8}
              />
              
              {/* Section label */}
              <text
                x="10"
                y="-35"
                style={{
                  fontSize: `${fontSize}px`,
                  fill: '#0d6efd',
                  fontWeight: 'bold',
                }}
              >
                {section.label}
              </text>

              {/* Rows and seats */}
              {section.rows.map((row) => (
                <g key={`${section.id}-row-${row.index}`}>
                  {/* Row label */}
                  <text
                    x={5}
                    y={(row.seats[0]?.y || 0) - 5}
                    style={{
                      fontSize: `${fontSize - 2}px`,
                      fill: '#6c757d',
                      fontWeight: 500,
                    }}
                  >
                    Row {row.index}
                  </text>
                  
                  {row.seats.map((seat) => {
                    const selected = isSelected(seat.id);
                    const seatColor = getSeatColor(seat.status, selected);
                    
                    return (
                      <circle
                        key={seat.id}
                        cx={seat.x}
                        cy={seat.y}
                        r={seatSize}
                        fill={seatColor}
                        stroke={selected ? '#0a58ca' : '#ffffff'}
                        strokeWidth={selected ? 3 : 2}
                        style={{
                          cursor: seat.status === 'available' || selected ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: seat.status === 'held' && !selected ? 0.5 : 1,
                          filter: selected ? 'drop-shadow(0 4px 8px rgba(13, 110, 253, 0.3))' : 
                                  seat.status === 'available' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (seat.status === 'available' || selected) {
                            e.currentTarget.style.filter = 'brightness(1.1) drop-shadow(0 6px 12px rgba(0,0,0,0.15))';
                            e.currentTarget.style.transform = `scale(1.15)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (seat.status === 'available' || selected) {
                            e.currentTarget.style.filter = selected ? 'drop-shadow(0 4px 8px rgba(13, 110, 253, 0.3))' : 
                                                                      'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                        onClick={() => handleSeatClick(seat.id, seat.status)}
                      >
                        <title>{`${section.label} - Row ${row.index} - Seat ${seat.col} (${getSeatStatus(seat.status, selected)})`}</title>
                      </circle>
                    );
                  })}
                </g>
              ))}
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(20, 50)">
            <rect
              x={-10}
              y={-10}
              width={420}
              height={45}
              fill="white"
              opacity={0.95}
              rx={20}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            
            <text x="0" y="10" style={{ fontSize: `${fontSize - 1}px`, fill: '#495057', fontWeight: 500 }}>
              Status:
            </text>
            
            {/* Available */}
            <circle cx="60" cy="8" r={seatSize - 2} fill="#28a745" stroke="#ffffff" strokeWidth={2} />
            <text x="75" y="12" style={{ fontSize: `${fontSize - 2}px`, fill: '#495057' }}>Available</text>
            
            {/* Selected */}
            <circle cx="150" cy="8" r={seatSize - 2} fill="#0d6efd" stroke="#ffffff" strokeWidth={2} />
            <text x="165" y="12" style={{ fontSize: `${fontSize - 2}px`, fill: '#495057' }}>Selected</text>
            
            {/* Reserved */}
            <circle cx="240" cy="8" r={seatSize - 2} fill="#ffc107" stroke="#ffffff" strokeWidth={2} />
            <text x="255" y="12" style={{ fontSize: `${fontSize - 2}px`, fill: '#495057' }}>Reserved</text>
            
            {/* Sold */}
            <circle cx="330" cy="8" r={seatSize - 2} fill="#dc3545" stroke="#ffffff" strokeWidth={2} />
            <text x="345" y="12" style={{ fontSize: `${fontSize - 2}px`, fill: '#495057' }}>Sold</text>
          </g>

          {/* Info text */}
          <text
            x={venue.map.width - 20}
            y={venue.map.height - 20}
            textAnchor="end"
            style={{
              fontSize: `${fontSize - 2}px`,
              fill: '#6c757d',
              fontStyle: 'italic',
            }}
          >
            Click on available seats to select (max {maxSeats})
          </text>
        </svg>
      </div>
    </div>
  );
};