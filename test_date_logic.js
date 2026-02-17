
// Simulate the logic in book.tsx and AppointmentContext.tsx

function simulateBookLogic(currentHour, offsetDays) {
    console.log(`\n--- Simulating Booking at ${currentHour}:00 ---`);

    // Mock current time
    const today = new Date("2026-05-18T00:00:00"); // Start of a Monday
    today.setHours(currentHour);

    console.log("Current Local Time:", today.toString());

    // Logic from book.tsx (OLD)
    // const targetDate = new Date(today);
    // targetDate.setDate(today.getDate() + offsetDays); 
    // const isoParams = targetDate.toISOString().split('T')[0];

    // Logic from book.tsx (NEW - PROPOSED FIX)
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offsetDays);

    // Manual YYYY-MM-DD construction using Local time
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const isoParams = `${year}-${month}-${day}`;

    console.log("Calculated ISO Date (isoParams) [FIXED]:", isoParams);

    return isoParams;
}

function simulateContextLogic(isoDate, timeStr, period) {
    console.log(`\n--- Simulating Context AddAppointment ---`);
    console.log(`Input: isoDate=${isoDate}, time=${timeStr}, period=${period}`);

    // Logic from AppointmentContext.tsx (OLD)
    /*
    let targetDate = new Date();
    if (isoDate) {
        targetDate = new Date(isoDate); 
    }
    // ... setHours ...
    */

    // Logic from AppointmentContext.tsx (NEW - PROPOSED FIX)
    // Validate isoDate format YYYY-MM-DD
    const [y, m, d] = isoDate.split('-').map(Number);
    // Create date at midnight LOCAL time
    const targetDate = new Date(y, m - 1, d); // Note: Month is 0-indexed

    console.log("Date object created from components:", targetDate.toString());

    let [h, min] = timeStr.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    // setHours sets LOCAL time on the local date object
    targetDate.setHours(h, min || 0, 0, 0);

    const startTimeISO = targetDate.toISOString();
    console.log("Final Database start_time (ISO) [FIXED]:", startTimeISO);
    return startTimeISO;
}

// Scenario 1: Booking for "Today" (Monday) at 8 PM (local), selecting 2 PM slot.
const today = new Date();
console.log("System Timezone Offset:", today.getTimezoneOffset());

// Simulate "Monday" booking
// offset 0 (Monday -> Monday)
const iso = simulateBookLogic(20, 0); // User is booking at 8 PM

// Simulate saving "Monday" 2:00 PM
simulateContextLogic(iso, "2:00", "PM");
