import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PublicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['User', 'googleUser'],
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Publication = mongoose.model('Publication', PublicationSchema);

export default Publication;
