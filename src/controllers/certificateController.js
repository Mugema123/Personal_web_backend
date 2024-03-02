import certificateModel from '../models/certificateModel.js';
import isId from '../helpers/isId.js';
import { sendEmail } from '../helpers/nodemailer.js';
import { uploadSingle } from '../../src/helpers/upload.js';
import emailUsersTemp from '../helpers/emailTemplates/emailToUsers.js';
import cloudinary from '../helpers/cloudinary.js';

// Save a certificate
const saveCertificate = async (request, response) => {
  try {
    const certificateData = request.body;
    // const applicationId = isId(request.body.application);

    // const exist = await certificateModel.findOne({
    //   application: applicationId,
    // });

    // if (!exist) {
      const certificateContent = await certificateModel.create(
        certificateData,
      );
      return response.status(200).json({
        successMessage: 'Certificate saved successfully!',
        certificateContent: certificateContent,
      });
    // }
    // return response.status(200).json({
    //   successMessage: 'Certificate saved successfully!',
    //   certificateContent: exist,
    // });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getCertificate = async (request, response) => {
  try {
    const certificate = await certificateModel.findOne({
      ownerRegNumber: request.query.certificateId,
    });
    response.status(200).json({
      successMessage: 'Successfully retrieved the certificate!',
      certificateData: certificate,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const emailCertificate = async (request, response) => {
  try {
    const { fullName, email, fileImage } = request.body
    const certificate = await uploadSingle(
      fileImage
    );

    function generateDownloadLink(imageUrl) {
      const cloudinaryTransformedUrl = imageUrl.replace('upload/', 'upload/fl_attachment/');
      return cloudinaryTransformedUrl;
    }

    sendEmail({
      to: email,
      subject: 'Your RUPI Membership Certificate',
      html: emailUsersTemp({
        name: fullName,
        body: `<div>
          We hope this email finds you well. On behalf of the RUPI team, we are thrilled to inform you that you have been granted a RUPI Membership Certificate. <br><br>
          To download your well-deserved certificate, simply click <a href="${generateDownloadLink(certificate.secure_url)}">here</a>. <br><br>
          Please ensure that you have a stable internet connection to facilitate a smooth and hassle-free download process. Should you encounter any difficulties, please don't hesitate to reach out to us. <br><br>
          Best regards, <br>
          RUPI Team
        </div>`,
      }),
    });
    response.status(200).json({
      successMessage: `Successfully emailed the certificate to ${email}`,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  saveCertificate,
  getCertificate,
  emailCertificate
};
