class Validator {
  validate(schema, data) {
    return schema.validate(data).catch((error) => {
      return { validation: error.message };
    });
  }
}

exports.Validator = Validator;
