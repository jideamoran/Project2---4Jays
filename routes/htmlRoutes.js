var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {

  app.get("/", function(req, res) {
    res.render("landing");
  });

  app.get("/signup", function(req, res) {
    res.render("signup");
  });

  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

  app.get("/login", function(req, res) {
    res.render("login");
  });

  app.get("/members", isAuthenticated, function(req, res) {
    res.render("index");
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
