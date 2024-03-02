import paymentModel from '../models/paymentModel.js';
import Application from '../models/Application.js';
import mongoose from 'mongoose';
import { HttpException } from '../exceptions/HttpException.js';
import { notifyValidationSchema } from '../validations/mailUserValidation.js';
import { sendEmail } from '../helpers/nodemailer.js';
import emailUsersTemp from '../helpers/emailTemplates/emailToUsers.js';
import moment from 'moment';
import Http from '../utils/http.js';
import { v4 as uuidv4 } from 'uuid';
import isId from '../helpers/isId.js';

const storeItems = new Map([
  [1, { price: 10000, paymentPlan: 'Application Fee' }],
  [2, { price: 30000, paymentPlan: 'Application Fee' }],
  [3, { price: 50000, paymentPlan: 'Junior' }],
  [4, { price: 100000, paymentPlan: 'Professional' }],
  [5, { price: 150000, paymentPlan: 'Consulting' }],
  [6, { price: 300000, paymentPlan: 'Company' }],
]);

const confirmPayment = async (request, response) => {
  try {
    const storeItem = storeItems.get(request.body.itemId);
    const transactionId = uuidv4().replace(/-/gi, '');

    const application = await Application.findOne({
      user: request.user._id,
    });

    const customerName =
      application.category == 'individual'
        ? application.information.firstName +
          ' ' +
          application.information.lastName
        : application.information.name;
    const phoneNumber =
      application.category == 'individual'
        ? application.information.phoneNumber
        : application.information.ceo.phoneNumber;
    const customerEmail = application.information.email;
    const referralId = transactionId.substring(0, 8);
    const paymentDetails =
      storeItem.paymentPlan == 'Application Fee'
        ? storeItem.paymentPlan
        : 'Licencing Fee';

    const payload = {
      msisdn: phoneNumber,
      refid: referralId,
      amount: storeItem.price,
      details: paymentDetails,
      email: customerEmail,
      cname: customerName,
      returl: process.env.KPAY_RETURN_URL,
      redirecturl: process.env.KPAY_REDIRECT_URL,
    };

    const { status, statusText, data } =
      await Http.oncardPaymentRequest(payload);

    const newPayment = new paymentModel({
      transactionId: referralId,
      paidBy: request.user._id,
      userModel:
        request.user.accountType === 'Google' ? 'googleUser' : 'User',
      applicationPaid: application._id,
      payerId: request.user._id,
      applicationId: application._id,
      paymentMethod: 'Card',
      amountPaid: storeItem.price,
      paymentPlan: storeItem.paymentPlan,
    });

    const payment = await newPayment.save();
    const populatedPayment = await payment.populate('paidBy');

    response.status(200).json({
      successMessage: 'Payment Confirmed!',
      status: status,
      statusText: statusText,
      data: data,
      paymentInformation: populatedPayment,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const handlePaymentCallback = async (request, response) => {
  try {
    const data = request.body;

    if (!data || Object.keys(data).length === 0) {
      return;
    } else {
      const paymentData = JSON.parse(JSON.stringify(data));
      const paymentObject = JSON.parse(Object.keys(paymentData)[0]);
      const status = paymentObject.statusdesc;
      const paymentId = paymentObject.refid;
      const payment = await paymentModel.findOne({
        transactionId: paymentId,
      });

      if (status === 'APPROVED') {
        payment.transactionStatus = 'Success';
        await payment.save();

        let where = {};
        if (payment.paymentPlan === 'Application Fee') {
          where = { paid: payment.transactionStatus === 'Success' };
        } else {
          where = {
            lastPaidMembership:
              payment.transactionStatus === 'Success'
                ? new Date()
                : null,
          };
        }

        await Application.findByIdAndUpdate(
          payment.applicationId,
          where,
          { new: true },
        );
      } else {
        payment.transactionStatus = 'Failed';
        await payment.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const deletePayment = async (request, response) => {
  try {
    await paymentModel.deleteOne({ _id: request.query.paymentId });
    response.status(200).json({
      successMessage: 'Payment deleted successfully!',
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getUserPayments = async (request, response) => {
  try {
    let query = [
      {
        $lookup: {
          from: 'users',
          localField: 'paidBy',
          foreignField: '_id',
          as: 'normalPayerInfo',
        },
      },
      {
        $lookup: {
          from: 'googleusers',
          localField: 'paidBy',
          foreignField: '_id',
          as: 'googlePayerInfo',
        },
      },
      {
        $addFields: {
          payerInfo: {
            $concatArrays: ['$normalPayerInfo', '$googlePayerInfo'],
          },
        },
      },
      { $unwind: '$payerInfo' },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationPaid',
          foreignField: '_id',
          as: 'applicationInfo',
        },
      },
      { $unwind: '$applicationInfo' },
      {
        $match: {
          payerId: request.user._id,
        },
      },
    ];

    // Only show needed fields
    query.push({
      $project: {
        _id: 1,
        createdAt: 1,
        transactionId: 1,
        amountPaid: 1,
        paymentMethod: 1,
        paymentPlan: 1,
        transactionStatus: 1,
        payerId: 1,
        applicationId: 1,
        'payerInfo._id': 1,
        'payerInfo.firstName': 1,
        'payerInfo.lastName': 1,
        'payerInfo.email': 1,
        'applicationInfo._id': 1,
        'applicationInfo.information.name': 1,
        'applicationInfo.information.plan': 1,
        'applicationInfo.information.email': 1,
        'applicationInfo.category': 1,
        'applicationInfo.paid': 1,
        'applicationInfo.status': 1,
      },
    });

    const userPayments = await paymentModel.aggregate(query);

    if (userPayments) {
      response.status(200).json({
        successMessage: 'Successfully retrieved all user payments!',
        allAvailablePayments: userPayments.map(doc =>
          paymentModel.hydrate(doc),
        ),
      });
    } else {
      response.status(400).json({
        paymentsFetchError:
          "There was an error fetching this user's payments!",
      });
    }
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getApplicationPayments = async (request, response) => {
  try {
    const { applicationId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw new HttpException(400, 'Invalid application ID!');
    }
    const application = await Application.findById(
      applicationId,
    ).select(
      'category information.lastName information.firstName information.email information.name lastPaidMembership transactionStatus',
    );
    if (!application) {
      throw new HttpException(404, 'Application does not exist!');
    }
    const applicationPayments = await paymentModel
      .find({
        applicationId,
      })
      .select(
        'transactionId amountPaid paymentMethod paymentPlan transactionStatus',
      );

    response.status(200).json({
      successMessage: 'Successfully retrieved all user payments!',
      application,
      allAvailablePayments: applicationPayments,
    });
  } catch (error) {
    response.status(error.status || 500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { status, date } = req.query;
    function objectIdWithTimestamp(timestamp) {
      /* Convert string date to Date object (otherwise assume timestamp is a date) */
      if (typeof timestamp == 'string') {
        timestamp = new Date(timestamp);
      }

      /* Convert date object to hex seconds since Unix epoch */
      var hexSeconds = Math.floor(timestamp / 1000).toString(16);

      /* Create an ObjectId with that hex timestamp */
      var constructedObjectId = mongoose.Types.ObjectId(
        hexSeconds + '0000000000000000',
      );

      return constructedObjectId;
    }
    const where = {};
    if (date) {
      // console.log(date)
      const { year, month, isYearly } = JSON.parse(date);
      // console.log(month);
      if (isYearly) {
        where._id = {
          $gt: objectIdWithTimestamp(`${year}/01/01`),
          $lt: objectIdWithTimestamp(`${Number(year) + 1}/01/01`),
        };
      } else {
        let lt;
        if (Number(month) == 12) {
          lt = objectIdWithTimestamp(`${Number(year) + 1}/01/01`);
        } else {
          const str = `${year}/${Number(month) + 1}/01`;
          lt = objectIdWithTimestamp(str);
        }
        // console.log(lt)
        where._id = {
          $gt: objectIdWithTimestamp(`${year}/${month}/01`),
          $lt: lt,
        };
      }
    }

    // if (plan === 'application') {
    //   where.paymentPlan = 'Application Fee';
    // } else {
    //   where.paymentPlan = { $ne: 'Application Fee' };
    // }
    if (status) {
      // console.log(status);
      where.transactionStatus = status;
    }

    const payments = await paymentModel
      .find(where)
      .populate({
        path: 'paidBy',
        select: 'name',
      })
      // .select(
      //   'transactionId amountPaid paymentMethod paymentPlan transactionStatus createdAt paidBy',
      // )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Payments retrieved successfully!',
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    // console.log(error);;
    res.status(error.status || 500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const decideOnPayments = async (request, response) => {
  try {
    const payment = await paymentModel.findByIdAndUpdate(
      request.params.paymentId,
      { transactionStatus: request.body.transactionStatus },
      { new: true },
    );
    if (!payment) {
      throw new Error('Payment not found!');
    }

    let where = {};
    if (payment.paymentPlan === 'Application Fee') {
      where = { paid: payment.transactionStatus === 'Success' };
    } else {
      where = {
        lastPaidMembership:
          payment.transactionStatus === 'Success' ? new Date() : null,
      };
    }
    const updatedApplication = await Application.findByIdAndUpdate(
      payment.applicationId,
      where,
      { new: true },
    );
    if (!updatedApplication) {
      throw new Error('Unable to find and update application!');
    }
    response.status(200).json({ updatedPayment: payment });
  } catch (error) {
    // console.log(error.message);
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const hasACertificate = async (request, response) => {
  try {
    const id = isId(request.query.id);

    const application = await Application.findByIdAndUpdate(id, {
      hasCertificate: request.body.hasCertificate,
    });

    if (!application) {
      throw new HttpException(404, 'Application not found!');
    }

    response.status(200).json({
      updatedApplication: application,
      SuccessMessage: 'Access Updated',
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const notifyUser = async (req, res) => {
  try {
    const { error } = notifyValidationSchema.validate(req.body);
    if (error) {
      throw new HttpException(400, error.details[0].message);
    }
    const { email, name, lastPaidMembership } = req.body;
    const expiredAt = moment(lastPaidMembership)
      .add(1, 'minutes')
      .fromNow();

    sendEmail({
      to: email,
      subject: 'Membership Expired',
      html: emailUsersTemp({
        name,
        body: `We would like to notify you that your RUPI membership has expired ${expiredAt}. Pay for another one to enjoy our benefits.`,
      }),
    });

    res.status(200).json({
      status: true,
      message: `Member "${name}" notified successfully on email  about their membership expiration.`,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default {
  handlePaymentCallback,
  confirmPayment,
  getUserPayments,
  getApplicationPayments,
  decideOnPayments,
  hasACertificate,
  notifyUser,
  getAllPayments,
  deletePayment,
};
