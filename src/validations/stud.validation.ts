import * as Yup from "yup";
import { upload } from "../config/multer";
import asyncHandler from "../helpers/async-wrapper";
import fs from "fs";
import createHttpError from "http-errors";
import _ from "lodash";
import Stud from "../models/stud.model";

const MAX_IMAGES_PER_STUD = 6;
const uploadStudImages = upload.fields([{ name: "images", maxCount: MAX_IMAGES_PER_STUD }]);

const create = asyncHandler(async (req, res, next) => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .label("Dog name")
      .required()
      .max(50),
    breed: Yup.string()
      .label("Breed")
      .required()
      .max(50),
    studFee: Yup.number()
      .label("Stud fee")
      .required()
      .min(0)
      .max(1000000),
    location: Yup.string()
      .label("Location")
      .required()
      .max(100),
    description: Yup.string()
      .label("Description")
      .max(1000)
  });

  uploadStudImages(req, res, async error => {
    if (error) next(error);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    schema
      .validate(req.body, { abortEarly: false, stripUnknown: true })
      .then(validatedData => {
        req.body = validatedData;
        if (_.isEmpty(files)) throw createHttpError(422, { errors: [{ message: "Image field is required." }] });
        next();
      })
      .catch(error => {
        //Field validation fails. Remove uploaded files

        if (files && files.images) {
          for (const image of files.images) {
            fs.unlink(image.path, () => {});
          }
        }

        next(error);
      });
  });
});

const update = asyncHandler(async (req, res, next) => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .label("Dog name")
      .required()
      .max(50),
    breed: Yup.string()
      .label("Breed")
      .required()
      .max(50),
    studFee: Yup.number()
      .label("Stud fee")
      .required()
      .min(0)
      .max(1000000),
    location: Yup.string()
      .label("Location")
      .required()
      .max(100),
    description: Yup.string()
      .label("Description")
      .max(1000),
    deleteImages: Yup.array(Yup.string().url())
  });

  uploadStudImages(req, res, async error => {
    if (error) next(error);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (typeof req.body.deleteImages === "string") {
      req.body.deleteImages = [req.body.deleteImages];
    }

    try {
      const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });

      //Validate stud total images
      const stud = await Stud.findById(req.params.studId);
      if (!stud) throw new createHttpError.NotFound();

      const studImagesCount = stud?.images.length;
      const deleteImagesCount = validatedData.deleteImages?.length || 0;
      const newImagesCount = files.images?.length || 0;
      const imagesTotalCount = studImagesCount - deleteImagesCount + newImagesCount;
      if (imagesTotalCount > MAX_IMAGES_PER_STUD) throw createHttpError(422, { errors: [{ message: "File count not allowed." }] });
      if (imagesTotalCount <= 0) throw createHttpError(422, { errors: [{ message: "Image field is required." }] });

      req.body = validatedData;
      next();
    } catch (error) {
      // Field validation fails. Remove uploaded files
      if (files && files.images) {
        for (const image of files.images) {
          fs.unlink(image.path, () => {});
        }
      }
      next(error);
    }
  });
});

const StudValidation = { create, update };
export default StudValidation;
