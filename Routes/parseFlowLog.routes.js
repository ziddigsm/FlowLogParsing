import { Router } from "express";
import multer from "multer";
import flowLogController from "../Controllers/parseFlowLog.controller.js";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "media/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage,
    limits: { fileSize: 10000000}
});

const routes = Router();

routes.post(
  "/getTagCount",
  (req, res, next)=>{
    upload.single("flowlog")(req, res,(err)=>{
        if(err)
            res.status(400).json({
        error: true,
    message: err.message})
    next();
    })
  },
  flowLogController.getTagCount
);

export default routes;
