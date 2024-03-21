const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://resolute-ai-task.vercel.app",
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  },
});

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.otazdf5.mongodb.net`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

run().catch(console.dir);

const db = client.db("myShopDB");
const conversationCollection = db.collection("conversation");

app.get("/", async (req, res) => {
  res.send("Server is running");
});

app.get("/get_conversation", async (req, res) => {
  try {
    const conversation = await conversationCollection.find().toArray();
    res.status(200).send(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).send("Server Error");
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", async (data) => {
    try {
      const result = await conversationCollection.insertOne(data);

      if (result.acknowledged) {
        const conversation = await conversationCollection.find().toArray();
        io.emit("conversation", conversation);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
