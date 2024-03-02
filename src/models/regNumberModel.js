import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const regNumberSchema = new Schema(
  {
    regNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('regNumber', regNumberSchema);
