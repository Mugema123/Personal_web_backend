import staffModel from '../models/staffModel.js';
import staffValidationSchema from '../validations/staffValidation.js';
import cloudinary from '../helpers/cloudinary.js';
import { uploadSingle } from '../helpers/upload.js';

// Add a staff member
const addMember = async (request, response) => {
  try {
    //Validation
    const { error } = staffValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const ImageResult = await uploadSingle(request.body.image);

    const newMember = new staffModel({
      name: request.body.name,
      email: request.body.email,
      position: request.body.position,
      category: request.body.category,
      facebookProfile: request.body.facebookProfile,
      linkedlinProfile: request.body.linkedlinProfile,
      twitterProfile: request.body.twitterProfile,
      image: ImageResult.secure_url,
    });

    const staffMember = await newMember.save();

    response.status(200).json({
      successMessage: 'Staff member added successfully!',
      staffContent: staffMember,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllMembers = async (request, response) => {
  try {
    const staffMembers = await staffModel
      .find()
      .sort({ createdAt: -1 });

    response.status(200).json({
      successMessage: 'Successfully retrieved all the staff members!',
      allStaffMembers: staffMembers,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getSingleMember = async (request, response) => {
  try {
    const staffMember = await staffModel.findOne({
      _id: request.query.memberId,
    });

    response.status(200).json({
      successMessage: 'Successfully retrieved the staff member!',
      staffMember: staffMember,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a staff member
const updateMember = async (request, response) => {
  try {
    //Validation
    // const { error } = staffValidationSchema.validate(request.body);

    // if (error)
    //   return response
    //     .status(400)
    //     .json({ validationError: error.details[0].message });

    const member = await staffModel.findById(request.query.memberId);
    if (!member) {
      throw new Error('Member does not exist');
    }
    member.name = request.body.name || member.name;
    member.email = request.body.email || member.email;
    member.position = request.body.position || member.position;
    member.category = request.body.category || member.category;
    member.facebookProfile =
      request.body.facebookProfile || member.facebookProfile;
    member.linkedlinProfile =
      request.body.linkedlinProfile || member.linkedlinProfile;
    member.twitterProfile =
      request.body.twitterProfile || member.twitterProfile;

    if (request.body.image) {
      const imageResult = await uploadSingle(request.body.image);
      member.image = imageResult.secure_url;
    } else {
      member.image = member.image;
    }

    await member.save();

    response.status(200).json({
      successMessage: 'Staff member updated successfully!',
      staffMemberContent: member,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteMember = async (request, response) => {
  try {
    const res = await staffModel.findByIdAndDelete(
      request.query.memberId,
    );
    if (!res) {
      throw new Error(`Staff member does not exist`);
    }
    response.status(200).json({
      successMessage: 'Staff member deleted successfully!',
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  addMember,
  getAllMembers,
  getSingleMember,
  updateMember,
  deleteMember,
};
