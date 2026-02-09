import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('barber.db');

export const initDatabase = () => {
    try {
        // Services Table
        db.execSync(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1
      );
    `);

        // Weekly Schedule Table
        db.execSync(`
      CREATE TABLE IF NOT EXISTS weekly_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL, -- 0=Sun, 1=Mon...
        start_time TEXT NOT NULL, -- "HH:MM"
        end_time TEXT NOT NULL, -- "HH:MM"
        is_open INTEGER DEFAULT 1
      );
    `);

        // Appointments Table
        db.execSync(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        start_time TEXT NOT NULL, -- ISO 8601
        end_time TEXT NOT NULL, -- ISO 8601
        client_name TEXT,
        FOREIGN KEY (service_id) REFERENCES services (id)
      );
    `);

        // Settings Table (for tracking current week)
        db.execSync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

        console.log('Database initialized successfully');

        // Seed Data Check
        const result = db.getAllSync('SELECT * FROM services');
        if (result.length === 0) {
            seedData();
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

const seedData = () => {
    try {
        db.runSync('INSERT INTO services (name, price, duration_minutes) VALUES (?, ?, ?)', ['Corte de Cabello', 25.00, 30]);
        db.runSync('INSERT INTO services (name, price, duration_minutes) VALUES (?, ?, ?)', ['Barba', 15.00, 20]);
        db.runSync('INSERT INTO services (name, price, duration_minutes) VALUES (?, ?, ?)', ['Corte y Barba', 35.00, 50]);

        // Default Schedule: Mon-Sat 9am-8pm
        for (let i = 1; i <= 6; i++) {
            db.runSync('INSERT INTO weekly_schedule (day_of_week, start_time, end_time, is_open) VALUES (?, ?, ?, ?)', [i, '09:00', '20:00', 1]);
        }
        // Sunday Closed
        db.runSync('INSERT INTO weekly_schedule (day_of_week, start_time, end_time, is_open) VALUES (?, ?, ?, ?)', [0, '00:00', '00:00', 0]);

        console.log('Seed data inserted');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};
