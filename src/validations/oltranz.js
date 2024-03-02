import Joi from '@hapi/joi';

export default class OltranzValidate {
  static async requestPay(req, res, next) {
    const schema = Joi.object().keys({
      telephoneNumber: Joi.string(),
      paymentMethod: Joi.string(),
      payerName: Joi.string(),
      itemId: Joi.number(),
      description: Joi.string().default(
        'You are going to pay ordered products from RUPI',
      ),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error.details[0].message)
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ''),
      });
    }
    return next();
  }
}
