const express = require("express");
const app = express();

app.use("/", express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
})

app.listen(1337, () => {
  console.log("The server is up and running!");
});