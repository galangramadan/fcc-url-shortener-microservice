require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:shorturl", function (req, res) {});

app.post("/api/shorturl", function (req, res) {
  async function hostnameValidation(hostname) {
    return new Promise((resolve) => {
      dns.lookup(hostname, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  try {
    const url = new URL(req.body.url);
    const hostname = url.hostname;

    hostnameValidation(hostname)
      .then((valid) => {
        if (!valid) {
          throw new Error("Invalid hostname");
        }

        const response = {
          original_url: req.body.url,
          short_url: 1,
        };

        res.send(response);
      })
      .catch((err) => {
        res.send({ error: err.message });
      });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
