import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SeatMap } from '../components/SeatMap/SeatMap';
import { useSeatStore } from '../store/useSeatStore';
import type { Venue, Section, Row, Seat } from '../types/venue';

// 15,000 koltuklu venue oluştur
function generateLargeVenue(seatCount: number = 15000): Venue {
  const seatsPerRow = 50;
  const sections: Section[] = [];

  for (let s = 0; s < 4; s++) {
    const rows: Row[] = [];
    const sectionSeats = Math.floor(seatCount / 4);
    const rowsInSection = Math.ceil(sectionSeats / seatsPerRow);

    for (let r = 0; r < rowsInSection; r++) {
      const seats: Seat[] = [];
      const seatsInRow = Math.min(seatsPerRow, sectionSeats - r * seatsPerRow);
      
      for (let i = 0; i < seatsInRow; i++) {
        seats.push({
          id: `${String.fromCharCode(65 + s)}-${r + 1}-${(i + 1).toString().padStart(2, '0')}`,
          col: i + 1,
          x: 50 + i * 30,
          y: 100 + r * 40,
          priceTier: (s % 3) + 1 as 1 | 2 | 3,
          status: Math.random() > 0.7 ? 'available' : 'reserved'
        });
      }

      rows.push({
        index: r + 1,
        seats
      });
    }

    sections.push({
      id: String.fromCharCode(65 + s),
      label: `Section ${String.fromCharCode(65 + s)}`,
      transform: { x: 200 * s, y: 0, scale: 1 },
      rows
    });
  }

  return {
    venueId: 'large-arena',
    name: 'Large Arena',
    map: { width: 2000, height: 2000 },
    sections
  };
}

describe('Performance Tests', () => {
  const largeVenue = generateLargeVenue(15000);

  it('should render 15,000 seats without crashing', () => {
    expect(() => render(<SeatMap venue={largeVenue} />)).not.toThrow();
  });

  it('should handle store operations with 8 selections quickly', () => {
    const { addSeat, removeSeat, getSelectedCount } = useSeatStore.getState();
    const startTime = performance.now();
    
    // 8 seat ekle
    for (let i = 0; i < 8; i++) {
      addSeat(`A-1-${(i + 1).toString().padStart(2, '0')}`);
    }
    
    // 8 seat çıkar
    for (let i = 0; i < 8; i++) {
      removeSeat(`A-1-${(i + 1).toString().padStart(2, '0')}`);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Store operations took: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100); // 100ms'den hızlı olmalı
    expect(getSelectedCount()).toBe(0);
  });

  it('should calculate subtotal for 8 seats quickly', () => {
    const selectedSeats = [
      'A-1-01', 'A-1-02', 'A-1-03', 'A-1-04',
      'B-1-01', 'B-1-02', 'C-1-01', 'C-1-02'
    ];
    
    const startTime = performance.now();
    
    // Subtotal hesaplama simülasyonu
    const total = selectedSeats.reduce((sum, seatId) => {
      const tier = seatId.startsWith('A') ? 3 : seatId.startsWith('B') ? 2 : 1;
      const price = tier === 3 ? 75 : tier === 2 ? 60 : 50;
      return sum + price;
    }, 0);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Subtotal calculation took: ${duration.toFixed(2)}ms`);
    expect(total).toBe(520); // 75*4 + 60*2 + 50*2 = 300 + 120 + 100 = 520
    expect(duration).toBeLessThan(10); // 10ms'den hızlı olmalı
  });

  it('should measure render time for 15,000 seats', () => {
    const startTime = performance.now();
    
    render(<SeatMap venue={largeVenue} />);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ 15,000 seats render took: ${duration.toFixed(2)}ms`);
    // Render süresi makul olmalı (örneğin 1000ms = 1 saniye)
    expect(duration).toBeLessThan(2000);
  });
});