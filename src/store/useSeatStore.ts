import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SeatStore {
  selectedSeats: string[];
  maxSeats: number;
  addSeat: (seatId: string) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  isSelected: (seatId: string) => boolean;
  getSelectedCount: () => number;
}

export const useSeatStore = create<SeatStore>()(
  persist(
    (set, get) => ({
      selectedSeats: [],
      maxSeats: 8,
      
      addSeat: (seatId) => 
        set((state) => ({
          selectedSeats: state.selectedSeats.length < get().maxSeats 
            ? [...state.selectedSeats, seatId]
            : state.selectedSeats
        })),
      
      removeSeat: (seatId) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter(id => id !== seatId)
        })),
      
      clearSeats: () => set({ selectedSeats: [] }),
      
      isSelected: (seatId) => get().selectedSeats.includes(seatId),
      
      getSelectedCount: () => get().selectedSeats.length,
    }),
    {
      name: 'seat-selection-storage',
    }
  )
);