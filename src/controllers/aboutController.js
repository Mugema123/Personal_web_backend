import { uploadSingle } from '../helpers/upload.js';
import aboutModel from '../models/aboutModel.js';
import aboutValidationSchema from '../validations/aboutValidation.js';
import { HttpException } from '../exceptions/HttpException.js';

const addAbout = async (request, response) => {
  try {
    const { error } = aboutValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    let image = (await uploadSingle(request.body.image)).secure_url;
    let cv = (await uploadSingle(request.body.cv)).secure_url;

    const newAbout = new aboutModel({
      ...request.body,
      image,
      cv,
    });

    const about = await newAbout.save();

    response.status(200).json({
      successMessage: 'About added successfully!',
      aboutContent: about,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAboutContent = async (request, response) => {
  try {
    const allSkills = await aboutModel
      .find()
      .sort({ createdAt: -1 })

    response.status(200).json({
      successMessage: 'Successfully retrieved the about content!',
      aboutContent: allSkills,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateAbout = async (request, response) => {
  try {
    const { id } = request.query;
    let image;
    let cv;
    if (request.body.image) {
      image = (await uploadSingle(request.body.image))?.secure_url;
    }
    if (request.body.cv) {
      cv = (await uploadSingle(request.body.cv))?.secure_url;
    }
    const updatedAbout = await aboutModel.findByIdAndUpdate(
      id,
      {
        ...request.body,
        image,
        cv,
      },
      { new: true },
    );

    if (!updatedAbout) {
      throw new HttpException(404, 'About not found!');
    }

    response.status(200).json({
      successMessage: 'About updated successfully!',
      aboutContent: updatedAbout,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteAbout = async (request, response) => {
  try {
    const res = await aboutModel.findByIdAndDelete(
      request.query.id,
    );
    if (!res) {
      throw new Error('Delete failed: about not found');
    }
    response.status(200).json({
      successMessage: 'About deleted successfully!',
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  addAbout,
  getAboutContent,
  updateAbout,
  deleteAbout,
};
