import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import supabase from "./config/supabase.js";
// import { Server } from "socket.io";
import BlogRouter from "./routes/blog.js";
import TagRouter from "./routes/tag.js";
import SearchRouter from "./routes/search.js";
import InsightsRouter from "./routes/insights.js";
import TokenRouter from "./routes/token.js"
import AuthRouter from "./routes/auth.js";
import ComradeRouter from "./routes/comrades.js";
import RecomendationRouter from "./routes/recomendation.js";

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

// const io = new Server({
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

var messages = [];

io.on("connection", async (socket) => {
  console.log("Someone has connected");
  socket.emit("FirstEvent", await FetchData());
  socket.emit("SecondEvent", "Hello");
  socket.on("ReceivedSeconEvent", (msg) => {
    console.log(msg);
  });
  socket.on("send_message", (data) => {
    messages.push(data);
    io.emit("receive_message", data);
    io.emit("reload_chat", messages);
  });
  socket.on("disconnect", () => {
    console.log("Someone has left");
  });
});

app.use("/blog/", BlogRouter);
app.use("/search/", SearchRouter);
app.use("/insights/",InsightsRouter);
app.use("/comrade/",ComradeRouter);
app.use("/recomendation/",RecomendationRouter);
app.use("/tag/",TagRouter);
app.use("/token/",TokenRouter);
app.use("/auth/",AuthRouter);

io.listen(4000);
console.log(`Socket Server running on port 4000`);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
