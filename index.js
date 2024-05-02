import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import BlogRouter from "./routes/blog.js";
import TagRouter from "./routes/tag.js";
import SearchRouter from "./routes/search.js";
import InsightsRouter from "./routes/insights.js";
import TokenRouter from "./routes/token.js";
import AuthRouter from "./routes/auth.js";
import ComradeRouter from "./routes/comrades.js";
import RecomendationRouter from "./routes/recomendation.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }


app.get("/", (req, res) => {
  res.send("Welcome to Insightful Backend");
});

app.use("/blog/", BlogRouter);
app.use("/search/", SearchRouter);
app.use("/insights/", InsightsRouter);
app.use("/comrade/", ComradeRouter);
app.use("/recomendation/", RecomendationRouter);
app.use("/tag/", TagRouter);
app.use("/token/", TokenRouter);
app.use("/auth/", AuthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});