import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ClientRequest } from 'http';

const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.disable('x-powered-by');


const services = [
  {
    route: '/api1',
    target: 'https://official-joke-api.appspot.com/random_joke',
  },
  {
    route: '/api2',
    target: 'https://api.chucknorris.io/jokes/random',
  },
  {
    route: '/weather',
    target: 'https://api.openweathermap.org/data/2.5/weather',
    on: {
      proxyReq: (proxyReq: ClientRequest) => {
        proxyReq.path += `&appid=${process.env.OPENWEATHER_API_KEY}`;
      },
    },
  },
];

services.forEach(({ route, target, on }) => {
  const proxyOptions = {
    on,
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '',
    },
    secure: process.env.NODE_ENV === 'production',
  };

  console.log(`Setting up proxy for ${route} -> ${target}`);
  app.use(route, createProxyMiddleware(proxyOptions));
});

export default app;
