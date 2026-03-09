import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Summary } from '../components/Summary/Summary';
import { useSeatStore } from '../store/useSeatStore';

// Mock the store
vi.mock('../store/useSeatStore', () => ({
  useSeatStore: vi.fn()
}));

// Tip tanımı ekleyelim
interface MockStore {
  selectedSeats: string[];
  maxSeats: number;
  clearSeats: ReturnType<typeof vi.fn>;
  getSelectedCount: ReturnType<typeof vi.fn>;
  isSelected: ReturnType<typeof vi.fn>;
}

describe('Summary Component', () => {
  // Tipi açıkça belirtiyoruz
  const mockStore: MockStore = {
    selectedSeats: [],
    maxSeats: 8,
    clearSeats: vi.fn(),
    getSelectedCount: vi.fn().mockReturnValue(0),
    isSelected: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeatStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
  });

  it('renders empty state when no seats selected', () => {
    render(<Summary />);
    
    expect(screen.getByText(/click on available seats/i)).toBeInTheDocument();
    expect(screen.getByText(/you can select up to 8 seats/i)).toBeInTheDocument();
  });

  it('displays selected seats count', () => {
    mockStore.getSelectedCount.mockReturnValue(3);
    mockStore.selectedSeats = ['A-1-01', 'A-1-02', 'A-1-03'];
    
    render(<Summary />);
    
    expect(screen.getByText('3/8')).toBeInTheDocument();
    expect(screen.getByText('Remaining:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 8-3=5
  });

  it('calculates total price correctly', () => {
    mockStore.selectedSeats = ['A-1-01', 'B-1-01', 'C-1-01']; // Tier 3,2,1
    mockStore.getSelectedCount.mockReturnValue(3);
    
    render(<Summary />);
    
    // A: $75, B: $60, C: $50 = $185
    expect(screen.getByText('$185')).toBeInTheDocument();
  });

  it('calls clearSeats when clear button clicked', async () => {
    const user = userEvent.setup();
    mockStore.selectedSeats = ['A-1-01'];
    mockStore.getSelectedCount.mockReturnValue(1);
    
    render(<Summary />);
    
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearButton);
    
    expect(mockStore.clearSeats).toHaveBeenCalled();
  });

  it('shows warning when max seats reached', () => {
    mockStore.selectedSeats = Array(8).fill('A-1-01');
    mockStore.getSelectedCount.mockReturnValue(8);
    
    render(<Summary />);
    
    const badge = screen.getByText('8/8');
    expect(badge.className).toContain('warning');
  });
});