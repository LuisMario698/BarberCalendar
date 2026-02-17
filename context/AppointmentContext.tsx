import { supabase } from '@/lib/supabase';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export type Appointment = {
    id: number;
    date: string; // "Lunes", "Martes" (UI Display)
    isoDate?: string; // "YYYY-MM-DD" (For filtering/history)
    time: string;
    period: 'AM' | 'PM';
    client: string;
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

        const getMinutes = (time: string, period: 'AM' | 'PM') => {
            let [hours, minutes] = time.split(':').map(Number);
            // Convert 12-hour to 24-hour
            if (period === 'AM' && hours === 12) hours = 0;      // 12:xx AM = 0:xx
            else if (period === 'PM' && hours !== 12) hours += 12; // 1-11 PM = 13-23
            // 12 PM stays as 12
            return hours * 60 + (minutes || 0);
        };

        return [...apts].sort((a, b) => {
            // 1. Sort by ISO date if both have it
            if (a.isoDate && b.isoDate) {
                const dateCmp = a.isoDate.localeCompare(b.isoDate);
                if (dateCmp !== 0) return dateCmp;
            } else {
                // Fallback: sort by day name for legacy data
                const dayDiff = (dayOrder[a.date] || 8) - (dayOrder[b.date] || 8);
                if (dayDiff !== 0) return dayDiff;
            }

            // 2. Sort by time within the same day
            return getMinutes(a.time, a.period) - getMinutes(b.time, b.period);
        });
    }, []);

    const refreshAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch strictly from Cloud
            const { data: cloudData, error } = await supabase
                .from('appointments')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) {
                console.error("Cloud fetch failed:", error);
                Alert.alert('Error', 'No se pudo conectar a la base de datos.');
            } else {
                // Map cloud data to App format
                const mappedData: Appointment[] = (cloudData || []).map((item: any) => {
                    // Handle missing start_time (legacy data)
                    let dateObj = new Date();
                    let iso = '';

                    if (item.start_time) {
                        dateObj = new Date(item.start_time);
                        iso = item.start_time.split('T')[0];
                    } else if (item.created_at) {
                        // Fallback to created_at if start_time missing
                        dateObj = new Date(item.created_at);
                        iso = item.created_at.split('T')[0];
                    }

                    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const dayName = days[dateObj.getDay()]; // Or use item.date if it exists and is valid text

                    // Prefer item.date if it exists (legacy text), else calculated dayName
                    // Actually, for consistency, we probably want to display what was saved.
                    // But if we move to ISO, we should rely on ISO.
                    // Let's use stored dayName if available, else calc.
                    const finalDayName = (item.date && days.includes(item.date)) ? item.date : dayName;

                    // Time formatting
                    let timeStr = item.time;
                    let periodStr = item.period;

                    if (!timeStr && item.start_time) {
                        let hours = dateObj.getHours();
                        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                        periodStr = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12 || 12; // 12h format
                        timeStr = `${hours}:${minutes}`;
                    }

                    return {
                        id: item.id,
                        date: finalDayName || 'Lunes',
                        isoDate: iso,
                        time: timeStr || '09:00',
                        period: periodStr || 'AM',
                        client: item.client,
                        service: item.service,
                        price: Number(item.price),
                        status: item.status
                    };
                });

                const sorted = sortAppointments(mappedData);
                console.log('📅 Appointments sorted chronologically:', sorted.map(a => ({
                    date: a.isoDate || a.date,
                    time: `${a.time} ${a.period}`,
                    client: a.client
                })));
                setAppointments(sorted);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            Alert.alert('Error', 'Error inesperado al cargar citas.');
        } finally {
            setIsLoading(false);
        }
    }, [sortAppointments]);

    // Initial load
    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    const addAppointment = async (apt: Omit<Appointment, 'id' | 'status'>): Promise<boolean> => {
        try {
            let targetDate = new Date();
            if (apt.isoDate) {
                targetDate = new Date(apt.isoDate);
            }

            let [h, m] = apt.time.split(':').map(Number);
            if (apt.period === 'PM' && h !== 12) h += 12;
            if (apt.period === 'AM' && h === 12) h = 0;
            targetDate.setHours(h, m || 0, 0, 0);

            const startTimeISO = targetDate.toISOString();

            // Check for duplicate directly in Supabase (most reliable)
            const { data: existing } = await supabase
                .from('appointments')
                .select('id')
                .eq('start_time', startTimeISO)
                .limit(1);

            if (existing && existing.length > 0) {
                if (Platform.OS === 'web') {
                    window.alert('Ya existe una cita programada para este horario.');
                } else {
                    Alert.alert('Horario Ocupado', 'Ya existe una cita programada para este horario.');
                }
                return false;
            }

            const { error } = await supabase.from('appointments').insert([{
                start_time: startTimeISO,
                date: apt.date,
                time: apt.time,
                period: apt.period,
                client: apt.client,
                service: apt.service,
                price: apt.price,
                status: 'pending'
            }]);

            if (error) throw error;
            await refreshAppointments();
            return true;
        } catch (error) {
            console.error('Error adding appointment:', error);
            if (Platform.OS === 'web') {
                window.alert('No se pudo guardar la cita.');
            } else {
                Alert.alert('Error', 'No se pudo guardar la cita.');
            }
            return false;
        }
    };

    const toggleStatus = async (id: number) => {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;
        const newStatus = apt.status === 'pending' ? 'completed' : 'pending';

        // Optimistic update
        setAppointments(prev => sortAppointments(prev.map(a => a.id === id ? { ...a, status: newStatus } : a)));

        try {
            const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating status:', error);
            refreshAppointments(); // Revert
            Alert.alert('Error', 'No se pudo actualizar.');
        }
    };

    const deleteAppointment = async (id: number) => {
        // Optimistic
        setAppointments(prev => prev.filter(a => a.id !== id));

        try {
            const { error } = await supabase.from('appointments').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting:', error);
            refreshAppointments(); // Revert
            Alert.alert('Error', 'No se pudo eliminar.');
        }
    };

    const getAppointmentsByDay = (day: string) => appointments.filter(apt => apt.date === day);

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
