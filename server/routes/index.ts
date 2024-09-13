import express, { Express, Request, Response, NextFunction } from 'express';
import { postgresRouter } from './postgres.router.js';
import log from '../logger/index.js';
import type { DefaultErr } from '../Types.js';

const routes = (app: Express) => {
  app.get('/api/healthcheck', (_req: Request, res: Response) => res.sendStatus(200));

  app.use('/api/sql/postgres', postgresRouter);

  app.get('/api/dbList', (_req: Request, res: Response) => {
    let ret:any = [];
    for (const key in process.env) {
      if (key.includes('DATABASE_URL')) {
        ret.push({label: key, value: process.env[key]});
      }
    } 
    res.send(ret);
  });

  app.get('/*', (_req, res) => {
    res.status(404).send('Not found');
  });

  // Global Error Handler
  app.use((err: ErrorEvent, _req: Request, res: Response, _next: NextFunction) => {
    const defaultErr: DefaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: 'An error occurred. This is the global error handler.',
    };

    const errorObj = Object.assign({}, defaultErr, err);
    log.error(errorObj.message);
    log.error(errorObj.log);
    console.log(err);
    return res.status(errorObj.status).json(errorObj.message);
  });
};

export default routes;
