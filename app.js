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

// User Model("users" Collection) Creation

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

const bcrypt = require("bcryptjs");

// Function one : setting up the LocalStrategy

const LocalStrategy = require("passport-local").Strategy;

passport.use(
    new LocalStrategy(async (username, password, done) => {

        try{

            const user = await User.findOne( { username: username }).exec();

            if(!user)
                return done(null, false, { message: "Incorrect Username" });

            // Securing passwords with bcrypt
            // Comparing hashed passwords

            // We will use the bcrypt.compare() function to validate the password input.
            // The function compares the plain-text password in the request object to the hashed password.

            const match = await bcrypt.compare(password, user.password);

            if(!match)  // passwords do not match!
                return done(null, false, { message: "Incorrect Password" });
            
            // if(user.password !== password)
            //     return done(null, false, { message: "Incorrect Password" });

            return done(null, user);
        }

        catch(error){
            return done(error);
        }
    })
);

// Functions two and three: sessions and serialization

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// When a session is created, passport.serializeUser will receive the user object found from a successful login 
// and store its .id property in the session data.
  
passport.deserializeUser(async (id, done) => {
    
    try {
      const user = await User.findById(id).exec();
      done(null, user);
    } 
    
    catch(err) {
      done(err);
    };
});

// Upon some other request, if it finds a matching session for that request, passport.deserializeUser will retrieve the
// id we stored in the session data. We then use that id to query our database for the specified user.

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    next();
});

// To have access to the "currentUser" variable in all of our views without having to manually pass it into 
// all of the controllers in which we need it.

// Routing

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index", { user: req.user }));
app.post("/log-in", passport.authenticate("local", { successRedirect: "/", failureRedirect: "/" }));

app.get("/log-out", (req, res, next) => {
    
    req.logout((err) => {

      if (err) 
        return next(err);
      
      res.redirect("/");
    });
});

app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.post("/sign-up", async (req, res, next) => {

    try{


        // Securing password with bcrypt
        // Storing hashed passwords

        // Password hashes are the result of passing the user’s password through a one-way hash function,
        // which maps variable sized inputs to fixed size pseudo-random outputs.

        // The second argument is the length of the “salt” to use in the hashing function; 
        
        // Salting a password means adding extra random characters to it, the password plus the extra random characters 
        // are then fed into the hashing function.

        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {

            if(err)
                return next(err);

            const user = new User({ username: req.body.username, password: hashedPassword});
            await user.save();
    
            res.redirect("/");   
        });
    }

    catch(error){
        return next(error);
    }
});

app.listen(3000, () => console.log("app listening on port 3000!"));