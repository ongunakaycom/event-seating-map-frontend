import type { FC } from 'react';
import type { Venue } from '../../types/venue';
import './SeatMap.css';

interface SeatMapProps {
  venue: Venue;
}

export const SeatMap: FC<SeatMapProps> = ({ venue }) => {
  return (
    <div className="seat-map">
      <svg
        width={venue.map.width}
        height={venue.map.height}
        viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
        className="seat-map-svg"
      >
        {/* Sections */}
        {venue.sections.map((section) => (
          <g
            key={section.id}
            transform={`translate(${section.transform.x}, ${section.transform.y}) scale(${section.transform.scale})`}
            className="section"
          >
            {/* Section label */}
            <text x="10" y="-10" className="section-label">
              {section.label}
            </text>

            {/* Rows and seats */}
            {section.rows.map((row) => (
              <g key={`${section.id}-row-${row.index}`} className="row">
                {row.seats.map((seat) => (
                  <circle
                    key={seat.id}
                    cx={seat.x}
                    cy={seat.y}
                    r="8"
                    className={`seat seat-${seat.status}`}
                    data-seat-id={seat.id}
                    data-status={seat.status}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};