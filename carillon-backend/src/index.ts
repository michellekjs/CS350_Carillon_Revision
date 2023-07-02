import { Application } from './app/application';
import * as dotenv from 'dotenv';

dotenv.config();
const application: Application = new Application();
application.startServer();
