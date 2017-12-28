var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SavedArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", SavedArticleSchema);

module.exports = Article;
