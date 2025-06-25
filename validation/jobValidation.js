import Joi from "joi";

export const createJobSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    "any.required": "Title is required.",
    "string.empty": "Title cannot be empty.",
    "string.max": "Title cannot exceed 100 characters.",
  }),

  description: Joi.string().required().messages({
    "any.required": "Description is required.",
    "string.empty": "Description cannot be empty.",
  }),

  company: Joi.string().max(100).required().messages({
    "any.required": "Company is required.",
    "string.empty": "Company cannot be empty.",
    "string.max": "Company name cannot exceed 100 characters.",
  }),

  location: Joi.string().max(100).required().messages({
    "any.required": "Location is required.",
    "string.empty": "Location cannot be empty.",
    "string.max": "Location cannot exceed 100 characters.",
  }),

  category: Joi.string().max(50).required().messages({
    "any.required": "Category is required.",
    "string.empty": "Category cannot be empty.",
    "string.max": "Category cannot exceed 50 characters.",
  }),

  salary_range: Joi.string()
    .max(50)
    .allow(null, "") // Allow null or empty string if salary range is optional
    .messages({
      "string.max": "Salary range cannot exceed 50 characters.",
    }),

  employment_type: Joi.string().max(50).required().messages({
    "any.required": "Employment type is required.",
    "string.empty": "Employment type cannot be empty.",
    "string.max": "Employment type cannot exceed 50 characters.",
  }),

  is_active: Joi.boolean().required().messages({
    "any.required": "Is Active is required.",
    "boolean.base": "Is Active must be a boolean (true or false).",
  }),
});

export const createJobValidation = async (req, res, next) => {
  const { error } = createJobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return next();
};
