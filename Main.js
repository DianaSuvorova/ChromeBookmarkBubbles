var Model = BookmarkDataSingleton.getInstance();

var radius = 75;
var expanded_radius = 240;
var padding = 10;


var bookmarkNavigationLayout;
var bubbleForceLayout;



$(document).ready(function() {

  Model.getUIData(function() {
    initializeUI();
  })
})



function initializeUI() {


  var color_set = d3.scale.category10();

  var canvas = d3.select("#canvas");
  var height = canvas.style("height").slice(0, -2);
  var width = canvas.style("width").slice(0, -2);


  var nodes = Model.getNodes();
  var categories = Model.getCategories();

  bookmarkNavigationLayout = new NavigationLayout("#navigation", color_set);
  bookmarkNavigationLayout.initializeLayout(categories);
  centers = {
    default_center: {
      y: height / 2,
      x: width / 2
    },
    cat_centers: bookmarkNavigationLayout.getNavigationCenters(height)
  };

  bubbleForceLayout = new ForceLayout("#canvas", centers,color_set);
  bubbleForceLayout.initializeLayout(nodes);


  $("#categorize").on("click", function(e) {
    bubbleForceLayout.categorize();
  });

  $("#reset").on("click", function(e) {
    bubbleForceLayout.reset();
  });


  $("input.inputnewurl").keyup(function(e) {
    if (e.keyCode === 13) {
      addNewURL($("input.inputnewurl").val());
      $("input.inputnewurl").val("");
      $('.inputurl').slideToggle();

    }
  })


  var categoryInput = $("input.inputnewcat");
  var categoryDefaultValue = categoryInput.val();


  categoryInput.focus(function() {
    if (categoryInput.val() == categoryDefaultValue) categoryInput.val("");
  }).blur(function() {
    if (categoryInput.val().length == 0) categoryInput.val(categoryDefaultValue);
  });


  categoryInput.keyup(function(e) {
    if (e.keyCode === 13) {
      //alert(categoryInput.val())
      addNewCategory(categoryInput.val())
      categoryInput.val(categoryDefaultValue)
    }
  })


  $('.enter').click(function() {
    $('.inputurl').slideToggle()
  });


}


function addNewURL(url) {
  Model.createNewBookmark(url, function(newnode) {
    bubbleForceLayout.addNode(newnode)

  });
}


function addNewCategory(name) {
  Model.createNewCategory(name, function(newnode) {
    bookmarkNavigationLayout.addNode(newnode)
  });

}