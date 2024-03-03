import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import expressSession from 'express-session';
import MemoryStore from 'memorystore';
import cookieParser from 'cookie-parser';
import routes from './routes/zroutes.js';

dotenv.config();

//middelwares
const ourMemoryStore = MemoryStore(expressSession);
const app = express();
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: '100mb', extended: true }));
app.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000,
  }),
);
app.use(cookieParser('random'));
app.use(
  expressSession({
    secret: 'random',
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
    store: new ourMemoryStore(),
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

export default app;

const port = process.env.PORT || 5000;

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true });

app.listen(port, () => {
  console.log(
    `Server is running on port ${port} (http://localhost:${port}/) 🔥`,
  );
  mongoose.connection.once('open', () => {
    console.log('Database connected successfully 🌏');
  });
});
