// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// we set the port of the app
app.set('port', process.env.PORT || 3000);

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_bw0vwfsx:lu8ircbag3kiik4748lrn0970p@ds049446.mlab.com:49446/heroku_bw0vwfsx");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// App Routes

// index route (Home Page)
app.get("/", function(req, res) {
    res.send(index.html);
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request('http://kxan.com/', function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every article tag, and do the following:
        $("article").each(function(i, element) {

            // Save an empty result object
            var result = {};

            // Add the text img and href of every link, and save them as properties of the result object
            result.title = $(element).children("header").find("h1").find("a").text();
            result.link = $(element).children("header").find("h1").find("a").attr("href");
            result.img = $(element).children("figure").find("a").find("img").attr("src");

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    console.log(doc);
                }
            });

        });
    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry

    console.log("inside articles comment post at server.js" + req.params.id);

    var newNote = new Note(req.body);

    console.log(newNote);
    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { 'note': doc._id } }, { new: true })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

// Delete One from the DB
app.get("/deleteNote/:id", function(req, res) {
    // Remove a note using the objectID
    Note.remove({ "_id": req.params.id },
        function(error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
                res.send(error);
            }
            // Otherwise, send the mongojs response to the browser
            // This will fire off the success function of the ajax request
            else {
                console.log(removed);
                res.send(removed);
            }
        });
});



// Listen on port 3000
app.listen(process.env.PORT || 3000, function() {
    console.log("App running on port");
});
