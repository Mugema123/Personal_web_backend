import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Schema = mongoose.Schema;

const certificateSchema = new Schema(
  {
    certificateOwner: {
      type: String,
      required: true,
    },

    ownerCategory: {
      type: String,
      required: true,
    },
    application: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },

    ownerRegNumber: {
      type: String,
      required: true,
      unique: true,
    },

    issuedDate: {
      type: String,
      required: true,
    },

    expirationDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Certificate', certificateSchema);
