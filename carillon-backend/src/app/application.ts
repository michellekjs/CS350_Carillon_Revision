/* eslint-disable @typescript-eslint/no-unused-vars */
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { applicationRouter } from './routes';
import logger from './util/logger';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startServer } from './socket';

export class Application {
  private _server: Express;
  private _httpServer;

  constructor() {
    this._server = express();
    this._server.set('host', process.env.HOST || 'localhost');
    this._server.set('port', process.env.PORT || 3000);
    this._server.use(bodyParser.json());
    this._server.use(bodyParser.urlencoded({ extended: true }));
    this._server.use(cors());
    this._server.use(this.logRequest);
    this._server.use(applicationRouter);
    this._server.use(this.errorHandler);
    this.connectDatabase();

    this._httpServer = createServer(this._server);
    this.connectWebSocket();
  }

  private logRequest(req: Request, res: Response, next: NextFunction) {
    logger.info(`Request URL: ${req.originalUrl} Method: ${req.method}`);
    next();
  }

  private connectDatabase() {
    const db = mongoose.connection;
    db.on('error', logger.error);
    db.once('open', function () {
      logger.info('Connected to mongod server');
    });

    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.DB_HOST as string);
  }

  private connectWebSocket() {
    const io = new Server(this._httpServer, {
      cors: {
        origin: '*',
      },
    });
    startServer(io);
    logger.info('Listening to socket connection');
  }

  private errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    logger.error(err.message);
    res.status(500);
    res.send(err.message);
  }

  public startServer(): void {
    const host: string = this._server.get('host');
    const port: number = this._server.get('port');
    this._httpServer.listen(port, () => {
      logger.info(`Server started at http://${host}:${port}`);
    });
  }
}
