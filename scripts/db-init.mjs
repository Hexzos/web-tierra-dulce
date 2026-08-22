import { initializeDatabase, defaultDatabasePath } from '../src/lib/database.js';

const databasePath = process.env.TIERRA_DULCE_DB_PATH || defaultDatabasePath;
const db = initializeDatabase(databasePath);
const categories = db.prepare('SELECT count(*) AS count FROM categories').get().count;
const products = db.prepare('SELECT count(*) AS count FROM products').get().count;
db.close();

console.log(`SQLite listo: ${databasePath}`);
console.log(`${categories} categorías, ${products} productos`);
