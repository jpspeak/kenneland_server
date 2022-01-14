import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";
import fs from "fs";
import { upload } from "../config/multer";

const create = asyncHandler(async (req, res, next) => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .label("Kennel name")
      .required()
      .max(30),
    description: Yup.string()
      .label("Description")
      .max(1000),
    breeds: Yup.array()
      .required()
      .min(1, "Please select at least 1 breed")
      .label("Breeds"),
    location: Yup.string()
      .label("Location")
      .required()
      .max(100),
    email: Yup.string()
      .label("Email")
      .email(),
    mobileNumber: Yup.string()
      .label("Mobile number")
      .max(12),
    deleteBanner: Yup.boolean()
  });

  const updateUploads = upload.fields([
    { name: "displayPicture", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]);

  updateUploads(req, res, async error => {
    req.body.breeds = [].concat(req.body.breeds);
    if (error) next(error);
    schema
      .validate(req.body, { abortEarly: false, stripUnknown: true })
      .then(validatedData => {
        req.body = validatedData;

        next();
      })
      .catch(error => {
        //Field validation fails. Remove uploaded files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files) {
          for (const fieldname in files) {
            fs.unlink(files[fieldname][0].path, () => {});
          }
        }

        next(error);
      });
  });
});

const update = create;

const validateUpdateSocialMediaInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    facebook: Yup.string()
      .label("Facebook")
      .url(),
    instagram: Yup.string()
      .label("Instagram")
      .url(),
    youtube: Yup.string()
      .label("Youtube")
      .url()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});
const updateLocation = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    coordinates: Yup.object()
      .shape({
        lng: Yup.number()
          .max(180)
          .min(-180)
          .required(),
        lat: Yup.number()
          .max(90)
          .min(-90)
          .required()
      })
      .required()
    // coordinates: Yup.array()
    //   .of(Yup.number())
    //   .label("Coordinates")
    //   .length(2)
    //   .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const KennelValidation = { create, update, validateUpdateSocialMediaInput, updateLocation };
export default KennelValidation;
