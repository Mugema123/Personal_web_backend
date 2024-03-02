import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ApplicationSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['individual', 'company'],
    },
    paid: {
      type: Boolean,
      default: false,
    },
    lastPaidMembership: { type: Date },
    hasCertificate: {
      type: Boolean,
      default: false,
    },
    membership: {
      type: String,
      required: true,
      enum: [
        'none',
        'Junior',
        'Professional',
        'Consulting',
        'Company',
      ],
    },
    user: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['User', 'googleUser'],
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    rejectReason: { type: String },
    information: {},
    status: {
      type: String,
      enum: [
        'PENDING',
        'REJECTED',
        'ACCEPTED',
        'APPROVED',
        'DISAPPROVED',
      ],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  },
);

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;
