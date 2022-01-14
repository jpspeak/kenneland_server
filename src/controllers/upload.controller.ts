import asyncHandler from "../helpers/async-wrapper";
import AWSS3Service from "../services/aws-s3.service";

const upload = asyncHandler(async (req, res) => {
  const signedUrl = await AWSS3Service.getSignedUrlForUpload();
  res.json({ signedUrl });
});

const UploadController = { upload };
export default UploadController;
