import { uploadSingle } from '../helpers/upload.js';
import skillsModel from '../models/skillsModel.js';
import skillsValidationSchema from '../validations/skillsValidation.js';
import isId from '../helpers/isId.js';
import { HttpException } from '../exceptions/HttpException.js';

const addSkill = async (request, response) => {
  try {
    const { error } = skillsValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    let image;
    if (request.body.upload === 'new') {
      image = (await uploadSingle(request.body.image)).secure_url;
    } else {
      image = request.body.image;
    }

    const newSkill = new skillsModel({
      name: request.body.name,
      image,
      isPublic: true,
    });

    const skill = await newSkill.save();

    response.status(200).json({
      successMessage: 'Skill added successfully!',
      skillContent: skill,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllSkills = async (request, response) => {
  try {
    const where = {};
    if (request.query.all !== 'admin') {
      where.isPublic = true;
    }
    const allSkills = await skillsModel
      .find(where)
      .sort({ updatedAt: -1 })
      .limit(request.query.limit);

    response.status(200).json({
      successMessage: 'Successfully retrieved all the skills!',
      allSkills: allSkills,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getSingleSkill = async (request, response) => {
  try {
    const singleSkill = await skillsModel.findById(
      request.query.skillId,
    );
    if (!singleSkill) {
      return response.status(404).json({
        status: 'fail',
        message: 'Skill not found',
      });
    }

    response.status(200).json({
      successMessage: 'Successfully retrieved the skill!',
      fetchedSkill: singleSkill,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateSkill = async (request, response) => {
  try {
    const { skillId } = request.query;
    let image;
    if (request.body.image) {
      image = (await uploadSingle(request.body.image))?.secure_url;
    }
    const updatedSkill = await skillsModel.findByIdAndUpdate(
      skillId,
      {
        ...request.body,
        image,
      },
      { new: true },
    );

    if (!updatedSkill) {
      throw new HttpException(404, 'Skill not found!');
    }

    response.status(200).json({
      successMessage: 'Skill updated successfully!',
      skillContent: updatedSkill,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const publishSkill = async (req, res) => {
  try {
    const skillId = isId(req.params.id);
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      throw new HttpException(400, 'Invalid publishing value!');
    }
    const skill = await skillsModel.findByIdAndUpdate(
      { _id: skillId },
      { isPublic },
      { new: true },
    );
    if (!skill) {
      throw new HttpException(404, 'Skill not found!');
    }
    return res.status(200).json({
      message: `"${skill.name}" skill has been ${
        skill.isPublic ? 'published to' : 'unpublished from'
      }  the public!`,
      skill,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteSkill = async (request, response) => {
  try {
    const res = await skillsModel.findByIdAndDelete(
      request.query.skillId,
    );
    if (!res) {
      throw new Error('Delete failed: skill not found');
    }
    response.status(200).json({
      successMessage: 'Skill deleted successfully!',
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  addSkill,
  getAllSkills,
  getSingleSkill,
  updateSkill,
  deleteSkill,
  publishSkill,
};
