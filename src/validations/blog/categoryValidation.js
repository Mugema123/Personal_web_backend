import Joi from "@hapi/joi";

const categoryValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "The category name can not be empty"
    }),

    slug: Joi.string()

})


export default categoryValidationSchema