import { describe, it, expect, beforeEach } from 'vitest';
import { useSeatStore } from '../store/useSeatStore';

describe('useSeatStore', () => {
  beforeEach(() => {
    // Store'u her test öncesi temizle
    useSeatStore.setState({ selectedSeats: [] });
  });

  it('should initialize with empty selected seats', () => {
    const { selectedSeats, maxSeats } = useSeatStore.getState();
    expect(selectedSeats).toEqual([]);
    expect(maxSeats).toBe(8);
  });

  it('should add a seat when available', () => {
    const { addSeat, getSelectedCount } = useSeatStore.getState();
    
    addSeat('A-1-01');
    expect(useSeatStore.getState().selectedSeats).toContain('A-1-01');
    expect(getSelectedCount()).toBe(1);
  });

  it('should not add more than maxSeats (8)', () => {
    const { addSeat } = useSeatStore.getState(); // selectedSeats kaldırıldı
    
    // 9 seat eklemeyi dene
    for (let i = 1; i <= 9; i++) {
      addSeat(`A-1-${i.toString().padStart(2, '0')}`);
    }
    
    expect(useSeatStore.getState().selectedSeats.length).toBe(8);
  });

  it('should remove a seat', () => {
    const { addSeat, removeSeat, isSelected } = useSeatStore.getState();
    
    addSeat('A-1-01');
    expect(isSelected('A-1-01')).toBe(true);
    
    removeSeat('A-1-01');
    expect(isSelected('A-1-01')).toBe(false);
  });

  it('should clear all seats', () => {
    const { addSeat, clearSeats, getSelectedCount } = useSeatStore.getState();
    
    addSeat('A-1-01');
    addSeat('A-1-02');
    expect(getSelectedCount()).toBe(2);
    
    clearSeats();
    expect(getSelectedCount()).toBe(0);
  });

  it('should persist to localStorage', () => {
    const { addSeat } = useSeatStore.getState();
    addSeat('A-1-01');
    
    // localStorage'ı kontrol et
    const stored = localStorage.getItem('seat-selection-storage');
    expect(stored).toBeDefined();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.state.selectedSeats).toContain('A-1-01');
  });
});