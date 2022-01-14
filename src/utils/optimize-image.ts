import sharp from "sharp";
import path from "path";
import uniqueFilename from "./unique-filename";
import fs from "fs";

const optimizeImage = async (imagePath: string) => {
  const dir = "./tmp/resized";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outputFileName = uniqueFilename("jpeg");
  const outputPath = path.resolve(dir, outputFileName);

  const output = await sharp(imagePath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(1200, null, { withoutEnlargement: true })
    .toFile(outputPath);

  fs.unlink(imagePath, err => {
    if (err) console.log(err);
  });

  return { ...output, path: outputPath, filename: outputFileName };
};

export default optimizeImage;
