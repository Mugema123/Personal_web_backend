import Joi from '@hapi/joi';

const testimonialValidationSchema = Joi.object({
  name: Joi.string().required().min(5).max(50).messages({
    'string.empty': 'The name field can not be empty',
  }),

  testimonial: Joi.string().required().messages({
    'string.empty': 'The testimonial field can not be empty',
  }),

  image: Joi.string().required().min(5).messages({
    'string.empty': 'The image field can not be empty',
  }),
  upload: Joi.string().required().valid('new', 'default'),
});

export default testimonialValidationSchema;
