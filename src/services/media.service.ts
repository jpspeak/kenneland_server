import optimizeImage from "../utils/optimize-image";
import AWSS3Service from "./aws-s3.service";
import fs from "fs";

const uploadImage = async (imagePath: string, imageOwnerId: string, objectKeyToDelete?: string) => {
  //Optimize Image
  const optimizedImage = await optimizeImage(imagePath);

  //Upload to s3
  const objectKey = imageOwnerId + "/" + optimizedImage.filename;
  const uploaded = await AWSS3Service.uploadFile(optimizedImage.path, objectKey);

  //Delete s3 object
  if (objectKeyToDelete) {
    await AWSS3Service.deleteFile(objectKeyToDelete);
  }

  //Delete local file
  fs.unlink(optimizedImage.path, err => {
    if (err) console.log(err);
  });

  const imageObjectKey = uploaded.Key;
  return imageObjectKey;
};

const deleteImage = async (objectKey: string) => {
  await AWSS3Service.deleteFile(objectKey);
};

// const uploadImage = async (fieldName: string, ownerId: string, req: Request, res: Response) => {
//   const dir = "./tmp/uploads";
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }

//   await new Promise((resolve, reject) => {
//     upload.single(fieldName)(req, res, async error => {
//       if (error) reject(error);
//       else resolve(true);
//     });
//   });

//   if (!req.file) throw createHttpError(422, "No file found.");
//   const imagePath = req.file.path;
//   //Optimize Image
//   const optimizedImage = await optimizeImage(imagePath);

//   //Upload to s3
//   const s3Folder = ownerId + "/";
//   const uploaded = await AWSS3Service.uploadFile(optimizedImage.path, s3Folder + optimizedImage.filename);

//   //Delete local file
//   fs.unlink(optimizedImage.path, err => {
//     if (err) console.log(err);
//   });

//   const imageUrl = config.aws.cloudfront.s3BaseUrl + "/" + uploaded.Key;

//   return imageUrl;
// };
// const uploadImages = async (fieldName: string, ownerId: string = "", req: Request, res: Response) => {
//   await new Promise((resolve, reject) => {
//     upload.array(fieldName, 10)(req, res, async error => {
//       if (error) reject(error);
//       else resolve(true);
//     });
//   });

//   if (!req.files) throw createHttpError(422, "No file found.");

//   const images = req.files as Array<Express.Multer.File>;

//   const imageUrls = await Promise.all(
//     images.map(async image => {
//       const imagePath = image.path;
//       //Optimize Images
//       const optimizedImage = await optimizeImage(imagePath);
//       //Upload to s3
//       const s3Folder = ownerId + "/";
//       const uploaded = await AWSS3Service.uploadFile(optimizedImage.path, s3Folder + optimizedImage.filename);
//       //Delete local file
//       fs.unlink(optimizedImage.path, err => {
//         if (err) console.log(err);
//       });
//       const imageUrl = config.aws.cloudfront.s3BaseUrl + "/" + uploaded.Key;
//       return imageUrl;
//     })
//   );
//   return imageUrls;
// };

const MediaService = { uploadImage, deleteImage };
export default MediaService;
