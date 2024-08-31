import service from "../Services/parseFlowLog.service.js";

const getTagCount = async (req, res, err) => {
 try {
    const result = await service.getTagCount(req);
    if (result.error === true) {
      res.status(500).json(result);
    }
    else res.status(200).json(result);
 }
 catch{
    res.status(500).json({
        error: true,
        message: err.message
    })
 }
};

export default {
  getTagCount: getTagCount,
};
