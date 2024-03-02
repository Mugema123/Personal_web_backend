const PORT = process.env.PORT || 5000;

const Keys = {
  PORT,
  OLTRANZ_API: process.env.OLTRANZ_API,
  KPAY_API: process.env.KPAY_API,
  OLTRANZ_ACCESS_KEY: process.env.OLTRANZ_ACCESS_KEY,
  OLTRANZ_MERCHANT_ID: process.env.OLTRANZ_MERCHANT_ID,
  OLTRANZ_CALLBACK_URL: process.env.OLTRANZ_CALLBACK_URL,
  HOST: process.env.HOST || `http://localhost:${PORT}`,
};

export default Keys;
