import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function setup() {
  // First, connect to 'postgres' database to create 'shrinqe' DB (ShrinQE) if it doesn't exist
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('shrinqe', 'postgres'),
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='shrinqe'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE shrinqe');
      console.log('Database "shrinqe" (ShrinQE) created');
    } else {
      console.log('Database "shrinqe" (ShrinQE) already exists');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

setup();
