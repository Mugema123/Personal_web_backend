import User from '../models/auth/userModel.js';
import googleUser from '../models/auth/googleUserModel.js';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import forgotPasswordValidationSchema from '../validations/user/forgotPasswordValidation.js';
import resetPasswordValidationSchema from '../validations/user/resetPasswordValidation.js';
import cloudinary from '../helpers/cloudinary.js';
import googleUserModel from '../models/auth/googleUserModel.js';
import {
  generateAccessToken,
  verifyAccessToken,
} from '../helpers/security.helper.js';
import mailUsersValidationSchema from '../validations/mailUserValidation.js';
import emailUsersTemp from '../helpers/emailTemplates/emailToUsers.js';
import { HttpException } from '../exceptions/HttpException.js';
import moment from 'moment';
import { sendEmail } from '../helpers/nodemailer.js';
import userModel from '../models/auth/userModel.js';

const loginUser = async (request, response) => {
  try {
    // console.log(request.body);
    const getUser = await User.findOne({ email: request.body.email });

    if (!getUser)
      return response.status(400).json({
        invalidEmail: 'Invalid email or password, Please try again!',
      });

    if (!getUser.isVerified)
      return response.status(400).json({
        invalidEmail:
          'Please check your email to verify this account!',
      });

    const userPassword = await bcrypt.compare(
      request.body.password,
      getUser.password,
    );

    if (!userPassword)
      return response.status(400).json({
        invalidPassword:
          'Invalid email or password, Please try again!',
      });

    const token = generateAccessToken(getUser, response);

    response.status(200).json({
      successMessage: 'Logged In Successfully!',
      result: getUser,
      Access_Token: token,
    });
  } catch (error) {
    // console.log(error.message);
    response.status(500).json({
      status: 'Fail',
      message: error.message,
      errorMessage: error.message,
    });
  }
};

const loginAdmin = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email) {
      throw new HttpException('Email required to log in.');
    }
    let user;
    if (request.query.withGoogle === 'true') {
      user = await googleUserModel.findOne({ email });
      if (!user) {
        throw new HttpException(404, 'User not found!');
      }
      if (
        ![
          'admin',
          'finance_admin',
          'registrar_admin',
          'super_admin',
        ].includes(user.role)
      ) {
        throw new HttpException(
          400,
          'You must be an admin to perform this action!',
        );
      }
    } else {
      if (!password) {
        throw new HttpException('Password required to log in.');
      }
      user = await userModel.findOne({ email });
      if (!user) {
        throw new HttpException(404, 'User not found!');
      }
      if (
        ![
          'admin',
          'finance_admin',
          'registrar_admin',
          'super_admin',
        ].includes(user.role)
      ) {
        throw new HttpException(
          400,
          'You must be an admin to perform this action!',
        );
      }
      const isValidPwd = await bcrypt.compare(
        password,
        user.password,
      );

      if (!isValidPwd) {
        throw new HttpException(
          400,
          'Invalid password, please try again later.',
        );
      }
    }
    if (!user) {
      throw new HttpException(404, 'User not found!');
    }
    const token = generateAccessToken(user, response);
    response.status(200).json({
      successMessage: 'Logged In Successfully!',
      result: user,
      Access_Token: token,
    });
  } catch (error) {
    // console.log(error.message);
    response.status(error.status || 500).json({
      status: 'Fail',
      message: error.message,
    });
  }
};

const loggedInUser = async (request, response) => {
  try {
    const { user } = request;
    if (!user) {
      return response.status(401).json({
        errorMessage: 'User not logged In',
      });
    }
    const thisUser =
      user.accountType === 'Google'
        ? new googleUserModel(user)
        : new User(user);
    return thisUser.validate(err => {
      if (err) {
        return response.status(400).json({
          status: 'fail',
          errorMessage:
            'Something went wrong! Please try login again.',
        });
      }
      return response.status(200).json({
        successMessage: 'LoggedIn User Fetched Successfully!',
        loggedInUser: user,
        token: user.role === 'admin' ? request.token : undefined,
      });
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

const logoutUser = async (request, response) => {
  try {
    response.clearCookie('accessTokenCookie', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    response.status(200).json({
      successMessage: 'Logged Out Successfully!',
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({
      status: 'Fail',
      errorMessage: error.message,
    });
  }
};

// forgot password

const forgotPassword = async (request, response) => {
  try {
    const { error } = forgotPasswordValidationSchema.validate(
      request.body,
    );

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const getUser = await User.findOne({ email: request.body.email });

    if (!getUser)
      return response.status(400).json({
        invalidEmail: `${request.body.email} is not registered`,
      });

    if (!getUser.isVerified)
      return response.status(400).json({
        unverifiedEmail: 'This email is not verified!',
      });

    const resetPasswordToken = Jwt.sign(
      { getUser },
      process.env.FORGOTPASSWORD_RESET_SECRET,
    );

    await getUser.updateOne({
      resetToken: resetPasswordToken,
    });

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
      to: getUser.email,
      subject: 'MUGEMA | Reset your password',
      html: `
            <div style="padding: 10px 0;">
                <h3> Hello ${getUser.firstName}, we received a request from someone ( hopefully you ) to reset your password! </h3> 
                <h4> Click the button below to reset your password... </h4>
                <a style="border-radius: 5px; margin-bottom: 10px; text-decoration: none; color: white; padding: 10px; cursor: pointer; background: #008D41;" 
                href="http://${request.headers.host}/auth/resetPassword?resetToken=${resetPasswordToken}"> 
                Reset password </a>
            </div>
            `,
    };

    sender.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);;
      } else {
        console.log(
          'Please check your account to reset your password',
        );
      }
    });

    response.status(200).json({
      resetSuccess: 'Please check your email to reset your password',
      resetPasswordToken: resetPasswordToken,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

// Resetting the password

const resetPassword = async (request, response) => {
  try {
    const token = request.query.resetToken;

    const getToken = await User.findOne({ resetToken: token });

    if (getToken) {
      getToken.resetToken = null;
      await getToken.save();

      response.redirect(process.env.RESETPASSWORD_REDIRECT_URL);
    } else {
      response.send(
        "You can't use this reset password link twice! If you wish to reset your password again, consider repeating the request!",
      );
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

// Creating a new password

const newPassword = async (request, response) => {
  try {
    const { error } = resetPasswordValidationSchema.validate(
      request.body,
    );

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const token = request.headers["forgotpasswordtoken"];
      console.log(request.headers);
    if (!token)
      return response.status(401).json({
        tokenError:
          'Something is wrong! Please consider repeating the request to be able to reset your password!',
      });

    Jwt.verify(
      String(token),
      process.env.FORGOTPASSWORD_RESET_SECRET,
      async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
        } else {
          const userNewPassword = await User.findById(
            decodedToken.getUser._id,
          );

          const newSalt = await bcrypt.genSalt();
          const newHashedPassword = await bcrypt.hash(
            request.body.password,
            newSalt,
          );
          const newHashedRepeatPassword = await bcrypt.hash(
            request.body.repeatPassword,
            newSalt,
          );

          await userNewPassword.updateOne({
            password: newHashedPassword,
            repeatPassword: newHashedRepeatPassword,
          });

          response.status(200).json({
            newPasswordSuccess: 'Password is reseted successfully!',
          });
        }
      },
    );

    response.clearCookie('forgotPasswordTokenCookie', { path: '/' });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

// update user profile

const updateUser = async (request, response) => {
  try {
    const { user: userData } = request;
    if (!userData) {
      throw new Error('User not logged in');
    }
    let ourLoggedInUser;
    if (userData.accountType === 'Google') {
      ourLoggedInUser = await googleUser.findById(request.user._id);
    } else {
      ourLoggedInUser = await User.findById(request.user._id);
    }

    if (ourLoggedInUser) {
      if (request.body.picture) {
        const result = await cloudinary.uploader.upload(
          request.body.picture,
          {
            folder: 'MUGEMA Project Images',
          },
        );

        (ourLoggedInUser.firstName =
          request.body.firstName || ourLoggedInUser.firstName),
          (ourLoggedInUser.lastName =
            request.body.lastName || ourLoggedInUser.lastName),
          (ourLoggedInUser.bio =
            request.body.bio || ourLoggedInUser.bio),
          (ourLoggedInUser.company =
            request.body.company || ourLoggedInUser.company),
          (ourLoggedInUser.address =
            request.body.address || ourLoggedInUser.address),
          (ourLoggedInUser.phoneNumber =
            request.body.phoneNumber || ourLoggedInUser.phoneNumber),
          (ourLoggedInUser.country =
            request.body.country || ourLoggedInUser.country),
          (ourLoggedInUser.city =
            request.body.country || ourLoggedInUser.city),
          (ourLoggedInUser.picture =
            { url: result.secure_url } || ourLoggedInUser.picture);
      } else {
        (ourLoggedInUser.firstName =
          request.body.firstName || ourLoggedInUser.firstName),
          (ourLoggedInUser.lastName =
            request.body.lastName || ourLoggedInUser.lastName),
          (ourLoggedInUser.bio =
            request.body.bio || ourLoggedInUser.bio),
          (ourLoggedInUser.company =
            request.body.company || ourLoggedInUser.company),
          (ourLoggedInUser.address =
            request.body.address || ourLoggedInUser.address),
          (ourLoggedInUser.phoneNumber =
            request.body.phoneNumber || ourLoggedInUser.phoneNumber),
          (ourLoggedInUser.country =
            request.body.country || ourLoggedInUser.country),
          (ourLoggedInUser.city =
            request.body.city || ourLoggedInUser.city);
      }

      await ourLoggedInUser.save();

      if (request.body.company == '') {
        ourLoggedInUser.company = undefined;
        delete ourLoggedInUser.company;
        await ourLoggedInUser.save();
      }

      if (request.body.address == '') {
        ourLoggedInUser.address = undefined;
        delete ourLoggedInUser.address;
        await ourLoggedInUser.save();
      }

      if (request.body.country == '') {
        ourLoggedInUser.country = undefined;
        delete ourLoggedInUser.country;
        await ourLoggedInUser.save();
      }

      if (request.body.phoneNumber == '') {
        ourLoggedInUser.phoneNumber = undefined;
        delete ourLoggedInUser.phoneNumber;
        await ourLoggedInUser.save();
      }

      if (request.body.bio == '') {
        ourLoggedInUser.bio = undefined;
        delete ourLoggedInUser.bio;
        await ourLoggedInUser.save();
      }

      if (request.body.city == '') {
        ourLoggedInUser.city = undefined;
        delete ourLoggedInUser.city;
        await ourLoggedInUser.save();
      }
      //Updating access token to get updated info in user access token
      generateAccessToken(ourLoggedInUser, response);
      response.status(200).json({
        successMessage: 'Profile updated successfully!',
        ourUpdatedUser: ourLoggedInUser,
      });
    } else {
      response.status(404).json({ message: 'User not found!' });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

const emailRegisteredUsers = async (request, response) => {
  try {
    const { error } = mailUsersValidationSchema.validate(
      request.body,
    );
    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const {
      subject,
      emailBody: body,
      sender: userId,
      receivers,
    } = request.body;

    const receipients = await filterReceivers(receivers);
    if (receipients.length === 0) {
      throw new HttpException(
        404,
        'Email can not be sent to empty users list.',
      );
    }
    receipients.forEach(user => {
      const { email, name } = user;
      sendEmail({
        to: email,
        subject,
        html: emailUsersTemp({ body, name }),
      });
    });

    response.status(200).json({
      successMessage: 'Email sent successfully to all users!',
    });
  } catch (error) {
    //  // console.log(error);;
    response.status(error.status || 500).json({
      status: 'fail',
      errorMessage: error.message,
    });
  }
};

async function filterReceivers(receiversType) {
  switch (receiversType) {
    case 'all':
      const [regularUsers, googleUsers] = await Promise.all([
        User.find().select({ name: true, email: true }),
        googleUser.find().select({ name: true, email: true }),
      ]);

      const allUsers = [...regularUsers, ...googleUsers];

      const uniqueEmails = new Set();

      const filteredUsers = allUsers.filter(user => {
        if (uniqueEmails.has(user.email)) {
          return false;
        } else {
          uniqueEmails.add(user.email);
          return true;
        }
      });
      return filteredUsers;
    case 'admins':
      const [regularAdmins, googleAdmins] = await Promise.all([
        User.find({
          role: { $regex: 'admin', $options: 'i' },
        }).select({
          name: true,
          email: true,
        }),
        googleUser
          .find({ role: { $regex: 'admin', $options: 'i' } })
          .select({ name: true, email: true }),
      ]);

      const allAdmins = [...regularAdmins, ...googleAdmins];

      const uniqueEmailsAdmins = new Set();

      const filteredAdmins = allAdmins.filter(user => {
        if (uniqueEmailsAdmins.has(user.email)) {
          return false;
        } else {
          uniqueEmailsAdmins.add(user.email);
          return true;
        }
      });
      return filteredAdmins;
    // case 'members':
    //   const membersData = await Application.find({
    //     status: 'APPROVED',
    //   }).select(
    //     'information.name information.firstName information.lastName information.email',
    //   );
    //   const members = membersData.map(m => ({
    //     email: m.information.email,
    //     name: m.information.name
    //       ? m.information.name
    //       : `${m.information.firstName} ${m.information.lastName}`,
    //   }));
    //   const uniqueMembers = new Set();

    //   const filteredMembers = members.filter(user => {
    //     if (uniqueMembers.has(user.email)) {
    //       return false;
    //     } else {
    //       uniqueMembers.add(user.email);
    //       return true;
    //     }
    //   });
    //   return filteredMembers;
    // case 'staff':
    //   const staffs = await staffModel
    //     .find()
    //     .select('name email')
    //     .sort({ createdAt: -1 });
    //   return staffs;
    default:
      return [];
  }
}

export default {
  loginUser,
  loggedInUser,
  logoutUser,
  forgotPassword,
  loginAdmin,
  resetPassword,
  newPassword,
  updateUser,
  emailRegisteredUsers,
};
