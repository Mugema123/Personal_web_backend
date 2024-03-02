import mongoose from 'mongoose';
import moment from 'moment';
import googleUserModel from './auth/googleUserModel.js';
import userModel from './auth/userModel.js';
import Application from './Application.js';

const Schema = mongoose.Schema;

const trashSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['User', 'googleUser'],
      required: true,
    },
    elementType: {
      type: String,
      required: true,
    },
    element: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

trashSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt).format(
      'MMMM Do YYYY, h:mm:ss a',
    );
    ret.updatedAt = moment(ret.updatedAt).format(
      'MMMM Do YYYY, h:mm:ss a',
    );
  },
});

const Trash = mongoose.model('Trash', trashSchema);
const changeStream = Trash.watch();

changeStream.on('change', async change => {
  if (change.operationType === 'insert') {
    const { _id: elementId, email } = change.fullDocument.element;
    switch (change.fullDocument.elementType) {
      case 'User':
        try {
          await userModel.findByIdAndDelete(elementId);
        } catch (error) {
          console.log('DELETE USER FAILED!', email);
        }
        break;
      case 'googleUser':
        try {
          await googleUserModel.findByIdAndDelete(elementId);
        } catch (error) {
          console.log('DELETE GOOGLE USER FAILED!', email);
        }
        break;
      case 'Application':
        try {
          await Application.findByIdAndDelete(elementId);
        } catch (error) {
          console.log('DELETE APPLICATION FAILED!', elementId);
        }
        break;

      default:
        break;
    }
  }
});

export default Trash;
