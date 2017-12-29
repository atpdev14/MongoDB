var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var models = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var databaseUri = "mongodb://localhost/articleScraperDB";
// mongo ds133597.mlab.com:33597/heroku_4k81nqhw -u heroku_4k81nqhw -p 9o4jtaj88qtb4mmbcmotkg3hbd

if(process.env.MONGODB_URI){
  console.log("Connected via Heroku.");
  mongoose.connect(process.env.MONGODB_URI);
}else{
  console.log("Connected locally.");
  mongoose.connect(databaseUri);
}

var db = mongoose.connection;

db.on("error", function(error){
  console.log("Mongoose Error: " + error);
});

db.once("open", function(){
  console.log("Mongoose Connection Successful.");
});

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;


//=================================================
//                  Routes
//=================================================
// A GET route for scraping the echojs website
app.get("/articles", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://bassgorilla.com/free-trap-samples/").then(function(response) { //!!!! Change URL
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("h4 span").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      models.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
  // Grab every document in the Articles collection
  models.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/api/saved", function(req, res){
  console.log(req.body);
  models.UserSave.create(req.body).then(function(response){
    res.end();
  });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
