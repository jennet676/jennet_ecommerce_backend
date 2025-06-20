import Joi from "joi";
// Define a schema for a user object
export const userSignupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username must be a string",
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must be at most 30 characters long",
    "any.required": "Username is required",
  }),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.pattern.base": "Password must be 8-30 alphanumeric characters",
      "any.required": "Password is required",
    }),
  role: Joi.string().valid("job_seeker", "employer").required().messages({
    "string.base": "Role must be a string",
    "any.only": "Role must be either 'job_seeker' or 'employer'",
    "any.required": "Role is required",
  }),
});

export const userLoginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username must be a string",
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must be at most 30 characters long",
    "any.required": "Username is required",
  }),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.pattern.base": "Password must be 8-30 alphanumeric characters",
      "any.required": "Password is required",
    }),
});

// Validate data against the schema
// const userData = {
//   username: "johndoe",
//   password: "password123",
//   role: "job_seeker",
// };

// const validationResult = userSignupSchema.validate(userData);
// if (validationResult.error) {
//   console.error("Validation error:", validationResult.error.message);
// } else {
//   console.log("Valid data:", validationResult.value);
// }
