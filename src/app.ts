// import express, { Application, Request, Response } from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

// import cors from 'cors';
// import router from './app/routes';
// import globalErrorHandler from './app/middlewares/globalErrorhandler';
// import notFound from './app/middlewares/notFound';
// import cookieParser from "cookie-parser";
// import bodyParser from 'body-parser';

// const app: Application = express();
// // app.use(bodyParser.urlencoded({ extended: true }));
// //parsers
// app.use(express.json());
// app.use(bodyParser.json());
// const allowedOrigins = process.env.NEXT_PUBLIC_FRONTEND_URLS ? process.env.NEXT_PUBLIC_FRONTEND_URLS.split(',') : [];

// app.use(cors({
//   // origin: allowedOrigins,
//   // origin: ['http://localhost:3000','http://localhost:3001'],
//   // origin: ['*'],
//   origin: ['https://ota.tripnest.net','https://admin.tripnest.net'],
//   credentials: true,
// }));

// app.use(cookieParser());
// // application routes
// app.use('/api/v1', router);   

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hi TripNest!! you are live now!!!!');
// });

// app.use(globalErrorHandler);

// //Not Found
// app.use(notFound);

// export default app;


import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import { getAllCountryNameFromAllVisaService } from './app/modules/Visa.v2/visa.service';

const app: Application = express();
// app.use(bodyParser.urlencoded({ extended: true }));
//parsers
app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ota.tripnest.net',
  'https://admin.tripnest.net',
  'http://192.168.68.102:3000',
  'https://ota-admin-client.vercel.app',
  'https://ota-admin-client.vercel.app/',
  /^http:\/\/192\.168\.68\.\d+:3000$/ 
];

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      const allowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(cookieParser());
// application routes
app.use('/api/v1', router);   
// getAllCountryNameFromAllVisaService()
app.get('/', (req: Request, res: Response) => {
  res.send('Hi TripNest!! you are live now!!!!');
});
app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;