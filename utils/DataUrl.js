import DataUriParser from "datauri/parser.js";
import path from "path";
const getDataUri = (file) => {
  // if you already have a file Buffer:
  console.log("In getDataU : file.originalname " + file.originalname);
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  console.log("Extension Name: " + extName);
  return parser.format(extName, file.buffer);
};

export default getDataUri;
