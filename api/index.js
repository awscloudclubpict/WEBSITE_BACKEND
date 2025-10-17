import app from "../src/index.js";
import serverless from "serverless-http";

// Export the serverless handler
export default serverless(app);
