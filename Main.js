function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function lookupCategoryID(categories, itemid) {
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].item.id === itemid) {
      return i;
    }
  }
  return -1;

}


function getUICategoryCenters(width, height) {
  var centers = [];

  var jq_categories = document.querySelectorAll('.categories');
  [].forEach.call(jq_categories, function(cat) {
     centers.push({
          x: $(cat).offset().left,
       y: height / 2
      })
  })

  return centers;
}


var Model = BookmarkDataSingleton.getInstance();

var radius = 75;
var expanded_radius = 240;
var padding = 10;

var color_set = d3.scale.category10();

var nodes = [];
var categories = [];
var force;
var bubble;
var bookmarks;
  var bookmark ;

  var canvas;
  var width;
  var height;

var BookmarkNavigationLayout;
var bubbleForceLayout;



$(document).ready(function() {

  Model.getUIData(
    function(){     
    initializeUI();
  })
})



function initializeUI() {


  var color_set = d3.scale.category10();

  canvas = d3.select("#canvas");
  height = canvas.style("height").slice(0, -2);


  bookmark = d3.select("#bookmark")

  width = canvas.style("width").slice(0, -2);



  nodes = Model.getNodes();
  categories = Model.getCategories();

  bookmarkNavigationLayout = new NavigationLayout("#navigation", color_set);
  bookmarkNavigationLayout.initializeLayout(categories);
  centers = {
    default_center: {
      y: height / 2,
      x: width / 2
    },
    cat_centers: bookmarkNavigationLayout.getNavigationCenters(height)
  };

  bubbleForceLayout = new ForceLayout("#canvas", centers);
  bubbleForceLayout.initializeLayout(nodes);


  $("#categorize").on("click", function(e) {
    bubbleForceLayout.categorize();
  });

  $("#reset").on("click", function(e) {
    bubbleForceLayout.reset();
  });


  $("input.inputnewurl").keyup(function(e) {
    if (e.keyCode === 13) {
      addNewURL($("input.inputnewurl").val())
      $('.inputurl').slideToggle();

    }
  })



  $('.enterCat').click(function() {
    $('.inputcat').slideToggle();
  });


  $("input.inputnewcat").keyup(function(e) {
    if (e.keyCode === 13) {
      //alert($("input.inputnewcat").val())
      addNewCategory($("input.inputnewcat").val().replace("\r", "<br>"))
      $('.inputcat').slideToggle();

    }
  })


  $('.enter').click(function() {
    $('.inputurl').slideToggle()
  });




}





function renderStaticUIElements() {

  //--------UI Interaction Functions: Categorize,Reset ------------------------------- 





  //--------End UI Interaction Functions: Categorize,Reset ------------------------------- 

}

function reloadUI() {

  Model.getUIData(
    function() {
      nodes = Model.getNodes();
      categories = Model.getCategories();
      console.log(categories);

      renderUI();

    //  force.tick();

    })
}


function addNewURL(url) {
  console.log(url);
  Model.createNewBookmark(url, function(newnode) {
    bubbleForceLayout.addNode(newnode)

  });
}


function addNewCategory(name){
   console.log( Model.createNewCategory(name, reloadUI));
}


//Calculate bubble class
function category_get_class(d) {
  var category_class = 'categories' + ' ';
  if (d.ui_dragover) {
    category_class += "over ";
  }
  return category_class;
}




//--------Editting Functionality: Drag and Drop to edit ------------------------------- 



// var dragSrcEl = null;

//Binding Events






function category_handleDragOver(e) {

  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

  return false;
}

function category_handleDragEnter(e) {

  console.log("enter " + this.id);

  if (this.id != "bin" && this.id != "add") {

    d3.selectAll("#" + this.id).attr("class", function(d) {
      d.ui_dragover = true;
      console.log(category_get_class(d));
      return category_get_class(d)
    });

  } else {
    d3.selectAll("#" + this.id).attr("class", "categories draggedover");
    //if it's a bin
  }

  return false;




}


function category_handleDragLeave(e) {

  if (this.id != "bin" && this.id != "add") {
    d3.selectAll("#" + this.id).attr("class", function(d) {
      d.ui_dragover = false;
      console.log(category_get_class(d));
      return category_get_class(d)
    });

  } else {
    d3.selectAll("#" + this.id).attr("class", "categories");
    //if it's a bin
  }
}


function category_handleDrop(e) {
  // this / e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }


  var droppedElID = e.dataTransfer.getData('text/plain');
  var node_id;

  d3.selectAll("#" + droppedElID).data().forEach(function(d, i) {
    node_id = d.item.id;
  });

  //handle leave instead ?
  if (this.id != "bin" && this.id != "add") {


    var parent_id;


    // See the section on the DataTransfer object.
    d3.selectAll("#" + this.id).data().forEach(function(d, i) {
      parent_id = d.item.id
    });


    d3.selectAll("#" + this.id).attr("class", function(d) {
      d.ui_dragover = false;
      console.log(category_get_class(d));
      return category_get_class(d)

    });

    d3.selectAll("#" + droppedElID).data().forEach(function(d, i) {
      d.item.parent_id = parent_id;
      d.cat_id = lookupCategoryID(categories, parent_id);
      d.center = lookupCategoryID(categories, parent_id);
      //  console.log(d[i].__data__);
    });


    d3.selectAll("#" + droppedElID).attr("class", function(d) {
      d.ui_drag = false;
      //      console.log(bubblefill_get_class(d));
      return bubblefill_get_class(d)
    });


    Model.updateNodeAssigntoCategory(node_id, parent_id, function() {
      //   console.log("in the model")
    });


  }
  if (this.id == "bin") {
    d3.selectAll("#" + this.id).attr("class", "categories");
    d3.selectAll("#" + droppedElID).remove();

    //tbd otherwise I will remove all my bookmarks

    //   Model.removeNodeId(node_id, parent_id, function() {};

  }
  if (this.id == "add") {

    console.log("clikced add")
    d3.selectAll("#" + this.id).attr("class", "categories");

    $('#popup').bPopup({
      easing: 'easeOutBack', //uses jQuery easing plugin
      speed: 450,
      transition: 'slideDown'
    });



    //show dialog
    //create new category

    //tbd otherwise I will remove all my bookmarks

    //   Model.removeNodeId(node_id, parent_id, function() {};

  }




  // console.log(parent_id);
  // console.log(node_id);


  force.resume();

  return false;



  //figure what to do with border-color

}



