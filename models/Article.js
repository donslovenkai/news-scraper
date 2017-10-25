// Require mongoose
var mongoose = require("mongoose");
// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
var ArticleSchema = new Schema({
  // 'title' is a required and of type 'String'
  title: {
    type: String,
    required: true
  },
  // 'link' is required and of type 'String'
  // todo save summary paragraph instead of link
  link: {
    type: String,
    required: true
  },
  // Saves array of notes
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This populates the Article with an associated Note
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;