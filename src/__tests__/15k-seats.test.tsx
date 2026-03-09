import { describe, bench, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SeatMap } from '../components/SeatMap/SeatMap'
import { useSeatStore } from '../store/useSeatStore'

import type { Venue, Section, Row, Seat } from '../types/venue'

const SEATS_PER_ROW = 50
const SECTIONS = 4
const TOTAL_SEATS = 15000

function createSeat(sectionIndex: number, rowIndex: number, seatIndex: number): Seat {
  return {
    id: `${String.fromCharCode(65 + sectionIndex)}-${rowIndex + 1}-${(seatIndex + 1)
      .toString()
      .padStart(2, '0')}`,
    col: seatIndex + 1,
    x: 50 + seatIndex * 30,
    y: 100 + rowIndex * 40,
    priceTier: ((sectionIndex % 3) + 1) as 1 | 2 | 3,
    status: seatIndex % 5 === 0 ? 'reserved' : 'available' // deterministic
  }
}

function generateLargeVenue(seatCount = TOTAL_SEATS): Venue {
  const sections: Section[] = []
  const seatsPerSection = Math.floor(seatCount / SECTIONS)

  for (let s = 0; s < SECTIONS; s++) {
    const rows: Row[] = []
    const rowsInSection = Math.ceil(seatsPerSection / SEATS_PER_ROW)

    for (let r = 0; r < rowsInSection; r++) {
      const remaining = seatsPerSection - r * SEATS_PER_ROW
      const seatsInRow = Math.min(SEATS_PER_ROW, remaining)

      const seats: Seat[] = Array.from({ length: seatsInRow }, (_, i) =>
        createSeat(s, r, i)
      )

      rows.push({
        index: r + 1,
        seats
      })
    }

    sections.push({
      id: String.fromCharCode(65 + s),
      label: `Section ${String.fromCharCode(65 + s)}`,
      transform: { x: 200 * s, y: 0, scale: 1 },
      rows
    })
  }

  return {
    venueId: 'large-arena',
    name: 'Large Arena',
    map: { width: 2000, height: 2000 },
    sections
  }
}

const largeVenue = generateLargeVenue()

describe('SeatMap performance', () => {
  beforeEach(() => {
    useSeatStore.setState({ selectedSeats: [] })
  })

  bench(
    'render 15,000 seats',
    () => {
      render(<SeatMap venue={largeVenue} />)
    },
    { iterations: 10, time: 1000 }
  )

  bench(
    'store operations with 8 selections',
    () => {
      const { addSeat, removeSeat } = useSeatStore.getState()

      for (let i = 1; i <= 8; i++) {
        addSeat(`A-1-${String(i).padStart(2, '0')}`)
      }

      for (let i = 1; i <= 8; i++) {
        removeSeat(`A-1-${String(i).padStart(2, '0')}`)
      }
    },
    { iterations: 100, time: 100 }
  )

  bench(
    'subtotal calculation with 8 seats',
    () => {
      const seats = [
        'A-1-01','A-1-02','A-1-03','A-1-04',
        'B-1-01','B-1-02','C-1-01','C-1-02'
      ]

      const total = seats.reduce((sum, seatId) => {
        const tier = seatId[0] === 'A' ? 3 : seatId[0] === 'B' ? 2 : 1
        const price = tier === 3 ? 75 : tier === 2 ? 60 : 50
        return sum + price
      }, 0)

      if (total < 0) throw new Error('Invalid subtotal')
    },
    { iterations: 1000, time: 100 }
  )
})