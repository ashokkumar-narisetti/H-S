import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Enforce direct Supabase connection URL to bypass PgBouncer parameter length limits
const DIRECT_DATABASE_URL = "postgresql://postgres:EvoRES%40Technology@db.edszptikpdazholbpscs.supabase.co:5432/postgres";
process.env.DATABASE_URL = DIRECT_DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DIRECT_DATABASE_URL
    }
  }
});
