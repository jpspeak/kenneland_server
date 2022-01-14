import * as Yup from "yup";
import { upload } from "../config/multer";
import asyncHandler from "../helpers/async-wrapper";
import fs from "fs";
import createHttpError from "http-errors";
import _ from "lodash";
import Stud from "../models/stud.model";
import ForSalePet from "../models/for-sale-pet.model";

const MAX_IMAGES_PER_FOR_SALE_PET = 6;
const uploadForSalePetImages = upload.fields([{ name: "images", maxCount: MAX_IMAGES_PER_FOR_SALE_PET }]);

const create = asyncHandler(async (req, res, next) => {
  const schema = Yup.object().shape({
    breed: Yup.string()
      .label("Breed")
      .required()
      .max(50),
    sex: Yup.string()
      .label("Sex")
      .required(),
    dateOfBirth: Yup.date()
      .label("Date of birth")
      .required(),
    price: Yup.number()
      .label("Price")
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

  uploadForSalePetImages(req, res, async error => {
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
    breed: Yup.string()
      .label("Breed")
      .required()
      .max(50),
    sex: Yup.string()
      .label("Sex")
      .required(),
    dateOfBirth: Yup.date()
      .label("Date of birth")
      .required(),
    price: Yup.number()
      .label("Price")
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

  uploadForSalePetImages(req, res, async error => {
    if (error) next(error);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (typeof req.body.deleteImages === "string") {
      req.body.deleteImages = [req.body.deleteImages];
    }

    try {
      const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });

      //Validate stud total images
      const forSalePet = await ForSalePet.findById(req.params.forSalePetId);
      if (!forSalePet) throw new createHttpError.NotFound();

      const forSalePetImagesCount = forSalePet?.images.length;
      const deleteImagesCount = validatedData.deleteImages?.length || 0;
      const newImagesCount = files.images?.length || 0;
      const imagesTotalCount = forSalePetImagesCount - deleteImagesCount + newImagesCount;
      if (imagesTotalCount > MAX_IMAGES_PER_FOR_SALE_PET) throw createHttpError(422, { errors: [{ message: "File count not allowed." }] });
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

const ForSalePetValidation = { create, update };
export default ForSalePetValidation;
