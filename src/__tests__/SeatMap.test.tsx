import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatMap } from '../components/SeatMap/SeatMap';
import { useSeatStore } from '../store/useSeatStore';
import type { Venue } from '../types/venue'; // Venue tipini import edelim

// Mock venue data - tipini Venue olarak belirtiyoruz
const mockVenue: Venue = {
  venueId: 'test-arena',
  name: 'Test Arena',
  map: { width: 1024, height: 768 },
  sections: [
    {
      id: 'A',
      label: 'Test Section',
      transform: { x: 0, y: 0, scale: 1 },
      rows: [
        {
          index: 1,
          seats: [
            { id: 'A-1-01', col: 1, x: 50, y: 40, priceTier: 1, status: 'available' }, // status doğru tip
            { id: 'A-1-02', col: 2, x: 80, y: 40, priceTier: 2, status: 'reserved' }  // status doğru tip
          ]
        }
      ]
    }
  ]
};

// Mock store için interface
interface MockStore {
  selectedSeats: string[];
  maxSeats: number;
  addSeat: ReturnType<typeof vi.fn>;
  removeSeat: ReturnType<typeof vi.fn>;
  isSelected: ReturnType<typeof vi.fn>;
  getSelectedCount: ReturnType<typeof vi.fn>;
}

vi.mock('../store/useSeatStore', () => ({
  useSeatStore: vi.fn()
}));

describe('SeatMap Component', () => {
  const mockStore: MockStore = {
    selectedSeats: [],
    maxSeats: 8,
    addSeat: vi.fn(),
    removeSeat: vi.fn(),
    isSelected: vi.fn().mockReturnValue(false),
    getSelectedCount: vi.fn().mockReturnValue(0)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeatStore as any).mockImplementation(() => mockStore);
  });

  it('renders sections and seats', () => {
    render(<SeatMap venue={mockVenue} />);
    
    // Section label should be visible
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    
    // Seat buttons should be present
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('handles seat click for available seat', () => {
    render(<SeatMap venue={mockVenue} />);
    
    const buttons = document.querySelectorAll('button');
    fireEvent.click(buttons[0]); // Click first seat (available)
    
    expect(mockStore.addSeat).toHaveBeenCalledWith('A-1-01');
  });

  it('does not allow clicking reserved seat', () => {
    render(<SeatMap venue={mockVenue} />);
    
    const buttons = document.querySelectorAll('button');
    fireEvent.click(buttons[1]); // Click second seat (reserved)
    
    expect(mockStore.addSeat).not.toHaveBeenCalled();
  });

  it('handles keyboard selection with Enter key', () => {
    render(<SeatMap venue={mockVenue} />);
    
    const buttons = document.querySelectorAll('button');
    const firstButton = buttons[0];
    
    // Enter key press simülasyonu
    fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });
    
    expect(mockStore.addSeat).toHaveBeenCalledWith('A-1-01');
  });

  it('handles keyboard selection with Space key', () => {
    render(<SeatMap venue={mockVenue} />);
    
    const buttons = document.querySelectorAll('button');
    const firstButton = buttons[0];
    
    // Space key press simülasyonu
    fireEvent.keyDown(firstButton, { key: ' ', code: 'Space' });
    
    expect(mockStore.addSeat).toHaveBeenCalledWith('A-1-01');
  });
});