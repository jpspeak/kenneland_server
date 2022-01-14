import S3 from "aws-sdk/clients/s3";
import fs from "fs";
import config from "../config";

const s3 = new S3({
  region: config.aws.s3.region,
  accessKeyId: config.aws.s3.accessKeyId,
  secretAccessKey: config.aws.s3.secretAccessKey
});

const uploadFile = (filePath: string, objectKey: string) => {
  const fileToUpload = fs.readFileSync(filePath);

  const params = {
    Bucket: config.aws.s3.bucketName,
    Body: fileToUpload,
    Key: objectKey
  };

  return s3.upload(params).promise();
};

const deleteFile = (objectKey: string) => {
  const params = {
    Bucket: config.aws.s3.bucketName,
    Key: objectKey
  };
  return s3.deleteObject(params).promise();
};

const getFileObjectFromS3 = (objectKey: string) => {
  const params = {
    Key: objectKey,
    Bucket: config.aws.s3.bucketName
  };
  return s3.getObject(params).promise();
};

const getSignedUrlForUpload = async () => {
  const params = {
    Bucket: "kenneland",
    Key: "9a01bd1fa9f220712d07e01d7afdc859.jpg",
    Expires: 60,
    ContentType: "image/jpeg"
  };

  const url = await new Promise((resolve, reject) => {
    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) reject(err);

      resolve(url);
    });
  });

  return url;
};

const AWSS3Service = { getSignedUrlForUpload, uploadFile, deleteFile, getFileObjectFromS3 };
export default AWSS3Service;
