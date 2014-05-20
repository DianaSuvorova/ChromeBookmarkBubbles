var Model = BookmarkDataSingleton.getInstance();

var radius = 75;
var clusterPadding = 0;
var expanded_radius = 240;
var padding = 75 / 5;

var maxNodesPerCategory=5;

var bookmarkNavigationLayout;
var bubbleForceLayout;
var color_set;



$(document).ready(function() {

  Model.getUIData(function() {
    initializeUI();
    //   searchBookmarks("D3");
  })
})



function initializeUI() {


  var nodes = Model.getNodesLimitedForEachCategory(maxNodesPerCategory);
  var categories = Model.getCategories();
  color_set = Model.getColorSetforCategories(d3.scale.category10(), categories);





  bookmarkNavigationLayout = new NavigationLayout("#canvas", color_set);
  bookmarkNavigationLayout.initializeLayout(categories);


  bubbleForceLayout = new ForceLayout("#canvas", color_set);

    // categories.forEach(function(d){
    //   if (d.totalNodes>maxNodesPerCategory )
    //     nodes.push(d);
    //     bubbleForceLayout.addRemainingItemsNode(d);
    // });


  bubbleForceLayout.initializeLayout(nodes);


  $("#categorize").on("click", function(e) {
    bubbleForceLayout.categorize();
  });

  $("#reset").on("click", function(e) {
    bubbleForceLayout.reset();
  });



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


  jQuery("input[id^='bblsize']").click(function() {
    //jQuery("input[name='sum']").val(jQuery(this).val());
    radius = parseInt(jQuery(this).val());
    padding = radius / 5;
    bubbleForceLayout.changeBubbleSize(radius);
  });

}

$(function() {
  $("input#search").keyup(function(e) {
    if ($(this).val()>"")
    searchBookmarks($(this).val());
    else bubbleForceLayout.highlightAllNodes();

  });
});

function searchBookmarks(term) {
  Model.search(term, function(nodes) {
    bubbleForceLayout.highlightNodes(nodes);
  })
}


function addNewCategory(name) {
  Model.createNewCategory(name, function(newnode) {
    categories = Model.getCategories();
    color_set = Model.getColorSetforCategories(d3.scale.category10(), categories);
    console.log(color_set);
    bookmarkNavigationLayout.addNode(newnode)
  });



}