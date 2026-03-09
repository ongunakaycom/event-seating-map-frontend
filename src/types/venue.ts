export interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

export interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: 'available' | 'reserved' | 'sold' | 'held';
}

export type SeatStatus = Seat['status'];

export interface PriceTier {
  id: number;
  price: number;
  color: string;
  label: string;
}

export const PRICE_TIERS: PriceTier[] = [
  { id: 1, price: 50, color: '#4caf50', label: 'Standard' },   // Tier 1: $50 - Lower Bowl C, D
  { id: 2, price: 60, color: '#2196f3', label: 'Premium' },    // Tier 2: $60 - Lower Bowl B
  { id: 3, price: 75, color: '#9c27b0', label: 'VIP' },        // Tier 3: $75 - Lower Bowl A
];