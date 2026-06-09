import "dotenv/config";
import { createApp } from "./infra/app.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Nexus Talent API running on :${PORT}`);
});
