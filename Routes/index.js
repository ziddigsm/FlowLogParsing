import { Router } from "express";
import logRoute from "./parseFlowLog.routes.js";

const routes = Router();

routes.use("/", logRoute);

routes.use(err=>{
        if(err){
            console.log(err);
        }
})

export default routes;
