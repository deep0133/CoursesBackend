import multer from "multer";

const storage = multer.memoryStorage();

const singleUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
}).single("file");

export default singleUpload;
