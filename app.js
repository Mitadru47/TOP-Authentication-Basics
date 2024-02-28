// DB Connection

const mongoDB = "mongodb+srv://Admin-Mitadru:DB1234@clustermg.e4fjgoy.mongodb.net/authenticationAppDB?retryWrites=true&w=majority&appName=ClusterMG";

const mongoose = require("mongoose");
mongoose.connect(mongoDB);

// DB Connection Error Handler

const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// User Schema Creation

const Schema = mongoose.Schema;
const UserSchema = new Schema({

    username: { type: String, required: true }, 
    password: { type: String, required: true } 
});

// User Model(Collection Prototype) Declaration

const User = mongoose.model("user", UserSchema);

// App Creation

const express = require("express");
const app = express();

// View Engine Declaration

app.set("views", __dirname);
app.set("view engine", "pug");

// Passport Authentication Setup

const passport = require("passport");
const session = require("express-session"); // Dependency used in the background by passport.js

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());

// Routing

app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => res.render("index"));

app.listen(3000, () => console.log("app listening on port 3000!"));