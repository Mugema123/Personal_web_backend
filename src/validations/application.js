import Joi from '@hapi/joi';

export default class ApplicationValidator {
  static individualInfoShema = Joi.object({
    // plan: Joi.string()
    // .valid('junior', 'Professional', 'Consulting', 'application fee')
    // .required(),
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    gender: Joi.string().valid('male', 'female', 'other'),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    nationality: Joi.string().required(),
    identificationNumber: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    placeOfBirth: Joi.string().required(),
    placeOfResidence: Joi.string().required(),
    education: Joi.object({
      level: Joi.string().required(),
      field: Joi.string().required(),
      institution: Joi.string().required(),
      graduationYear: Joi.string().required(),
    }).required(),
    referees: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          phoneNumber: Joi.string().required(),
          relationship: Joi.string().required(),
          position: Joi.string().required(),
          institution: Joi.string().required(),
        }).required(),
      )
      .required(),
    cv: Joi.string().required(),
    motivationLetter: Joi.string().required(),
    certificates: Joi.array().items(Joi.string()).required(),
  }).required();

  static companyInfoShema = Joi.object({
    // plan: Joi.string()
    // .valid('monthly', 'yearly', 'application fee')
    // .required(),
    name: Joi.string().required(),
    location: Joi.string(),
    // feeAccepted: Joi.boolean(),
    email: Joi.string().email().required(),
    yearsOfExperience: Joi.number().required(),
    staffSize: Joi.number().required(),
    completedProjects: Joi.number().required(),
    recentProject: Joi.object({
      link: Joi.string(),
      files: Joi.array().items(Joi.string()),
    }).required(),
    ceo: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      position: Joi.string().required(),
    }).required(),
  }).required();

  static async create(req, res, next) {
    const isIndividual = req.body.category === 'individual';
    // console.log(req.body);
    const schema = Joi.object().keys({
      category: Joi.string()
        .valid('individual', 'company')
        .required(),
      // membership: Joi.string(),
      information: isIndividual
        ? ApplicationValidator.individualInfoShema
        : ApplicationValidator.companyInfoShema,
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
    const isIndividual = req.body.category === 'individual';

    const schema = Joi.object().keys({
      category: Joi.string().valid('individual', 'company'),
      // membership: Joi.string(),
      information: isIndividual
        ? ApplicationValidator.individualInfoShema
        : ApplicationValidator.companyInfoShema,
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
