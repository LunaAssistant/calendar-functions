const yup = require("yup");

exports.messageSchema = yup.object().shape({
  body: yup.object().shape({
    to: yup.string().required().min(1, "to is Required"),
    check_contact: yup.boolean().required("check_contact is Required"),
  }),
  headers: yup.object().shape({
    authorization: yup.string().required().min(1, "authorization is Required"),
  }),
});
