import Joi from '@hapi/joi';

const mailUsersValidationSchema = Joi.object({
  subject: Joi.string().required().messages({
    'string.empty': 'The title field can not be empty',
  }),
  emailBody: Joi.string().required().messages({
    'string.empty': 'The description field can not be empty',
  }),
  receivers: Joi.string()
    .valid('all', 'members', 'admins', 'staff')
    .required(),
  sender: Joi.string().required().messages({
    'string.empty': 'The description field can not be empty',
  }),
});

export const notifyValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required().messages({
    'string.empty': 'The name field can not be empty',
  }),
  lastPaidMembership: Joi.string().required().messages({
    'string.empty':
      'The date for the latest membership field can not be empty',
  }),
});

export default mailUsersValidationSchema;
