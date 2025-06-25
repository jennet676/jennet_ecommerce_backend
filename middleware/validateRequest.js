export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, 
      stripUnknown: true, 
      errors: {
        wrap: {
          label: false
        }
      }
    });

    if (!error) {
      req[property] = value;
      return next();
    }

    const errorDetails = error.details.map(detail => ({
      path: detail.path.join('.'),
      message: detail.message
    }));
  };
};