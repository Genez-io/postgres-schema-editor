import express, { Express, Request, Response, NextFunction } from 'express';
import { postgresRouter } from './postgres.router.js';
import log from '../logger/index.js';
import type { DefaultErr } from '../Types.js';

declare module 'express-session' {
  interface SessionData {
    type?: string; // NOTE ON TYPE: When trying to assign a type to 'type' on a data source in the controllers
    host?: string; // it can only be one string of the possible databases available to typeORM. This makes
    hostname?: string; // trying to dynamically type it based on data from a front end request difficult.
    port?: string | number; // Because of that you will see that 'type' is typed as  'db_type as "string of db type"'.
    username?: string;
    password?: string;
    database?: string;
    database_name?: string;
    service_name?: string;
    synchronize?: boolean;
    logging?: boolean;
    db_type?: string;
    file_path?: string;
  }
}

const routes = (app: Express) => {
  app.get('/api/healthcheck', (_req: Request, res: Response) => res.sendStatus(200));

  app.use('/api/sql/postgres', cookieSession, postgresRouter);

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

export const cookieSession = (req: Request, _res: Response, next: NextFunction) => {
  const { db_type, hostname, password, port, username, database_name, service_name } =
    req.query;
  try {
    if (typeof db_type === 'string') {
      req.session.db_type = db_type;
    }
    if (typeof hostname === 'string') {
      req.session.hostname = hostname;
    }
    if (typeof password === 'string') {
      req.session.password = password;
    }
    if (typeof port === 'string') {
      req.session.port = port;
    }
    if (typeof username === 'string') {
      req.session.username = username;
    }
    if (typeof database_name === 'string') {
      req.session.database_name = database_name;
    }
    if (typeof service_name === 'string') {
      req.session.service_name = service_name;
    }
    console.log('Cookie has been set and is saving session data');
  } catch (err: unknown) {
    console.log('error was found in cookeSession: ', err);
    return next(err);
  }
  return next();
};

export default routes;
