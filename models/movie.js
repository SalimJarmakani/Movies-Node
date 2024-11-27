var mongoose = require("mongoose");
var Schema = mongoose.Schema;

MovieSchema = new Schema(
  {
    Movie_ID: Number,
    Title: String,
    Year: Number,
    Rated: String,
    Released: String,
    Runtime: String,
    Genre: String,
    Director: String,
    Writer: String,
    Actors: String,
    Plot: String,
    Language: String,
    Country: String,
    Awards: String,
    Poster: String,
    Ratings: {
      source: String,
      value: String,
    },
    Metascore: String,
    imdbRating: Number,
    imdbVotes: String,
    imdbID: String,
    Type: String,
    tomatoMeter: String,
    tomatoImage: String,
    tomatoRating: String,
    tomatoReviews: String,
    tomatoFresh: String,
    tomatoRotten: String,
    tomatoConsensus: String,
    tomatoUserMeter: String,
    tomatoUserRating: String,
    tomatoUserReviews: String,
    tomatoURL: String,
    DVD: String,
    BoxOffice: String,
    Production: String,
    Website: String,
    Response: Boolean,
  },
  { collection: "Movies" } // Explicitly specify the collection name
);

module.exports = mongoose.model("Movie", MovieSchema);
