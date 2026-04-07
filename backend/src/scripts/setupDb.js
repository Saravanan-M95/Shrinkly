import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function setup() {
  // First, connect to 'postgres' database to create 'shrinkly' DB if it doesn't exist
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('shrinkly', 'postgres'),
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='shrinkly'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE shrinkly');
      console.log('Database "shrinkly" created');
    } else {
      console.log('Database "shrinkly" already exists');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

setup();
