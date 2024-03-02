import axios from 'axios';
import Keys from './keys.js';


export default class Http {
  static oltranzAxios = axios.create({ baseURL: Keys.OLTRANZ_API });
  static kpayAxios = axios.create({ baseURL: Keys.KPAY_API });

  static onRequestPayment = async payload => {
    const data = {
      ...payload,
      organizationId: Keys.OLTRANZ_MERCHANT_ID,
      callbackUrl: Keys.OLTRANZ_CALLBACK_URL,
    };
    return Http.oltranzAxios.post('/opay/paymentrequest', data);
  };

  static oncardPaymentRequest = async payload => {
    const data = {
      ...payload,
      currency: "RWF",
      bankid: "000",
      pmethod: "cc",
      cnumber: "Payment",
      retailerid: process.env.KPAY_RETAILER_ID
    };
    return Http.kpayAxios.post('/', data, {
      auth: {
        username: process.env.KPAY_USERNAME,
        password: process.env.KPAY_PASSWORD
      }
    });
  };

  static onTransfer = async payload => {
    const data = {
      ...payload,
      merchantId: Keys.OLTRANZ_MERCHANT_ID,
      callbackUrl: `${Keys.HOST}/api/opay/fundstransfer/callback`,
    };
    return Http.oltranzAxios.post(
      '/opay/wallet/fundstransfer',
      data,
      {
        headers: {
          accessKey: Keys.OLTRANZ_ACCESS_KEY,
        },
      },
    );
  };
}
