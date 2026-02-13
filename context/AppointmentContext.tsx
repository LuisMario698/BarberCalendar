
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';

export type Appointment = {
    id: number;
    date: string; // "Lunes", "Martes", or "2025-05-19" format eventually
    time: string;
    period: 'AM' | 'PM';
    client: string; // This corresponds to 'client' (renamed in SQL from 'client_name' perhaps, or matched)
    service: string;
    price: number;
    status: 'pending' | 'completed';
};

interface AppointmentContextType {
    appointments: Appointment[];
    isLoading: boolean;
    addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => Promise<boolean>;
    toggleStatus: (id: number) => Promise<void>;
    deleteAppointment: (id: number) => Promise<void>;
    getAppointmentsByDay: (day: string) => Appointment[];
    refreshAppointments: () => Promise<void>;
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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sortAppointments = useCallback((apts: Appointment[]) => {
        const dayOrder: { [key: string]: number } = {
            'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7
        };

        return [...apts].sort((a, b) => {
            // 1. Sort by Day
            const dayDiff = (dayOrder[a.date] || 8) - (dayOrder[b.date] || 8);
            if (dayDiff !== 0) return dayDiff;

            // 2. Sort by Period (AM before PM)
            if (a.period !== b.period) {
                return a.period === 'AM' ? -1 : 1;
            }

            // 3. Sort by Time
            const getMinutes = (time: string, period: 'AM' | 'PM') => {
                let [hours, minutes] = time.split(':').map(Number);
                if (hours === 12) hours = 0; // 12 AM is 00:00, 12 PM is 12:00
                if (period === 'PM' && hours !== 12) hours += 12; // Convert PM hours (except 12 PM) to 24-hour format
                if (period === 'AM' && hours === 12) hours = 0; // Convert 12 AM to 00:00
                return hours * 60 + (minutes || 0);
            };

            return getMinutes(a.time, a.period) - getMinutes(b.time, b.period);
        });
    }, []);

    const refreshAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setAppointments(sortAppointments(data as Appointment[]));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Optionally Alert.alert('Error', 'No se pudieron cargar las citas');
        } finally {
            setIsLoading(false);
        }
    }, [sortAppointments]);

    // Initial load
    useFocusEffect(
        useCallback(() => {
            refreshAppointments();
        }, [refreshAppointments])
    );

    const addAppointment = async (apt: Omit<Appointment, 'id' | 'status'>): Promise<boolean> => {
        // Check for duplicates locally first (optional optimization)
        const isDuplicate = appointments.some(a =>
            a.date === apt.date &&
            a.time === apt.time &&
            a.period === apt.period &&
            a.status !== 'completed'
        );

        if (isDuplicate) {
            return false;
        }

        try {
            const { error } = await supabase
                .from('appointments')
                .insert([{
                    date: apt.date,
                    time: apt.time,
                    period: apt.period,
                    client: apt.client,
                    service: apt.service,
                    price: apt.price,
                    status: 'pending'
                }]);

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            await refreshAppointments();
            return true;
        } catch (error) {
            console.error('Error adding appointment:', error);
            return false;
        }
    };

    const toggleStatus = async (id: number) => {
        // Optimistic update
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        const newStatus = apt.status === 'pending' ? 'completed' : 'pending';

        // Update local state immediately
        setAppointments(prev => sortAppointments(prev.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        )));

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert on error
            setAppointments(prev => sortAppointments(prev.map(a =>
                a.id === id ? { ...a, status: apt.status } : a
            )));
            Alert.alert('Error', 'No se pudo actualizar el estado de la cita.');
        }
    };

    const deleteAppointment = async (id: number) => {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        // Optimistic update
        setAppointments(prev => prev.filter(a => a.id !== id));

        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            // Revert
            setAppointments(prev => sortAppointments([...prev, apt]));
            Alert.alert('Error', 'No se pudo eliminar la cita.');
        }
    };

    const getAppointmentsByDay = (day: string) => {
        return appointments.filter(apt => apt.date === day);
    };

    return (
        <AppointmentContext.Provider value={{
            appointments,
            isLoading,
            addAppointment,
            toggleStatus,
            deleteAppointment,
            getAppointmentsByDay,
            refreshAppointments
        }}>
            {children}
        </AppointmentContext.Provider>
    );
};
