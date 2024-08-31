import express from "express";
import routes from "./Routes/index.js";

const app = express();

app.use("/api", routes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
