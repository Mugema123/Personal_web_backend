import Joi from '@hapi/joi';

export default class MembershipValidator {
  static async create(req, res, next) {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      price: Joi.number().positive().required(),
      isCompany: Joi.boolean(),
      isPopular: Joi.boolean(),
      features: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required(),
            isAvailable: Joi.boolean().required(),
          }),
        )
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ''),
      });
    }
    return next();
  }

  static async update(req, res, next) {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      price: Joi.number().positive().required(),
      isCompany: Joi.boolean(),
      isPopular: Joi.boolean(),
      features: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required(),
            isAvailable: Joi.boolean().required(),
          }),
        )
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ''),
      });
    }
    return next();
  }
}
