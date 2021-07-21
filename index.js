const express = require("express");
const app = express();
const fs = require("fs");
const url = require('url');
const querystring = require('querystring');
const videos = [
  {"id":1,"name":"Laravel","filename":"How to develop a simple Laravel package locally.mp4"},
  {"id":2,"name":"Javascript ES","filename":"javascript_es6_es7_es8_learn_to_code_on.mp4"},
  {"id":3,"name":"CodeIgniter","filename":"CodeIgniter 4 User Login Tutorial - Part 4 - User Profile Page.mp4"}
]
app.set('view engine', 'ejs');
app.get("/", function (req, res) {
  res.render('home', {
    videos: videos
  });
});

app.get("/video/:id", function (req, res) {
  let urlPart=req.originalUrl;
  let videoId=urlPart.split("/").pop();

  let videoObj = videos.filter(function(item) {
    return item.id == videoId;
  });
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = videoObj[0].filename;
  const videoSize = fs.statSync(videoObj[0].filename).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
