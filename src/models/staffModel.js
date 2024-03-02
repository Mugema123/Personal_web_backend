import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const staffSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      required: true,
    },
    category: { type: String, required: true },
    image: {
      type: String,
      required: true,
    },

    facebookProfile: {
      type: String,
    },

    linkedlinProfile: {
      type: String,
    },

    twitterProfile: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Staff', staffSchema);
