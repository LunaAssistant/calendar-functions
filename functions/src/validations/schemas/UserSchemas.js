const yup = require("yup");

exports.userAndTimezoneSchema = yup.object().shape({
  uid: yup.string().required().min(1, "uid is Required"),
  timezone: yup.string().required(),
});
