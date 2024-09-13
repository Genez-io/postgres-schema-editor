import express, { Express } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import Serverless from 'serverless-http';
import routes from './routes/index.js';

const app: Express = express();
//Set the payload limit size to 1mb when save a large database data which is TableData in featureTab.
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
//app.use(express.static(path.join(__dirname, '../dist')));
app.use(
  session({
    secret: 'process.env.SESSION_SECRET as string',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      path: '/',
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000
    },
  })
);
routes(app);

export const handler = Serverless(app);