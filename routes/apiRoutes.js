var db = require("../models");
// var controllers = require("../controllers");
var passport = require("../config/passport");

var axios = require("axios");
var moment = require('moment');

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/members");
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    console.log(req.body);
    db.User.create({
      email: req.body.email,
      password: req.body.password
    }).then(function () {
      res.redirect(307, "/api/login");
    }).catch(function (err) {
      console.log(err);
      res.json(err);
      // res.status(422).json(err.errors[0].message);
    });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    }
    else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //=======================================================================================

  app.get("/api/parking/:input", function (req, res) {
    var object = [];
    var objectTwo = [];
    var input = req.params.input;

    var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + input + "&key=AIzaSyA_Lt2iyOCQB8ExzXNaVUl46NbUh0QY1WM";

    axios.get(googleURL).then(
      function (response) {
        console.log("\n" + input + "\n")

        var location = response.data.results[0].geometry.location
        console.log(response.data.results[0]);
        // console.log(location);

        var lat = JSON.stringify(location.lat);
        var lng = JSON.stringify(location.lng);



        var now = moment().format();
        var later = moment().add(2, 'hour').format();

        // console.log(now);
        // console.log(later);

        var coordinates = lat + "," + lng;

        var parkURL = "https://api.parkwhiz.com/v4/quotes/?q=coordinates:" + coordinates + " distance:5&start_time=" + now + "&end_time=" + later + "&?sort=distance:asc&api_key=fcfaf6b9d1d024aa2a29efeb6613428c41ec615b"

        axios.get(parkURL).then(
          function (responseTwo) {
            var resultLength;
            if (responseTwo.data.length >= 5) {
              resultLength = 5;
            }
            else {
              resultLength = responseTwo.data.length;
            }

            for (i = 0; i < resultLength; i++) {
              // for (i = 0; i < 5; i++) {
              let data = responseTwo.data[i];
              let embedded = responseTwo.data[i]._embedded['pw:location'];
              // console.log(data);
              // console.log(embedded);

              console.log("Name: " + embedded.name);
              console.log("Address: " + embedded.address1 + ", " + embedded.city + ", " + embedded.state + " " + embedded.postal_code);
              console.log("Photo: " + embedded.photos[0].sizes.hub_frontpage.URL);
              if (data.purchase_options[0] === undefined) {
                console.log("No Price Info\n");
              }
              else {
                var startTime = moment(data.purchase_options[0].start_time).format('LT');
                var endTime = moment(data.purchase_options[0].end_time).format('LT');
                // console.log(startTime);
                // console.log(endTime);
                console.log("Time: " + startTime + " - " + endTime);
                console.log("Price: " + data.purchase_options[0].price.USD + "\n");
                  objectTwo[i] = {
                    name: embedded.name,
                    address: embedded.address1,
                    city: embedded.city,
                    state: embedded.state,
                    zip: embedded.postal_code,
                    photo: embedded.photos[0].sizes.hub_frontpage.URL,
                    start: startTime,
                    end: endTime,
                    price: data.purchase_options[0].price.USD
                  }
                object.push(objectTwo);

              };
 
            };
            console.log(objectTwo);
            var filtered = objectTwo.filter(function (el) {
              return el != null;
            });
            
            console.log(filtered);
            res.json(filtered);
          }
        );
      }
    );

  })

  // Get all examples
  app.get("/api/examples", function (req, res) {
    db.LocalData.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  //get search for items
  app.get("/api/examples/:zip", function (req, res) {
    db.LocalData.findAll({
      where: {
        location: req.params.zip
      }
    }).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  //get saved items for list
  app.get("/api/loads/:input", function (req, res) {
    db.User.findOne({
      where: {
        id: req.params.input
      },
      include: [db.Favorite]
    }).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  // Create a new example
  app.post("/api/examples", function (req, res) {
    db.LocalData.create(req.body).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  // Save to Favorites
  app.post("/api/favorites", function (req, res) {
    console.log(req.body);
    db.Favorite.create(req.body).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/favorites/:id", function (req, res) {
    db.Favorite.destroy({ where: { id: req.params.id } }).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  app.get("/logout", function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get("/api/zipget/:title", function(req, res){
     var input = req.params.title;
     console.log(input)

     var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + input + "&key=AIzaSyA_Lt2iyOCQB8ExzXNaVUl46NbUh0QY1WM";

     axios.get(googleURL).then(
      function (response) {
    

        var location = response.data.results[0].geometry.location
        console.log(location);
        // console.log("yay!" + location);

        var lat = JSON.stringify(location.lat);
        var lng = JSON.stringify(location.lng);

        var coordinates = lat + "," + lng;

        var latlngFind = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates + "&key=AIzaSyA_Lt2iyOCQB8ExzXNaVUl46NbUh0QY1WM"

        axios.get(latlngFind).then(
          function (responseTwo) {
            console.log(responseTwo.data.results[0].address_components);
            var resLength = responseTwo.data.results[0].address_components.length - 1;
            console.log(resLength);
            var zip = responseTwo.data.results[0].address_components[resLength].long_name;
            console.log(zip.toString().length)
            
            if (zip.toString().length === 5) {
              res.json(zip);
            }
            else {
              var zipTwo = responseTwo.data.results[0].address_components[resLength - 1].long_name
              res.json(zipTwo);
            }

        

          }
        );
      }
    );
     
  });

};


