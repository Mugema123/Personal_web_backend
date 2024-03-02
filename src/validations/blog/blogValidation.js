import Joi from '@hapi/joi';

const blogValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'The title can not be empty',
  }),
  postBody: Joi.string().required().messages({
    'string.empty': 'The post body can not be empty',
  }),
  postImage: Joi.string(),
  createdBy: Joi.string(),
  category: Joi.string(),
  slug: Joi.string(),
  isPublic: Joi.boolean().required(),
});

export default blogValidationSchema;
