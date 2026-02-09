
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
    addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
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
        const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
        setAppointments(prev => [...prev, { ...apt, id: newId, status: 'pending' }]);
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
