import multer from "multer";
import path from "path";


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext === ".pdf" || ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and image files are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });

export default upload;