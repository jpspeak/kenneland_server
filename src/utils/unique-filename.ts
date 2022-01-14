import { nanoid } from "nanoid";

type Ext = "jpeg" | "jpg";

const uniqueFilename = (ext?: Ext) => {
  const uniqueString = Date.now() + nanoid();
  if (ext) {
    return uniqueString + "." + ext;
  }
  return uniqueString;
};

export default uniqueFilename;
