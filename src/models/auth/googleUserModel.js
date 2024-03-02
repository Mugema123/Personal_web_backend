import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    email: {
      type: String,
      required: true,
    },

    picture: {
      url: String,
    },

    company: {
      type: String,
    },

    address: {
      type: String,
    },

    phoneNumber: {
      type: String,
    },

    country: {
      type: String,
    },

    city: {
      type: String,
    },

    bio: {
      type: String,
    },

    token: {
      type: String,
    },

    isVerified: {
      type: Boolean,
    },

    role: {
      type: String,
      default: 'user',
      enum: [
        'user',
        'admin',
        'finance_admin',
        'registrar_admin',
        'super_admin',
      ],
    },

    hasMessageDisplayed: {
      type: Boolean,
      default: false,
    },

    accountType: {
      type: String,
      default: 'Google',
    },
    author: {
      type: Object,
      default: {
        title: '',
        description: '',
        facebook: 'https://www.facebook.com/rupi',
        twitter: 'https://twitter.com/rupi',
        linkedin: 'https://www.linkedin.com/in/rupi',
      },
    },

    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('googleUser', userSchema);
