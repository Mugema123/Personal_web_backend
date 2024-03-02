import { v4 as uuidv4 } from 'uuid';
import Application from '../models/Application.js';
import paymentModel from '../models/paymentModel.js';
import Http from '../utils/http.js';

const storeItems = new Map([
  [1, { price: 10000, paymentPlan: 'Application Fee' }],
  [2, { price: 30000, paymentPlan: 'Application Fee' }],
  [3, { price: 50000, paymentPlan: 'Junior' }],
  [4, { price: 100000, paymentPlan: 'Professional' }],
  [5, { price: 150000, paymentPlan: 'Consulting' }],
  [6, { price: 300000, paymentPlan: 'Company' }],
]);

export default class OltranzController {
  static async requestPay(req, res) {
    try {
      const application = await Application.findOne({
        user: req.user._id,
      });

      const storeItem = storeItems.get(req.body.itemId);

      const transactionId = uuidv4().replace(/-/gi, '');

      const payload = {
        telephoneNumber: req.body.telephoneNumber,
        amount: storeItem.price,
        paymentMethod: req.body.paymentMethod,
        transactionId: transactionId.substring(0, 8),
        description: `Customer Name: ${req.body.payerName} , Transaction ID: ${transactionId.substring(0, 8)}`,
      };

      const { data, status } = await Http.onRequestPayment(payload);

      if(data.status === "FAILED") {
        return res.status(status).json({
          failedTransaction: data.description === 'THE PAYER DOES NOT HAVE SUFFICIENT FUNDS ON HIS/HER ACCOUNT' ?
          "Failed! You don't have enough funds to perform this transaction!" : data.description
        });
      }

      else{
        const newPayment = new paymentModel({
          transactionId: transactionId.substring(0, 8),
          paidBy: req.user._id,
          applicationPaid: application._id,
          payerId: req.user._id,
          userModel:
            req.user.accountType === 'Google'
              ? 'googleUser'
              : 'User',
          applicationId: application._id,
          paymentMethod: req.body.paymentMethod,
          amountPaid: storeItem.price,
          paymentPlan: storeItem.paymentPlan,
        });
  
        const payment = await newPayment.save();
        const populatedPayment = await payment.populate('paidBy');

        return res.status(status).json({
          status: status,
          data,
          paymentInformation: populatedPayment,
        });  
      }

    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, reload the page and try again',
      });
    }
  }

  static async handleOltranzPaymentCallback(request, response) {
    try {
    const data = request.body 
    if (data && Object.keys(data).length === 0) {
      return;
    }
  
    else{
      const paymentObject = data
      const status = paymentObject.status;
      const paymentId = paymentObject.transactionId;
      const payment = await paymentModel.findOne({ transactionId: paymentId });

    if(status === "SUCCESS"){
      payment.transactionStatus = "Success"
      await payment.save();

      let where = {};
      if (payment.paymentPlan === 'Application Fee') {
        where = { paid: payment.transactionStatus === 'Success' };
      } else {
        where = {
          lastPaidMembership:
            payment.transactionStatus === 'Success' ? new Date() : null,
        };
      }
      
      await Application.findByIdAndUpdate(
        payment.applicationId,
        where,
        { new: true },
      );
    }
    else{
      payment.transactionStatus = "Failed"
      await payment.save();
    }
    }
  
    } catch (error) {
      console.log(error);
    }
  }

}
