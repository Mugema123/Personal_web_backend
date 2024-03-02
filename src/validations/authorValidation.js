import Joi from '@hapi/joi';

const authorInfoValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'The name field can not be empty',
  }),
  description: Joi.string().required().messages({
    'string.empty': 'The position field can not be empty',
  }),
  facebook: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Facebook URL',
    }),
  linkedin: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Linkedin URL',
    }),
  twitter: Joi.string()
    .optional()
    .allow('')
    .regex(/^https?:\/\//)
    .messages({
      'string.pattern.base': 'Invalid Twitter URL',
    }),
});

export default authorInfoValidationSchema;
