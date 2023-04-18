import DataUriParser from "datauri/parser.js";
import path from "path";
const getDataUri = (file) => {
  // if you already have a file Buffer:
  console.log("in GetDataUri method File is : " + typeof file);
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getDataUri;
