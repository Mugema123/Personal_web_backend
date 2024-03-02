import Joi from '@hapi/joi';

export default class MembershipValidator {
  static async create(req, res, next) {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      cover: Joi.string().required(),
      link: Joi.string().required(),
      description: Joi.string().required(),
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
      title: Joi.string(),
      link: Joi.string(),
      description: Joi.string(),
      cover: Joi.string(),
      isAccepted: Joi.boolean().required(),
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
