
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
    service: string; // This corresponds to 'service' (renamed in SQL from 'service_name')
    status: 'pending' | 'completed';
};

interface AppointmentContextType {
    appointments: Appointment[];
    isLoading: boolean;
    addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => Promise<boolean>;
    toggleStatus: (id: number) => Promise<void>;
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
                // Transform data if needed, but assuming direct match for now
                // Note: Ensure your Supabase table columns match these keys:
                // date, time, period, client, service, status, id
                setAppointments(data as Appointment[]);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Optionally Alert.alert('Error', 'No se pudieron cargar las citas');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                    client: apt.client,   // Ensure DB column is 'client' or map it
                    service: apt.service, // Ensure DB column is 'service' or map it
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

        // Update local state immediately for UI responsiveness
        setAppointments(prev => prev.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        ));

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
            setAppointments(prev => prev.map(a =>
                a.id === id ? { ...a, status: apt.status } : a
            ));
            Alert.alert('Error', 'No se pudo actualizar el estado de la cita.');
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
            getAppointmentsByDay,
            refreshAppointments
        }}>
            {children}
        </AppointmentContext.Provider>
    );
};
