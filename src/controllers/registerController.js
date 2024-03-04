import User from '../models/auth/userModel.js';
import googleUser from '../models/auth/googleUserModel.js';
import Trash from '../models/trashModel.js';
import bcrypt from 'bcrypt';
import UserValidationSchema from '../validations/user/registerValidation.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import authorInfoValidationSchema from '../validations/authorValidation.js';
import mongoose from 'mongoose';
import { generateAccessToken } from '../helpers/security.helper.js';
import { HttpException } from '../exceptions/HttpException.js';
import isId from '../helpers/isId.js';
import { sendEmail } from '../helpers/nodemailer.js';
import emailUsersTemp from '../helpers/emailTemplates/emailToUsers.js';

const createNewUser = async (request, response) => {
  const { error } = UserValidationSchema.validate(request.body);

  if (error)
    return response
      .status(400)
      .json({ validationError: error.details[0].message });

  const duplicatedEmail = await User.findOne({
    email: request.body.email,
  });

  if (duplicatedEmail)
    return response.status(409).json({
      duplicateError: `A user with email "${request.body.email}" already exist`,
    });

  try {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(
      request.body.password,
      salt,
    );

    const hashedRepeatPassword = await bcrypt.hash(
      request.body.repeatPassword,
      salt,
    );

    const newUser = new User({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      name: `${request.body.firstName} ${request.body.lastName}`,
      email: request.body.email,
      password: hashedPassword,
      repeatPassword: hashedRepeatPassword,
      emailToken: crypto.randomBytes(64).toString('hex'),
      isVerified: false,
    });

    await newUser.save();

    const sender = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ndicunguyesteve4@gmail.com',
        pass: process.env.NODEMAILER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: '"MUGEMA" <ndicunguyesteve4@gmail.com>',
      to: newUser.email,
      subject: 'MUGEMA | Verify your email',
      html: `
            <div style="padding: 10px 0;">
                <h3> ${newUser.firstName} ${newUser.lastName} thank you for registering on our platform! </h3> 
                <h4> Click the button below to verify your email... </h4>
                <a style="border-radius: 5px; margin-bottom: 10px; text-decoration: none; color: white; padding: 10px; cursor: pointer; background: #008D41;" 
                href="http://${request.headers.host}/auth/verifyEmail?token=${newUser.emailToken}"> 
                Verify Email </a>
            </div>
            `,
    };

    sender.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);;
      } else {
        console.log('Verification email sent to your account');
      }
    });

    response.status(201).json({
      successMessage:
        'Account created successfully, Check your email to verify this account!',
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

const verifyEmail = async (request, response) => {
  try {
    const token = request.query.token;
    const emailUser = await User.findOne({
      emailToken: token,
    });

    if (emailUser) {
      emailUser.emailToken = null;
      emailUser.isVerified = true;

      await emailUser.save();

      response.redirect(process.env.EMAILVERIFIED_REDIRECT_URL);
    } else {
      response.send('This email is already verified!');
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllUsers = async (request, response) => {
  try {
    const [regularUsers, googleUsers] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      googleUser.find().populate('user').sort({ createdAt: -1 }),
    ]);

    const RegisterUsers = [...regularUsers, ...googleUsers];

    response.status(200).json({
      RegisteredUsers: RegisterUsers,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user =
      (await User.findOne({ _id: req.params.id })) ||
      (await googleUser.findOne({ _id: req.params.id }));
    if (user) {
      res.status(200).json({ fetchedUser: user });
    } else {
      res.status(400).json({
        userFetchedError: 'User not found',
      });
    }
  } catch (error) {
    // console.log(error);;
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const assignUserRole = async (request, response) => {
  try {
    const id = isId(request.params.id);
    const { role } = request.body;
    if (!role || role === 'super_admin') {
      throw new HttpException(
        400,
        !role
          ? 'Role required!'
          : 'super admin role can not be assigned to any one',
      );
    }
    const user =
      (await User.findById(id)) || (await googleUser.findById(id));
    if (!user || user.role === 'super_admin') {
      throw new HttpException(
        400,
        !user
          ? 'User not found!'
          : 'Super Admin user can not be edited.',
      );
    }

    user.role = role;

    const updated = await user.save();

    sendEmail({
      to: updated.email,
      subject: 'Your Role Has Updated!',
      html: emailUsersTemp({
        name: updated.name,
        body: `We would like to let you know that your role at MUGEMA was updated from ${user.role
          .split('_')
          .join(' ')} to ${updated.role.split('_').join(' ')}.`,
      }),
    });

    response.status(200).json({
      successMessage: `Role updated successfully!`,
      updatedUser: updated,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const addAauthorInfo = async (request, response) => {
  try {
    //Validation
    const { error } = authorInfoValidationSchema.validate(
      request.body?.author || {},
    );

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });
    if (request.user?._id !== request.params.id) {
      throw new Error('You can only change your own info');
    }
    let user;
    if (request.user.accountType === 'Google') {
      user = await googleUser.findByIdAndUpdate(
        request.params.id,
        {
          author: { ...request.body.author },
        },
        { new: true },
      );
    } else {
      user = await User.findByIdAndUpdate(
        request.params.id,
        {
          author: { ...request.body.author },
        },
        { new: true },
      );
    }
    if (!user) {
      throw new Error('Author not found!');
    }

    generateAccessToken(user, response);

    response.status(200).json({
      successMessage: `User info updated successfully!`,
      updatedUser: user,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (
      !req.query.userId ||
      !mongoose.Types.ObjectId.isValid(req.query.userId)
    ) {
      throw new Error(
        !req.query.userId
          ? 'User id required'
          : 'Invalid user id format',
      );
    }
    const user =
      (await User.findById(req.query.userId)) ||
      (await googleUser.findById(req.query.userId));
    if (!user) {
      throw new Error(
        "User you're trying to delete does no longer exist",
      );
    }
    await Trash.create({
      user_id: req.user._id,
      userModel:
        req.user.accountType === 'Google' ? 'googleUser' : 'User',
      elementType:
        user.accountType === 'Google' ? 'googleUser' : 'User',
      element: user,
    });
    res.status(200).json({
      successMessage: 'User deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const certificateMessageDisplayed = async (request, response) => {
  try {
    const user =
      (await User.findOne({ _id: request.user._id })) ||
      (await googleUser.findOne({ _id: request.user._id }));

    user.hasMessageDisplayed = request.body.hasMessageDisplayed;

    await user.save();

    response.status(200).json({
      updatedUser: user,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  createNewUser,
  getAllUsers,
  verifyEmail,
  assignUserRole,
  addAauthorInfo,
  getUserById,
  deleteUser,
  certificateMessageDisplayed,
};
