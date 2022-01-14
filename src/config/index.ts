import dotenv from "dotenv";

dotenv.config();

const config = {
  app: {
    url: process.env.APP_URL || "http://localhost:5000",
    hostname: process.env.APP_HOSTNAME,
    port: process.env.APP_PORT || "5000"
  },
  allowedOrigin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  mail: {
    username: process.env.MAIL_USERNAME || "",
    password: process.env.MAIL_PASSWORD || ""
  },
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || ""
    }
  },
  token: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY || "",
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY || "",
    resetPasswordTokenSecretKey: process.env.RESET_PASSWORD_TOKEN_SECRET_KEY || "some random secret key"
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || ""
  },
  aws: {
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || "",
      region: process.env.AWS_S3_BUCKET_REGION || "",
      accessKeyId: process.env.AWS_S3_ACCESS_KEY || "",
      secretAccessKey: process.env.AWS_S3_SECRET_KEY || ""
    },
    cloudfront: {
      s3BaseUrl: process.env.AWS_CLOUDFRONT_S3_BASE_URL || ""
    }
  }
};

export default config;
