import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type Service = {
    id: number;
    name: string;
    price: number;
    duration_minutes: number;
    is_active?: boolean;
};

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadServices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from Supabase
            const { data, error: sbError } = await supabase
                .from('services')
                .select('*')
                // .eq('is_active', true) // Comentado para evitar error si la columna no existe aún
                .order('name');

            if (sbError) {
                throw sbError;
            }

            if (data) {
                setServices(data as Service[]);
            }
        } catch (e) {
            console.error('Error loading services:', e);
            setError(e instanceof Error ? e : new Error('Unknown error loading services'));
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadServices();
        }, [loadServices])
    );

    return {
        services,
        loading,
        error,
        refreshServices: loadServices
    };
}
