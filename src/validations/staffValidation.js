import Joi from '@hapi/joi';

const staffValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'The name field can not be empty',
  }),
  email: Joi.string().required().messages({
    'string.empty': 'The email field can not be empty',
  }),
  position: Joi.string().required().messages({
    'string.empty': 'The position field can not be empty',
  }),
  category: Joi.string().required().messages({
    'string.empty': 'The department field can not be empty',
  }),
  facebookProfile: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Facebook URL',
    }),
  linkedlinProfile: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Linkedin URL',
    }),
  twitterProfile: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Twitter URL',
    }),

  image: Joi.string().required().messages({
    'string.empty': 'Member image is required',
  }),
});

export default staffValidationSchema;
