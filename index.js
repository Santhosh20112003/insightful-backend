const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const BlogRouter = require("./routes/blog.js");
const TagRouter = require("./routes/tag.js");
const SearchRouter = require("./routes/search.js");
const InsightsRouter = require("./routes/insights.js");
const TokenRouter = require("./routes/token.js");
const AuthRouter = require("./routes/auth.js");
const ComradeRouter = require("./routes/comrades.js");
const RecomendationRouter = require("./routes/recomendation.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const allowedOrigins = ['http://localhost:3000', 'https://insightfulblog.vercel.app/'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

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