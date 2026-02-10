
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Appointment = {
    id: number;
    date: string; // "Lunes", "Martes", or "2025-05-19" format eventually
    time: string;
    period: 'AM' | 'PM';
    client: string;
    service: string;
    status: 'pending' | 'completed';
};

interface AppointmentContextType {
    appointments: Appointment[];
    addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => boolean;
    toggleStatus: (id: number) => void;
    getAppointmentsByDay: (day: string) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error('useAppointments must be used within an AppointmentProvider');
    }
    return context;
};

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
    // Initial seed data
    const [appointments, setAppointments] = useState<Appointment[]>([
        { id: 1, date: 'Lunes', time: '10:00', period: 'AM', client: 'Juan Perez', service: 'Corte Adulto', status: 'pending' },
        { id: 2, date: 'Lunes', time: '11:00', period: 'AM', client: 'Maria Lopez', service: 'Corte Niño', status: 'completed' },
        { id: 3, date: 'Lunes', time: '01:00', period: 'PM', client: 'Carlos Ruiz', service: 'Barba', status: 'pending' },
        { id: 4, date: 'Martes', time: '09:00', period: 'AM', client: 'Pedro Paco', service: 'Corte + Barba', status: 'pending' },
    ]);

    const addAppointment = (apt: Omit<Appointment, 'id' | 'status'>) => {
        const isDuplicate = appointments.some(a =>
            a.date === apt.date &&
            a.time === apt.time &&
            a.period === apt.period &&
            a.status !== 'completed' // Optional: allow re-booking if previous was completed/cancelled? Adjust based on requirements. For now, strict no-overlap.
        );

        if (isDuplicate) {
            return false;
        }

        const newId = Math.max(...appointments.map(a => a.id), 0) + 1;

        const newAppointment = { ...apt, id: newId, status: 'pending' as const };

        setAppointments(prev => {
            const updated = [...prev, newAppointment];
            // Sort by period (AM/PM) then time
            return updated.sort((a, b) => {
                const getMinutes = (time: string, period: string) => {
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return hours * 60 + minutes;
                };
                return getMinutes(a.time, a.period) - getMinutes(b.time, b.period);
            });
        });
        return true;
    };

    const toggleStatus = (id: number) => {
        setAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: apt.status === 'pending' ? 'completed' : 'pending' } : apt
        ));
    };

    const getAppointmentsByDay = (day: string) => {
        return appointments.filter(apt => apt.date === day);
    };

    return (
        <AppointmentContext.Provider value={{ appointments, addAppointment, toggleStatus, getAppointmentsByDay }}>
            {children}
        </AppointmentContext.Provider>
    );
};
