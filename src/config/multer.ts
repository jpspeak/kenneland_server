import createHttpError from "http-errors";
import multer from "multer";

export const upload = multer({
  dest: "tmp/uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(createHttpError(422, "Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: {
    fileSize: 12 * 1024 * 1024 // for 12MB
  }
});
