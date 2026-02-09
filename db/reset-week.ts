import { db } from './init';

const getWeekNumber = (d: Date) => {
    // ISO 8601 week number
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

export const checkAndResetWeek = () => {
    try {
        const currentWeek = getWeekNumber(new Date());

        // Check stored week
        const result = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['current_week']);
        const storedWeek = result?.value;

        if (!storedWeek) {
            // First run, set current week
            db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['current_week', currentWeek]);
            return;
        }

        if (storedWeek !== currentWeek) {
            console.log(`New week detected! (Old: ${storedWeek}, New: ${currentWeek}). Resetting appointments.`);

            // Delete all appointments
            db.runSync('DELETE FROM appointments');

            // Update settings
            db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['current_week', currentWeek]);
        } else {
            console.log('Same week, no reset needed.');
        }

    } catch (error) {
        console.error('Error checking weekly reset:', error);
    }
};
