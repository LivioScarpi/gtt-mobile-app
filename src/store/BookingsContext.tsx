import React, { createContext, useContext, useState, useCallback } from 'react';

export type BookingStatus = 'confermata' | 'completata' | 'cancellata';

export interface Booking {
  id: string;
  prestazione: string;
  medico: string;
  ruolo: string;
  studio: string;
  indirizzo: string;
  citta: string;
  day: number;
  month: number; // 0-indexed
  year: number;
  time: string;
  prezzo: number;
  status: BookingStatus;
  paymentLabel: string;
}

interface BookingsContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  cancelBooking: (id: string) => void;
}

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'demo-1',
    prestazione: 'Visita Cardiologica',
    medico: 'Andrea Conti',
    ruolo: 'Cardiologo',
    studio: 'Crocetta',
    indirizzo: 'Corso Re Umberto, 44',
    citta: 'Torino',
    day: 12,
    month: 2, // Marzo
    year: 2026,
    time: '09:30',
    prezzo: 160,
    status: 'confermata',
    paymentLabel: 'Mastercard •••• 4821',
  },
  {
    id: 'demo-2',
    prestazione: 'Visita Dentistica',
    medico: 'Letizia Moramarco',
    ruolo: 'Igienista dentale',
    studio: 'San Salvario',
    indirizzo: 'Via Madama Cristina, 50',
    citta: 'Torino',
    day: 22,
    month: 2,
    year: 2026,
    time: '14:30',
    prezzo: 140,
    status: 'confermata',
    paymentLabel: 'Visa •••• 7733',
  },
  {
    id: 'demo-3',
    prestazione: 'Controllo Generale',
    medico: 'Marco Rossi',
    ruolo: 'Medico generico',
    studio: 'Centro',
    indirizzo: 'Via Roma, 12',
    citta: 'Torino',
    day: 15,
    month: 1, // Febbraio
    year: 2026,
    time: '10:00',
    prezzo: 80,
    status: 'completata',
    paymentLabel: 'Mastercard •••• 4821',
  },
  {
    id: 'demo-4',
    prestazione: 'Visita Oculistica',
    medico: 'Chiara Lombardi',
    ruolo: 'Oculista',
    studio: 'Porta Venezia',
    indirizzo: 'Corso Buenos Aires, 33',
    citta: 'Milano',
    day: 28,
    month: 0, // Gennaio
    year: 2026,
    time: '14:00',
    prezzo: 155,
    status: 'completata',
    paymentLabel: 'Apple Pay',
  },
  {
    id: 'demo-5',
    prestazione: 'Visita Dermatologica',
    medico: 'Valentina Costa',
    ruolo: 'Dermatologa',
    studio: 'San Salvario',
    indirizzo: 'Via Nizza, 45',
    citta: 'Torino',
    day: 10,
    month: 1,
    year: 2026,
    time: '11:00',
    prezzo: 120,
    status: 'cancellata',
    paymentLabel: 'Visa •••• 7733',
  },
];

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  const addBooking = useCallback((data: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...data,
      id: String(Date.now()),
      status: 'confermata',
    };
    setBookings((prev) => [newBooking, ...prev]);
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancellata' as BookingStatus } : b)),
    );
  }, []);

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
