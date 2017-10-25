var express = require("express");

var router = express.Router();

var request = require("request");

var cheerio = require("cheerio");

var mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Main Route
router.get("/", function(req, res) {
  res.render("index");
});

// savedarticles route to scraped articles saved in the database
router.get("/savedarticles", function(req, res) {

  // Find items in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Else send the item to the browser as a JSON object
    else {
      var hbsArticleObject = {
        articles: doc
      };
      res.render("savedarticles", hbsArticleObject);
    }
  });
});

// POST request to scrape the NYT website
router.post("/scrape", function(req, res) {

  // Retrieve the body of the html with request
  request("http://www.nytimes.com/", function(error, response, html) {
    // Load the html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // Create an empty array for temporarily saving and showing scrapedArticles
    var scrapedArticles = {};
    // Retrieve every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add text and href of every link; save as properties of the result object
      result.title = $(this).children("a").text();

      console.log("What is the result title? " + result.title);
      
      result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    console.log("Scraped Articles object created: " + scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

// POST route to saved article 
router.post("/save", function(req, res) {

  console.log("This is the title: " + req.body.title);
  // Save an empty new article object
  var newArticleObject = {};

  newArticleObject.title = req.body.title;

  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  console.log("We can save the article: " + entry);

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

  res.redirect("/savedarticles");

});

// Route to delete saved articles
router.get("/delete/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);
  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Deleted");
    }
    res.redirect("/savedarticles");
  });
});

//Route to notes 
router.get("/notes/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);
  console.log("Able to activate delete function");

  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Deleted");
    }
    res.send(doc);
  });
});

// This will grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {

  console.log("ID is read" + req.params.id);

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get notes");
    }
    else {
      console.log("Getting article and notes " + doc);
      res.json(doc);
    }
  });
});

// Post route for creating a new note or replacing an existing note
router.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  // Save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } 
    else {
      // Use the article id to find article and then push note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article");
        } else {
          console.log("Saved notes displayed " + doc.notes);
          res.send(doc);
        }
      });
    }
  });
});
// Export routes for server.js to use.
module.exports = router;