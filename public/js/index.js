// Get references to page elements
var $examplename = $("#example-name");
var $examplelocation = $("#example-location");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");

var $exampleSearch = $("#example-search");
var $searchBtn = $("#search");
var $exampleList = $("#example-list");
var $saveList = $("#save-list");
var $saveBtn = $("#save");

var $parkList = $("#park-list");

// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function (example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/examples",
      data: JSON.stringify(example)
    });
  },
  saveFavorite: function (example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/favorites",
      data: JSON.stringify(example)
    });
  },
  getExamples: function () {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  getSearch: function (zip) {
    return $.ajax({
      url: "api/examples/" + zip,
      type: "GET"
    });
  },
  getSavedLoad: function (input) {
    return $.ajax({
      url: "api/loads/" + input,
      type: "GET"
    });
  },
  getPark: function (input) {
    return $.ajax({
      url: "api/parking/" + input,
      type: "GET"
    });
  },
  getZip: function (input) {
    return $.ajax({
      url: "api/zipget/" + input,
      type: "GET"
    });
  },
  deleteExample: function (id) {
    return $.ajax({
      url: "api/favorites/" + id,
      type: "DELETE"
    });
  }
};

var loadSaved = function (input) {
  API.getSavedLoad(input).then(function (data) {
    var $saves = data.Favorites.map(function (save) {
      var $div = $("<td>")
        .text(save.location)
        .addClass("save-link");

      var $li = $("<tr>")
        .attr({
          class: "list-group-item",
          "data-location": save.location,
          "data-id": save.id
        })
        .append($div);

      var searchTD = $("<td>").attr({
        class: "list-group-item",
        "data-location": save.location,
        "data-id": save.id
      });
      var $button = $("<button>")
        .addClass("success button save-link")
        .attr("id", "savedsearchbutton")
        .text("Search");

      searchTD.append($button);

      $li.append(searchTD);

      var deleteTD = $("<td>")
        .attr({
          class: "list-group-item",
          "data-location": save.location,
          "data-id": save.id
        });
      var $buttonDelete = $("<button>")
        .addClass("alert button delete")
        .attr("id", "saveddeletebutton")
        .text("Delete");

      deleteTD.append($buttonDelete);

      $li.append(deleteTD);

      return $li;
    });

    $saveList.empty();

    $saveList.append($saves);
  });

};

$(document).ready(function () {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  $.get("/api/user_data").then(function (data) {
    loadSaved(data.id);
    $(".member-name").text(data.email);
    $("#save").attr("userID", data.id);
    $("#submitForm").attr("userName", data.email);
  });
});

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function (event) {
  event.preventDefault();

  var userName = $(this)
    .parent()
    .attr("userName");

  if (typeof $examplelocation.val().trim() === "number") {
    var example = {
      user: userName,
      location: $examplelocation.val().trim(),
      body: $exampleDescription.val().trim()
    };
    if (!($examplelocation.val().trim() && $exampleDescription.val().trim())) {
      alert("You must enter an example text and description!");
      return;
    }

    API.saveExample(example).then(function () {
      $examplename.val("");
      $examplelocation.val("");
      $exampleDescription.val("");
    });


  }

  else {
    var locationToFind = $examplelocation.val().trim();

    API.getZip(locationToFind).then(function (data) {
      console.log(data);

      var example = {
        user: userName,
        title: $examplelocation.val().trim(),
        location: data,
        body: $exampleDescription.val().trim()
      };
      if (!($examplelocation.val().trim() && $exampleDescription.val().trim())) {
        alert("You must enter an example text and description!");
        return;
      }

      API.saveExample(example).then(function () {
        $examplename.val("");
        $examplelocation.val("");
        $exampleDescription.val("");
      });
    });
  }
};

var handleFormSearch = function (event) {
  event.preventDefault();
  var search = $exampleSearch.val().trim();

  if (typeof search === "number") {
    API.getSearch(search).then(function (data) {
      var $examples = data.map(function (example) {
        var $a = $("<td>")
          .text(example.body)
          .attr("data-label", "Description");

        var $pUser = $("<td>").text(example.user).attr("data-label", "Username");
        var $pZip = $("<td>").text(example.title).attr("data-label", "Description");

        var $li = $("<tr>")
          .attr({
            "data-id": example.id
          })
          .append($pUser)
          .append($pZip)
          .append($a);

        return $li;
      });
      $exampleList.empty();
      $parkList.empty();
      $exampleList.append($examples);
    });
    API.getPark(search).then(function (data) {

      var $parkes = data.map(function (park) {
        var $a = $("<td>")
          .text(park.name)
          .attr("data-label", "Name");

        var $pUser = $("<td>").text(park.address + ", " + park.city + ", " + park.state + " " + park.zip).attr("data-label", "Address");
        var $pZip = $("<td>").text("$" + park.price).attr("data-label", "Price");
        var $pPrice = $("<td>").text(park.start + " - " + park.end).attr("data-label", "Time");

        var $li = $("<tr>")
          .append($a)
          .append($pUser)
          .append($pZip)
          .append($pPrice);

        return $li;
      });

      $parkList.append($parkes);
    });
  }

  else {

    API.getZip(search).then(function (dataTwo) {
      console.log(dataTwo);

      API.getSearch(dataTwo).then(function (data) {
        var $examples = data.map(function (example) {
          var $a = $("<td>")
            .text(example.body)
            .attr("data-label", "Description");

          var $pUser = $("<td>").text(example.user).attr("data-label", "Username");
          var $pZip = $("<td>").text(example.title).attr("data-label", "Description");

          var $li = $("<tr>")
            .attr({
              "data-id": example.id
            })
            .append($pUser)
            .append($pZip)
            .append($a);

          return $li;
        });
        $exampleList.empty();
        $parkList.empty();
        $exampleList.append($examples);
      });

    });
    API.getPark(search).then(function (data) {

      var $parkes = data.map(function (park) {
        var $a = $("<td>")
          .text(park.name)
          .attr("data-label", "Name");

        var $pUser = $("<td>").text(park.address + ", " + park.city + ", " + park.state + " " + park.zip).attr("data-label", "Address");
        var $pZip = $("<td>").text("$" + park.price).attr("data-label", "Price");
        var $pPrice = $("<td>").text(park.start + " - " + park.end).attr("data-label", "Time");

        var $li = $("<tr>")
          .append($a)
          .append($pUser)
          .append($pZip)
          .append($pPrice);

        return $li;
      });

      $parkList.append($parkes);
    });
  }
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function () {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteExample(idToDelete).then(function () {
    $.get("/api/user_data").then(function (data) {
      loadSaved(data.id);
    });
  });
};

var saveFav = function () {
  var loc = $exampleSearch.val().trim();
  var object = {
    UserId: $("#save").attr("userid"),
    location: loc
  };
  API.saveFavorite(object).then(function () {
    $exampleSearch.val("");
  });
  loadSaved(object.UserId);
};

var handleFavoriteClick = function () {
  var locationToRun = $(this)
    .parent()
    .attr("data-location");

  console.log(locationToRun);

  if (typeof locationToRun !== "number") {
    API.getZip(locationToRun).then(function (dataThree) {
      console.log(dataThree);

      API.getSearch(dataThree).then(function (data) {
        var $examples = data.map(function (example) {
          var $a = $("<td>")
            .text(example.body)
            .attr("data-label", "Description");

          var $pUser = $("<td>").text(example.user).attr("data-label", "Username");
          var $pZip = $("<td>").text(example.title).attr("data-label", "Description");

          var $li = $("<tr>")
            .attr({
              "data-id": example.id
            })
            .append($pUser)
            .append($pZip)
            .append($a);

          return $li;
        });
        $exampleList.empty();
        $parkList.empty();
        $exampleList.append($examples);
      });

      API.getPark(locationToRun).then(function (data) {

        var $parkes = data.map(function (park) {
          var $a = $("<td>")
            .text(park.name)
            .attr("data-label", "Name");

          var $pUser = $("<td>").text(park.address + ", " + park.city + ", " + park.state + " " + park.zip).attr("data-label", "Address");
          var $pZip = $("<td>").text("$" + park.price).attr("data-label", "Price");
          var $pPrice = $("<td>").text(park.start + " - " + park.end).attr("data-label", "Time");

          var $li = $("<tr>")
            .append($a)
            .append($pUser)
            .append($pZip)
            .append($pPrice);

          return $li;
        });
        $parkList.append($parkes);
      });
    });
  }



  else {
    API.getSearch(locationToRun).then(function (data) {
      var $examples = data.map(function (example) {
        var $a = $("<td>")
          .text(example.body)
          .attr("data-label", "Description");

        var $pUser = $("<td>").text(example.user).attr("data-label", "Username");
        var $pZip = $("<td>").text(example.title).attr("data-label", "Description");

        var $li = $("<tr>")
          .attr({
            "data-id": example.id
          })
          .append($pUser)
          .append($pZip)
          .append($a);

        return $li;
      });
      $exampleList.empty();
      $parkList.empty();
      $exampleList.append($examples);
    });

    API.getPark(locationToRun).then(function (data) {

      var $parkes = data.map(function (park) {
        var $a = $("<td>")
          .text(park.name)
          .attr("data-label", "Name");

        var $pUser = $("<td>").text(park.address + ", " + park.city + ", " + park.state + " " + park.zip).attr("data-label", "Address");
        var $pZip = $("<td>").text("$" + park.price).attr("data-label", "Price");
        var $pPrice = $("<td>").text(park.start + " - " + park.end).attr("data-label", "Time");

        var $li = $("<tr>")
          .append($a)
          .append($pUser)
          .append($pZip)
          .append($pPrice);

        return $li;
      });

      $parkList.append($parkes);
    });
  }
};

$("#logout").on("click", function () {

  return $.ajax({
    url: "/logout",
    type: "GET"
  });
});

// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
$searchBtn.on("click", handleFormSearch);
$saveBtn.on("click", saveFav);
$saveList.on("click", ".delete", handleDeleteBtnClick);

$saveList.on("click", ".save-link", handleFavoriteClick);
