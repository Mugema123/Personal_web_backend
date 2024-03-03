import Joi from "@hapi/joi";

const projectsValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "The title field can not be empty",
  }),

  projectImage: Joi.string(),

  githubLink: Joi.string(),

  demoLink: Joi.string(),
});

export default projectsValidationSchema;
