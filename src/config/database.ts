import knex from 'knex';
import path from 'path';
import { logger } from '../utils/logger';

export const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(process.cwd(), 'patient_management.sqlite')
  },
  useNullAsDefault: true,
  log: {
    warn(message) {
      logger.warn(message);
    },
    error(message) {
      logger.error(message);
    },
    deprecate(message) {
      logger.warn(message);
    },
    debug(message) {
      logger.debug(message);
    },
  }
});

export async function initializeDatabase(): Promise<void> {
  await createPatientsTable();
  await addLifespanColumnsToPatients();
}

async function createPatientsTable(): Promise<void> {
  const patientsTableExists = await db.schema.hasTable('patients');
  
  if (!patientsTableExists) {
    logger.info('Creating patients table');
    await db.schema.createTable('patients', (table) => {
      table.string('id').primary();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('sex').defaultTo('Not Given');
      table.timestamps(true, true);
    });
  }
}

async function addLifespanColumnsToPatients(): Promise<void> {
  const hasKnownAgeColumn = await db.schema.hasColumn('patients', 'knownAge');
  const hasDateOfBirthColumn = await db.schema.hasColumn('patients', 'dateOfBirth');
  
  if (!hasKnownAgeColumn || !hasDateOfBirthColumn) {
    logger.info('Adding lifespan columns to patients table');
    
    await db.schema.alterTable('patients', (table) => {
      if (!hasKnownAgeColumn) {
        table.integer('knownAge').nullable();
      }
      
      if (!hasDateOfBirthColumn) {
        table.string('dateOfBirth').nullable();
      }
    });
  }
}
