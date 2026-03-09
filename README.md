# Interactive Event Seating Map

A modern, responsive React + TypeScript application for interactive event seat selection. Users can view venue seating layouts, select up to 8 seats, and see real-time pricing updates.

## 🚀 Features

### Core Requirements ✅
- **Interactive Seat Map**: Render venue seats with absolute coordinates from JSON data
- **Seat Selection**: Click or keyboard (Enter/Space) to select/deselect available seats
- **8 Seat Limit**: Maximum 8 seats per selection with visual feedback
- **Live Summary**: Real-time subtotal calculation with price tiers
- **Persistence**: Selected seats persist after page reload (localStorage)
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Additional Features ✨
- **Seat Details Modal**: Click any seat to view section, row, seat number, price tier, and status
- **Price Tiers**:
  - Tier 1 (Standard): $50 - Lower Bowl C, D
  - Tier 2 (Premium): $60 - Lower Bowl B
  - Tier 3 (VIP): $75 - Lower Bowl A
- **Responsive Layout**:
  - Mobile (<768px): Single column, large icons (32px)
  - Tablet (768-992px): 2 columns, medium icons (26px)
  - Desktop (>992px): 2 columns, small icons (24px)
- **Mobile Offcanvas**: Summary slides from bottom on mobile devices
- **Status Legend**: Color-coded seat status (Available, Selected, Reserved, Sold, Held)
- **Keyboard Shortcuts**: Escape to close mobile summary

## 🏗️ Architecture Choices

### Technology Stack
- **React 18**: Component-based UI architecture
- **TypeScript** (`strict: true`): Type safety and better developer experience
- **Vite**: Fast development server and optimized builds
- **Zustand**: Lightweight state management with localStorage persistence
- **Bootstrap 5**: Responsive grid system and utility classes
- **Bootstrap Icons**: Modern icon set for seat visualization

### Key Design Decisions

1. **State Management (Zustand)**
   - Simple API with minimal boilerplate
   - Built-in persistence middleware for localStorage
   - Centralized seat selection logic

2. **Component Structure**
   - `SeatMap`: Renders venue sections and seats with responsive grid
   - `Summary`: Displays selected seats and pricing
   - Clean separation of concerns with custom hooks

3. **Responsive Strategy**
   - Mobile-first approach with breakpoint constants
   - Dynamic icon sizing based on viewport
   - Flexbox grid system for 2-column layout on desktop

4. **Performance Optimizations**
   - `useMemo`/`useCallback` for expensive calculations
   - React.memo for preventing unnecessary re-renders
   - Responsive scaling without layout shifts

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/event-seating-map-frontend.git
cd event-seating-map-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev