import { db } from '@/db/init';
import { useEffect, useState } from 'react';

export interface DaySchedule {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_open: boolean;
}

export function useWeeklySchedule() {
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = () => {
        try {
            const result = db.getAllSync('SELECT * FROM weekly_schedule ORDER BY day_of_week ASC');
            // Ensure we treat 0 as Sunday (last in user's mental model, but 0 in code)
            // The user wants week to start on Monday (1) and end Saturday (6), Sunday (0) is off.
            // Let's sort it 1,2,3,4,5,6,0 for display purposes if needed, but for now just return raw.
            setSchedule(result as DaySchedule[]);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const updateDay = (day_of_week: number, isOpen: boolean, start: string, end: string) => {
        try {
            db.runSync(
                'UPDATE weekly_schedule SET is_open = ?, start_time = ?, end_time = ? WHERE day_of_week = ?',
                [isOpen ? 1 : 0, start, end, day_of_week]
            );
            fetchSchedule(); // Refresh
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    };

    return {
        schedule,
        loading,
        updateDay,
        refetch: fetchSchedule
    };
}
