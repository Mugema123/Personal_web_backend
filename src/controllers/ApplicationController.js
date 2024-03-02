import mongoose from 'mongoose';
import { HttpException } from '../exceptions/HttpException.js';
// import { uploads } from '../helpers/cloudinary.js';
import { paginate } from '../helpers/pagination.js';
import Application from '../models/Application.js';
import Trash from '../models/trashModel.js';
import emailUsersTemp from '../helpers/emailTemplates/emailToUsers.js';
import { sendEmail } from '../helpers/nodemailer.js';
import isId from '../helpers/isId.js';

export default class ApplicationController {
  static async createApplication(req, res) {
    try {
      const exist = await Application.findOne({ user: req.user._id });
      if (exist) {
        throw new HttpException(
          404,
          `Already have an application with ID: ${exist._id}`,
        );
      }
      const applicationData = req.body;

      const lastApplication = await Application.findOne(
        {},
        {},
        { sort: { registrationNumber: -1 } },
      );
      let prefix = 'A';
      let suffix = 1;
      // console.log(lastApplication);
      if (lastApplication) {
        const lastSuffix = parseInt(
          lastApplication.registrationNumber.slice(1),
        );
        if (lastSuffix < 999) {
          prefix = lastApplication.registrationNumber.slice(0, 1);
          suffix = lastSuffix + 1;
        } else {
          prefix = String.fromCharCode(prefix.charCodeAt(0) + 1);
        }
      }
      const newRegistrationNumber =
        prefix + suffix.toString().padStart(3, '0');

      const application = await Application.create({
        ...applicationData,
        user: req.user._id,
        membership:
          applicationData.category === 'company' ? 'Company' : 'none',
        userModel:
          req.user.accountType === 'Google' ? 'googleUser' : 'User',
        registrationNumber: newRegistrationNumber,
      });
      return res.status(201).json({
        status: 201,
        data: application,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async decide(req, res) {
    try {
      const applicationId = isId(req.params.applicationId);
      const { message: rejectReason } = req.body;
      const status = req.body.status.toUpperCase();
      if (
        !['REJECTED', 'ACCEPTED', 'APPROVED', 'DISAPPROVED'].includes(
          status,
        )
      ) {
        throw new HttpException(400, 'Invalid status: ' + status);
      }
      const isDecline =
        status === 'REJECTED' || status === 'DISAPPROVED';
      if (isDecline && !rejectReason) {
        if (!rejectReason) {
          throw new HttpException(
            400,
            `${
              status === 'REJECTED' ? 'Rejection' : 'Disapproving'
            } reason is required`,
          );
        }
      }
      const updated = await Application.findByIdAndUpdate(
        applicationId,
        { status, rejectReason: !isDecline ? null : rejectReason },
        { new: true },
      );
      if (!updated) {
        throw new HttpException(
          404,
          `Application is not found with id: ${applicationId}`,
        );
      }
      if (status === 'APPROVED') {
        sendEmail({
          to: updated.information.email,
          subject:
            'Your Membership Application Approved Successfully!',
          html: emailUsersTemp({
            name:
              updated.information.name ||
              `${updated.information.firstName} ${updated.information.lastName}`,
            body: `We would like to let you know that your application at RUPI was approved by our team! You can now enjoy our benefits and pay for licencing fees to secure a RUPI Membership Certificate! visit our website to learn more...`,
          }),
        });
      } else if (status === 'DISAPPROVED') {
        sendEmail({
          to: updated.information.email,
          subject: 'Your Membership Application Disapproved',
          html: emailUsersTemp({
            name:
              updated.information.name ||
              `${updated.information.firstName} ${updated.information.lastName}`,
            body: `Unfortunately, we would like to let you know that your application at RUPI was not approved by our team because of the following reason: "${rejectReason}", please reach out to our team for more clarifications or visit our website for more help. Registrar: ${req.user.name}`,
          }),
        });
      }
      return res.status(200).json({
        status: 200,
        message: `Application ${status.toLowerCase()}!`,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async getApplications(req, res) {
    const { sortBy, category, membership } = req.query;
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const offset = (page - 1) * limit;
      const where = {};
      if (category && category !== 'all') {
        where.category = category;
      }
      if (membership && membership !== 'all') {
        where.membership = membership;
      }
      const application = await Application.find(where)
        .select(
          'category membership information.email information.name information.firstName information.lastName paid createdAt status user hasCertificate lastPaidMembership registrationNumber',
        )
        .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
        .skip(offset)
        .limit(limit);

      const count = await Application.count(where);

      const pagination = paginate(count, limit, page);

      return res.status(200).json({
        status: 200,
        data: application,
        pagination,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async getApplicationByUser(req, res) {
    try {
      const userId = req.user._id;
      const application = await Application.findOne({
        user: userId,
      }).select(
        'paid membership rejectReason information.plan information.name information.firstName information.lastName status category amount hasCertificate registrationNumber',
      );
      if (!application) {
        throw new HttpException(
          404,
          `You don't have any application yet`,
        );
      }
      return res.status(200).json({
        status: 200,
        data: application,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async getApplication(req, res) {
    const { applicationId } = req.params;
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        throw new HttpException(404, 'No application found');
      }
      return res.status(200).json({
        status: 200,
        data: application,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async updateApplication(req, res) {
    const { applicationId } = req.params;
    try {
      const applicationData =
        await ApplicationController.getApplicationData(req);
      const application = await Application.findOneAndUpdate(
        { _id: applicationId },
        applicationData,
        { new: true },
      );
      if (!application) {
        throw new HttpException(404, 'No application found');
      }
      return res.status(200).json({
        status: 200,
        data: application,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async editApplicationMembership(req, res) {
    try {
      const applicationId = isId(req.params.applicationId);
      const { membership } = req.body;
      if (
        !['none', 'Junior', 'Professional', 'Consulting'].includes(
          membership,
        )
      ) {
        throw new HttpException(403, 'Invalid membership value!');
      }
      const application = await Application.findByIdAndUpdate(
        applicationId,
        { membership },
      );
      if (!application) {
        throw new HttpException(404, 'Application not found!');
      }
      if (
        application.membership !== membership &&
        application.status === 'APPROVED'
      ) {
        sendEmail({
          to: application.information.email,
          subject: 'Your Membership Updated',
          html: emailUsersTemp({
            name:
              application.information.name ||
              application.information.firstName,
            body: `We would like to notify you that your membership has been updated from ${application.membership} to ${membership}, Visit our website for more...`,
          }),
        });
      }
      return res.status(200).json({
        status: 200,
        message:
          'Application membership updated successfully to ' +
          membership,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  static async deleteApplication(req, res) {
    const { applicationId } = req.params;
    try {
      if (
        !applicationId ||
        !mongoose.Types.ObjectId.isValid(applicationId)
      ) {
        throw new Error(
          !applicationId
            ? 'Application id required'
            : 'Invalid application id format',
        );
      }
      const application = await Application.findOne({
        _id: applicationId,
      });
      if (!application) {
        throw new HttpException(404, 'No application found');
      }
      await Trash.create({
        user_id: req.user._id,
        userModel:
          req.user.accountType === 'Google' ? 'googleUser' : 'User',
        element: application,
        elementType: 'Application',
      });
      return res.status(200).json({
        status: 200,
        message: 'Application deleted successfully!',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  // static async getApplicationData(req) {
  //   const applicationData = req.body;

  //   const isIndividual = applicationData.category === 'individual';
  //   if (isIndividual) {
  //     const {
  //       cv,
  //       motivationLetter,
  //       certificates = [],
  //     } = applicationData.information;
  //     const [cvResult, motivationLetterResult] = await Promise.all([
  //       uploads(cv, 'cvs'),
  //       uploads(motivationLetter, 'letters'),
  //     ]);
  //     const certificatesResult = await Promise.all(
  //       certificates.map(item => uploads(item, 'certificates')),
  //     );
  //     applicationData.information.cv = cvResult.secure_url;
  //     applicationData.information.motivationLetter =
  //       motivationLetterResult.secure_url;
  //     applicationData.information.certificates =
  //       certificatesResult.map(item => item.secure_url);
  //   } else {
  //     const { files = [] } =
  //       applicationData.information.recentProject;
  //     const projectsResult = await Promise.all(
  //       files.map(item => uploads(item, 'projects')),
  //     );
  //     const projectFiles = projectsResult.map(
  //       item => item.secure_url,
  //     );
  //     applicationData.information.recentProject.files = projectFiles;
  //   }

  //   return applicationData;
  // }
}
