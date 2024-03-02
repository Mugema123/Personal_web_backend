import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    transactionId: {
      type: String,
    },

    paidBy: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['User', 'googleUser'],
      required: true,
    },

    payerId: {
      type: String,
    },

    applicationId: {
      type: String,
    },

    amountPaid: {
      type: String,
    },

    applicationPaid: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },

    paymentMethod: {
      type: String,
    },

    paymentPlan: {
      type: String,
    },

    transactionStatus: {
      type: String,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt).format('MMMM, DD YYYY');
    ret.updatedAt = moment(ret.updatedAt).format('MMMM, DD YYYY');
  },
});

export default mongoose.model('payments', paymentSchema);
