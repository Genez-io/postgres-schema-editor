import express, { Express } from 'express';
import cors from 'cors';
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
routes(app);

export const handler = Serverless(app);