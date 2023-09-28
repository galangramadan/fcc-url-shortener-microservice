require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const db = require("./database/config");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:id", function(req, res) {
  const id = parseInt(req.params.id)

  async function getData() {
    const data = await db.get("index")
    return data
  }

  try {
    getData().then((value) => {
      const result = value.filter((elm) => {
        if (elm.short_url === id) return true;
        return false
      })

      if (result.length == 0) throw new Error("No short URL found for the given input")

      res.redirect(result[0].original_url)
    }).catch((err) => {
      res.send({
        error: err.message
      })
    })
  } catch (err) {
    res.send({
      error: err.message
    })
  }
});

app.post("/api/shorturl", function(req, res) {
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
          throw new Error("Invalid URL");
        }

        const response = {
          original_url: req.body.url,
          short_url: 1,
        };

        const index = new Array;

        db.get("index").then(value => {
          value.map((elm) => {
            index.push(elm)
          })
        }).catch(() => {
          db.set("index", [])
        })

        index.push(response)

        db.set("index", index).then(() => {
          res.send(response);
        }).catch((err) => {
          console.log(err)
        })

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

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
