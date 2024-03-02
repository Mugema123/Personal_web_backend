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

    password: {
      type: String,
      required: true,
    },

    repeatPassword: {
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

    emailToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
    },

    resetToken: {
      type: String,
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

    accountType: {
      type: String,
      default: 'Email',
    },
    hasMessageDisplayed: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);
