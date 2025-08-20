import Agenda from 'agenda';
import colors from 'colors/safe';
import * as dotenv from 'dotenv';
import { allDefinitions } from './definitions';
dotenv.config();

export const AgendaControl = new Agenda({
  db: {
    address: process.env.MONGO_URI!,
    collection: 'cron-jobs',
  },
});

AgendaControl.on('ready', () => console.log(colors.cyan('Agenda Initiated'))).on(
  'error',
  () => console.log(colors.red('Agenda initiation error'))
);

// define all agenda jobs
allDefinitions(AgendaControl);

// stop connection
async function endConnection() {
  await AgendaControl.stop();
  process.exit(0);
}
process.on('SIGTERM', endConnection);
process.on('SIGINT', endConnection);
