var db = require("../models");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {

  app.get("/", function(req, res) {
    res.render("landing");
    // If the user already has an account send them to the members page
    // if (req.user) {
    //   res.render("index");
    // }
    // res.render("signup");
  });

  app.get("/signup", function(req, res) {
    res.render("signup");
    // If the user already has an account send them to the members page
    // if (req.user) {
    //   res.render("index");
    // }
    // res.render("signup");
  });

  // Load index page
  // app.get("/", function(req, res) {
  //   db.Example.findAll({}).then(function(dbExamples) {
  //     res.render("login")
  //     // res.render("index", {
  //     //   msg: "Welcome!",
  //     //   examples: dbExamples
  //     // });
  //   });
  // });

  app.get("/logout", function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get("/login", function(req, res) {
    res.render("login");
    // If the user already has an account send them to the members page
    // if (req.user) {
    //   res.render("index");
    // }
    // res.render("login");
  });

  app.get("/members", isAuthenticated, function(req, res) {
    res.render("index");
  });

  // Load example page and pass in an example by id
  // app.get("/example/:id", function(req, res) {
  //   db.Example.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
  //     res.render("example", {
  //       example: dbExample
  //     });
  //   });
  // });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
