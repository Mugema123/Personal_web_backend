import { uploadSingle } from '../helpers/upload.js';
import testimonialModel from '../models/testimonialModel.js';
import testimonialValidationSchema from '../validations/testimonialValidation.js';
import isId from '../helpers/isId.js';
import { HttpException } from '../exceptions/HttpException.js';
// Add a testimonial
const addTestimonial = async (request, response) => {
  try {
    const { error } = testimonialValidationSchema.validate(
      request.body,
    );

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

    const newTestimonial = new testimonialModel({
      name: request.body.name,
      testimonial: request.body.testimonial,
      image,
      isPublic: false,
    });

    const testimonial = await newTestimonial.save();

    response.status(200).json({
      successMessage: 'Testimonial added successfully!',
      testimonialContent: testimonial,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllTestimonials = async (request, response) => {
  try {
    const where = {};
    if (request.query.all !== 'admin') {
      where.isPublic = true;
    }
    const allTestimonials = await testimonialModel
      .find(where)
      .sort({ updatedAt: -1 })
      .limit(request.query.limit);

    response.status(200).json({
      successMessage: 'Successfully retrieved all the testimonials!',
      allTestimonials: allTestimonials,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getSingleTestimonial = async (request, response) => {
  try {
    const singleTestimonial = await testimonialModel.findById(
      request.query.testimonialId,
    );
    if (!singleTestimonial) {
      return response.status(404).json({
        status: 'fail',
        message: 'Testimonial not found',
      });
    }

    response.status(200).json({
      successMessage: 'Successfully retrieved the testimonial!',
      fetchedTestimonial: singleTestimonial,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a testimonial Testimonial
const updateTestimonial = async (request, response) => {
  try {
    const { testimonialId } = request.query;
    // const updatedTestimonial = await testimonialModel.findById(
    //   request.query.testimonialId,
    // );
    // if (!updatedTestimonial) {
    //   return response.status(404).json({
    //     status: 'fail',
    //     message: 'Testimonial not found',
    //   });
    // }
    // (updatedTestimonial.name = request.body.name),
    //   (updatedTestimonial.testimonial = request.body.testimonial);
    // if (request.body.image) {
    //   const imageResult = await uploadSingle(request.body.image);
    //   updatedTestimonial.image = imageResult.secure_url;
    // } else {
    //   updatedTestimonial.image = updatedTestimonial.image;
    // }

    // await updatedTestimonial.save();
    let image;
    if (request.body.image) {
      image = (await uploadSingle(request.body.image))?.secure_url;
    }
    const updatedTestimonial =
      await testimonialModel.findByIdAndUpdate(
        testimonialId,
        {
          ...request.body,
          image,
        },
        { new: true },
      );

    if (!updateTestimonial) {
      throw new HttpException(404, 'Testimonial not found!');
    }

    response.status(200).json({
      successMessage: 'Testimonial updated successfully!',
      testimonialContent: updatedTestimonial,
    });
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

//Publish testimonial
const publishTestimonial = async (req, res) => {
  try {
    const testimonialId = isId(req.params.id);
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      throw new HttpException(400, 'Invalid publishing value!');
    }
    const testimonial = await testimonialModel.findByIdAndUpdate(
      testimonialId,
      { isPublic },
      { new: true },
    );
    if (!testimonial) {
      throw new HttpException(404, 'Testimonial not found!');
    }
    return res.status(200).json({
      message: `Testimonial by "${testimonial.name}" has ${
        testimonial.isPublic ? 'published to' : 'unpublished from'
      }  the public!`,
      testimonial,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteTestimonial = async (request, response) => {
  try {
    const res = await testimonialModel.findByIdAndDelete(
      request.query.testimonialId,
    );
    if (!res) {
      throw new Error('Delete failed: testimonial not found');
    }
    response.status(200).json({
      successMessage: 'Testimonial deleted successfully!',
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
  addTestimonial,
  getAllTestimonials,
  getSingleTestimonial,
  updateTestimonial,
  deleteTestimonial,
  publishTestimonial,
};
