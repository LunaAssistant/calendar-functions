const yup = require("yup");

exports.accountSchema = yup.object().shape({
    uid: yup.string().required().min(1, "uid is Required"),
});
