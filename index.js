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

const io = new Server(server);

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.otazdf5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

const db = client.db("myShopDB");
const conversationCollection = db.collection("conversation");

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.get("/get_conversation", async (req, res) => {
  const conversation = await conversationCollection.find().toArray();
  res.status(200).send(conversation);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", async (data) => {
    try {
      const result = await conversationCollection.insertOne(data);

      if (result.acknowledged) {
        const conversation = await conversationCollection.find().toArray();
        socket.emit("conversation", conversation);
      }
    } catch (error) {
      console.log(error);
    }
  });
});

server.listen(port, () => {
  console.log(`server listening on ${port}`);
});
