#!/usr/bin/env node

const express = require("express");
const config = require("./config.json");
const RecordUpdater = require("./record_updater");

const app = express();
const recordUpdater = new RecordUpdater(config.do_token, config.domain);

function getCallerIP(request) {
  let ip = request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress;
  ip = ip.split(',')[0];
  ip = ip.split(':').slice(-1);

  ip = ip[0];

  if (ip === "1") {
    ip = "127.0.0.1"
  }

  return ip;
}

function validateUserRequest(req) {
  return (req.query.token && req.query.token === config.client_token)
}

app.post("/update", (req, res) => {
  var remote_addr = getCallerIP(req);

  if (validateUserRequest(req)) {
    recordUpdater.update(req.query.record || "home", remote_addr)
      .then(record => {
        res.json({
          success: true,
          updated_to: record.data
        });
      })
      .catch(msg => {
        res.status(404)
          .json({
            success: false,
            message: msg
          });
      });

  } else {
    res.status(400)
      .json({
        success: false,
        message: "Invalid token."
      });
  }
});

app.listen(3000, function () {
  console.log("Dyn DNS started")
});
