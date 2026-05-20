const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { URL } = require('url');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const dbUrl = new URL(process.env.DATABASE_URL);

const sslOptions = dbUrl.hostname !== 'localhost' && dbUrl.hostname !== '127.0.0.1'
  ? { rejectUnauthorized: false }
  : undefined;

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password || ''),
  database: dbUrl.pathname.substring(1),
  connectionLimit: 10,
  ssl: sslOptions,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
