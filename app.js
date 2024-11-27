/******************************************************************************
 ***
 * ITE5315 – Assignment 4
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Salim Al Jarmakani Student ID: N01651848 Date: 2024-11-27
 *
 *
 ******************************************************************************/

var express = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./config/database"); // For fallback if needed
var bodyParser = require("body-parser"); // pull information from HTML POST (express4)
var path = require("path"); // Use path module to resolve absolute paths
require("dotenv").config(); // Load environment variables from .env file

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// Use the MONGODB_URI from .env file, fallback to a local DB if not found
const mongoURI = process.env.MONGODB_URI || database.url;

console.log(mongoURI);

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

const handlebars = require("express-handlebars");
// Sets our app to use the handlebars engine
app.set("view engine", "handlebars");
// Sets handlebars configurations with absolute paths
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: path.join(__dirname, "views", "layouts"), // Absolute path for layouts directory
    allowProtoPropertiesByDefault: true, // Allow proto properties
    allowProtoMethodsByDefault: true, // Allow proto methods
  })
);

// Serve static files from the "public" folder with absolute path
app.use(express.static(path.join(__dirname, "public")));

var Movie = require("./models/movie");
// Get all movies from the database
// app.get("/api/movies", function (req, res) {
//   Movie.find(function (err, movies) {
//     if (err) res.send(err);
//     res.json(movies); // Return all movies in JSON format
//   });
// });

app.get("/movies", (req, res) => {
  Movie.find({})
    .lean()
    .exec(function (err, movies) {
      if (err) res.send(err);
      res.render("movies", { movies: movies });
    });
});
// Get a movie by its ID
// app.get("/api/movies/:movie_id_or_title", function (req, res) {
//   let query = req.params.movie_id_or_title;

//   // Define a reusable function for building the database query
//   function dbQuery(query) {
//     let isObjectId = mongoose.Types.ObjectId.isValid(query);
//     let isNumeric = !isNaN(query);

//     if (isObjectId) {
//       return {
//         $or: [{ _id: query }, { Title: { $regex: query, $options: "i" } }],
//       };
//     } else if (isNumeric) {
//       return {
//         $or: [{ Movie_ID: query }, { Title: { $regex: query, $options: "i" } }],
//       };
//     } else {
//       return { Title: { $regex: query, $options: "i" } };
//     }
//   }

//   // Use dbQuery to construct the search criteria
//   let searchCriteria = dbQuery(query);

//   Movie.findOne(searchCriteria, function (err, movie) {
//     if (err) {
//       res.status(500).send(err);
//     } else if (!movie) {
//       res.status(404).send("Movie not found");
//     } else {
//       res.json(movie);
//     }
//   });
// });

// Get a movie by its ID or Title
app.get("/movies/:movie_id_or_title", function (req, res) {
  let query = req.params.movie_id_or_title;

  // Define a reusable function for building the database query
  function dbQuery(query) {
    let isObjectId = mongoose.Types.ObjectId.isValid(query);
    let isNumeric = !isNaN(query);

    if (isObjectId) {
      return {
        $or: [{ _id: query }, { Title: { $regex: query, $options: "i" } }],
      };
    } else if (isNumeric) {
      return {
        $or: [{ Movie_ID: query }, { Title: { $regex: query, $options: "i" } }],
      };
    } else {
      return { Title: { $regex: query, $options: "i" } };
    }
  }

  // Use dbQuery to construct the search criteria
  let searchCriteria = dbQuery(query);

  // Find the movie matching the search criteria
  Movie.findOne(searchCriteria)
    .lean()
    .exec(function (err, movie) {
      if (err) {
        res.status(500).send(err);
      } else if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        // Render the movie details page with the movie data
        res.render("details", { movie: movie });
      }
    });
});

app.get("/search", (req, res) => {
  res.render("searchMovies");
});

app.get("/search/result", function (req, res) {
  let query = req.query.query; // Get the search query from the request

  // Define a reusable function for building the database query
  function dbQuery(query) {
    let isObjectId = mongoose.Types.ObjectId.isValid(query);
    let isNumeric = !isNaN(query);

    // If the query is a valid ObjectId, search by _id and Title
    if (isObjectId) {
      return {
        $or: [{ _id: query }, { Title: { $regex: query, $options: "i" } }],
      };
    }
    // If the query is numeric, search by movie_id and Title
    else if (isNumeric) {
      return {
        $or: [{ Movie_ID: query }, { Title: { $regex: query, $options: "i" } }],
      };
    }
    // Otherwise, search only by title
    else {
      return { Title: { $regex: query, $options: "i" } };
    }
  }

  // Use dbQuery to construct the search criteria
  let searchCriteria = dbQuery(query);

  // Find the movie matching the search criteria
  Movie.findOne(searchCriteria)
    .lean()
    .exec(function (err, movie) {
      if (err) {
        res.status(500).send(err);
      } else {
        // Render the search page with the movie data and query
        res.render("searchMovies", { movie: movie, query: query });
      }
    });
});

// Create a new movie and return all movies after creation
// app.post("/api/movies", function (req, res) {
//   console.log(req.body);

//   Movie.create(
//     {
//       Movie_ID: req.body.Movie_ID || null,
//       Title: req.body.Title || null,
//       Year: req.body.Year || null,
//       Rated: req.body.Rated || null,
//       Released: req.body.Released || null,
//       Runtime: req.body.Runtime || null,
//       Genre: req.body.Genre || null,
//       Director: req.body.Director || null,
//       Writer: req.body.Writer || null,
//       Actors: req.body.Actors || null,
//       Plot: req.body.Plot || null,
//       Language: req.body.Language || null,
//       Country: req.body.Country || null,
//       Awards: req.body.Awards || null,
//       Poster: req.body.Poster || null,
//       Ratings: {
//         source: req.body.Ratings?.source || null,
//         value: req.body.Ratings?.value || null,
//       },
//       Metascore: req.body.Metascore || null,
//       imdbRating: req.body.imdbRating || null,
//       imdbVotes: req.body.imdbVotes || null,
//       imdbID: req.body.imdbID || null,
//       Type: req.body.Type || null,
//       tomatoMeter: req.body.tomatoMeter || null,
//       tomatoImage: req.body.tomatoImage || null,
//       tomatoRating: req.body.tomatoRating || null,
//       tomatoReviews: req.body.tomatoReviews || null,
//       tomatoFresh: req.body.tomatoFresh || null,
//       tomatoRotten: req.body.tomatoRotten || null,
//       tomatoConsensus: req.body.tomatoConsensus || null,
//       tomatoUserMeter: req.body.tomatoUserMeter || null,
//       tomatoUserRating: req.body.tomatoUserRating || null,
//       tomatoUserReviews: req.body.tomatoUserReviews || null,
//       tomatoURL: req.body.tomatoURL || null,
//       DVD: req.body.DVD || null,
//       BoxOffice: req.body.BoxOffice || null,
//       Production: req.body.Production || null,
//       Website: req.body.Website || null,
//       Response: req.body.Response || null,
//     },
//     function (err, movie) {
//       if (err) res.send(err);
//       // Return success message with the MongoDB ID of the new movie
//       res.json({
//         message: "Movie successfully added.",
//         movieID: movie._id,
//       });
//     }
//   );
// });

app.post("/api/movies", function (req, res) {
  console.log(req.body);

  Movie.create(
    {
      Movie_ID: req.body.Movie_ID || null,
      Title: req.body.Title || null,
      Year: req.body.Year || null,
      Rated: req.body.Rated || null,
      Released: req.body.Released || null,
      Runtime: req.body.Runtime || null,
      Genre: req.body.Genre || null,
      Director: req.body.Director || null,
      Writer: req.body.Writer || null,
      Actors: req.body.Actors || null,
      Plot: req.body.Plot || null,
      Language: req.body.Language || null,
      Country: req.body.Country || null,
      Awards: req.body.Awards || null,
      Poster: req.body.Poster || null,
      Ratings: {
        source: req.body.Ratings?.source || null,
        value: req.body.Ratings?.value || null,
      },
      Metascore: req.body.Metascore || null,
      imdbRating: req.body.imdbRating || null,
      imdbVotes: req.body.imdbVotes || null,
      imdbID: req.body.imdbID || null,
      Type: req.body.Type || null,
      tomatoMeter: req.body.tomatoMeter || null,
      tomatoImage: req.body.tomatoImage || null,
      tomatoRating: req.body.tomatoRating || null,
      tomatoReviews: req.body.tomatoReviews || null,
      tomatoFresh: req.body.tomatoFresh || null,
      tomatoRotten: req.body.tomatoRotten || null,
      tomatoConsensus: req.body.tomatoConsensus || null,
      tomatoUserMeter: req.body.tomatoUserMeter || null,
      tomatoUserRating: req.body.tomatoUserRating || null,
      tomatoUserReviews: req.body.tomatoUserReviews || null,
      tomatoURL: req.body.tomatoURL || null,
      DVD: req.body.DVD || null,
      BoxOffice: req.body.BoxOffice || null,
      Production: req.body.Production || null,
      Website: req.body.Website || null,
      Response: req.body.Response || null,
    },
    function (err, movie) {
      if (err) res.send(err);
      // Return success message with the MongoDB ID of the new movie
      res.render("details", {
        message: "Movie successfully added.",
      });
    }
  );
});
// Update movie title and released date by ID or movie_id
// app.put("/api/movies/:movie_id", function (req, res) {
//   console.log(req.body);

//   let movieId = req.params.movie_id;
//   // Prepare the data for update
//   var updateData = {};

//   // Update only the movie_title and released fields if provided
//   if (req.body.Title) updateData.Title = req.body.Title;
//   if (req.body.Released) updateData.Released = req.body.Released;

//   // Check if the movieId is a valid ObjectId (MongoDB _id)
//   if (mongoose.Types.ObjectId.isValid(movieId)) {
//     // If it's a valid ObjectId, update the movie by _id
//     Movie.findByIdAndUpdate(
//       movieId,
//       updateData,
//       { new: true },
//       function (err, movie) {
//         if (err) return res.send(err);
//         if (!movie)
//           return res.status(404).json({ message: "Movie not found." });
//         res.json({ message: "Successfully updated movie", movie });
//       }
//     );
//   } else {
//     // If it's not a valid ObjectId, check by Movie_ID
//     Movie.findOneAndUpdate(
//       { Movie_ID: movieId },
//       updateData,
//       { new: true },
//       function (err, movie) {
//         if (err) return res.send(err);
//         if (!movie)
//           return res.status(404).json({ message: "Movie not found." });
//         res.json({ message: "Successfully updated movie", movie });
//       }
//     );
//   }
// });

app.post("/movies/:movie_id/update", function (req, res) {
  console.log(req.body);

  let movieId = req.params.movie_id;
  // Prepare the data for update
  var updateData = {};

  // Update only the movie_title and released fields if provided
  if (req.body.Title) updateData.Title = req.body.Title;
  if (req.body.Released) updateData.Released = req.body.Released;

  // Check if the movieId is a valid ObjectId (MongoDB _id)
  if (mongoose.Types.ObjectId.isValid(movieId)) {
    // If it's a valid ObjectId, update the movie by _id
    Movie.findByIdAndUpdate(movieId, updateData, { new: true })
      .lean() // Return a plain JavaScript object
      .exec(function (err, movie) {
        if (err) return res.send(err);
        if (!movie)
          return res.status(404).json({ message: "Movie not found." });

        // Render the details page with the updated movie and success message
        res.render("details", {
          movie: movie,
          successMessage: "Movie updated successfully!",
        });
      });
  } else {
    // If it's not a valid ObjectId, check by Movie_ID
    Movie.findOneAndUpdate({ Movie_ID: movieId }, updateData, { new: true })
      .lean() // Return a plain JavaScript object
      .exec(function (err, movie) {
        if (err) return res.send(err);
        if (!movie)
          return res.status(404).json({ message: "Movie not found." });

        // Render the details page with the updated movie and success message
        res.render("details", {
          movie: movie,
          successMessage: "Movie updated successfully!",
        });
      });
  }
});

// Delete a movie by ID
// app.delete("/api/movies/:movie_id", function (req, res) {
//   console.log(req.params.movie_id);
//   let movieId = req.params.movie_id;

//   // Check if movieId is a valid ObjectId (MongoDB _id)
//   if (mongoose.Types.ObjectId.isValid(movieId)) {
//     Movie.remove({ _id: movieId }, function (err) {
//       if (err) res.send(err);
//       else res.json({ message: "Successfully! Movie has been Deleted." });
//     });
//   } else {
//     Movie.findOneAndDelete({ Movie_ID: movieId }, function (err, movie) {
//       if (err) res.send(err);
//       if (!movie) {
//         return res.status(404).json({ message: "Movie not found." });
//       }
//       res.json({ message: "Successfully! Movie has been Deleted." });
//     });
//   }
// });

app.post("/movies/:movie_id/delete", function (req, res) {
  console.log(req.params.movie_id);
  let movieId = req.params.movie_id;

  // Check if movieId is a valid ObjectId (MongoDB _id)
  if (mongoose.Types.ObjectId.isValid(movieId)) {
    Movie.remove({ _id: movieId }, function (err) {
      if (err) res.send(err);
      else res.render("movies");
    });
  } else {
    Movie.findOneAndDelete({ Movie_ID: movieId }, function (err, movie) {
      if (err) res.send(err);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found." });
      }
      res.render("movies");
      res.render("movies");
    });
  }
});

app.get("/add/movie", function (req, res) {
  res.render("add"); // Render the 'Add Movie' page
});

app.listen(port);
console.log("App listening on port : " + port);
