import { Server } from 'http';
import app from './app';
import config from './app/config';
import mongoose from 'mongoose';

let server: Server;
const port = config.port || 5000;

async function main() {
    try {
      await mongoose.connect(config.database_url as string);
      console.log("Mongodb database connected successfully")
      server = app.listen(port, () => {
      console.log(`The app is currently listening on port ${config.port}`);
        
      });
    } catch (err) {
      console.log(err);
    }
  }
  
  main();

  
process.on('unhandledRejection', (err) => {
  console.log(`unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`uncaughtException is detected , shutting down ...`);
  process.exit(1);
});

