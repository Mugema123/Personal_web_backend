import joi from "@hapi/joi" 


const aboutValidationSchema = joi.object({
    image: joi.string(),

    description: joi.string().required().messages({
        "string.empty": "The description field can not be empty",
    }),

    yearsOfExperience: joi.string().required().messages({
        "string.empty": "The years of experience field can not be empty",
    }),

    completedProjects: joi.string().required().messages({
        "string.empty": "The completed projects field can not be empty",
    }),

    companiesWork: joi.string().required().messages({
        "string.empty": "The companies work field can not be empty",
    }),

    cv: joi.string(),
})

export default aboutValidationSchema;