// Web version of database initialization
// Completely bypasses expo-sqlite to avoid WASM issues on web
// This file is used when Platform.OS === 'web'

export const db = null;

export const initDatabase = async () => {
    console.log('Web environment: Skipping SQLite initialization.');
};
