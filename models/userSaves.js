var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSaveSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  }
});

var UserSave = mongoose.model("Article", SavedArticleSchema);

module.exports = UserSave;
 