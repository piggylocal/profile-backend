"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var config = dotenv_1.default.config();
var app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.get('/', function (req, res) {
    res.send('Hello World');
});
var port = process.env.PORT || 8080;
// Start the server
app.listen(port, function () {
    console.log("Server is running on http://localhost:".concat(port));
});
