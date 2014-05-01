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

  renderStaticUIElements();

  Model.getUIData(
    function(){     
    initializeUI();
  })
})



function initializeUI() {



  canvas = d3.select("#canvas");
  height = canvas.style("height").slice(0, -2);


  bookmark = d3.select("#bookmark")

  width = canvas.style("width").slice(0, -2);



  nodes = Model.getNodes();
  categories = Model.getCategories();

  bookmarkNavigationLayout = new NavigationLayout("#navigation");
  bookmarkNavigationLayout.initializeLayout(categories);
  centers = bookmarkNavigationLayout.getNavigationCenters(height);

  bubbleForceLayout = new ForceLayout("#canvas", centers);
  bubbleForceLayout.initializeLayout(nodes);
}

//------------------End renderUI

//--------bubble Interaction Functions: Mouseover,MouseOut ------------------------------- 

function bubble_click(d, i) {

  if (d3.event.defaultPrevented) return;
  return (d.item.url == "") ? "" : window.open(d.item.url);
}



function bubble_mouseover(d, i) {


  d3.selectAll("#bubble-" + i).select('.tooltip').remove();

  d3.event.preventDefault();
  //  force.stop();


  //center of an expanded div is at the mouse
  // d3.selectAll("#bubble-"+i).transition().duration(250).ease("linear")
  //   .style("top", (mouseY- 120 )+"px" ) 
  //   .style("left", (mouseX- 120)+"px" );


  //keep center in the center

  // console.log("onmouseover")

  bubbletop = parseFloat(d3.select("#bubble-" + i).style("top"));
  bubbleleft = parseFloat(d3.select("#bubble-" + i).style("left"));

  // d3.selectAll("#bubble-"+i).transition().duration(750).ease("linear")
  //    .style("top", bubbletop-(expanded_radius-radius)/4 + "px" ) 
  //    .style("left", bubbleleft-(expanded_radius-radius)/4 + "px"); 

  var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");

  d3.selectAll(".bubbleFill").style("opacity", 0.5);

  d3.select(this).transition().delay(200).duration(500).ease("circle")
    .style('width', expanded_radius + 'px')
    .style('height', expanded_radius + 'px')
    .style("border-color", color_set(d.cat_id))
    .style("opacity", 1)
    .style("z-index", 1)
    .each("end", function(d) {

      d3.select(this).append('div')
        .attr('class', 'tooltip')
        .style("background-color", color_set(d.cat_id))
        .style("top", expanded_radius / 4 + 3 + "px")
        .style("left", 3 + "px")
        .style("opacity", 0.9)
        .style("z-index", 2)
        .append("span")
      // .on ("click", window.open(d.item.url))
      .text(function(d, i) {
        return ((d.item.url == "") ? "no link " : d.item.title)
      });

    });

  d3.selectAll("#" + curr_class).style('color', color_set(d.cat_id));

}

function bubble_mouseout(d, i) {
  //force.gravity(0.05);

  //  if (d3.event.defaultPrevented) return;

  //bring bubble's center where it was before expanding


  //console.log("onmouseout")

  // d3.selectAll("#bubble-"+i).transition().duration(5750).ease("linear")
  //   .style("top", bubbletop + "px" ) 
  //   .style("left", bubbleleft + "px" ); 

  var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");


  var category = d3.selectAll("#" + curr_class);



  d3.selectAll(".bubbleFill").transition().duration(50).ease("linear")
    .style("opacity", 1)
    .style('width', radius + 'px')
    .style('height', radius + 'px')
  //.style("border-color","rgb(179,179,179)")
  //   .style('border-color','rgb(179,179,179)')
  .style("z-index", 0);

  d3.selectAll("#bubble-" + i).select('.tooltip').remove();
  d3.selectAll("#bubble-" + i).selectAll(".bubbleFill").style("border-color", function() {
    return (category.attr("class") == 'categories') ? 'rgb(152,151,150)' : d.color;
  });
  category.style('color', function() {
    return (d3.select(this).attr("class") == 'categories') ? 'rgb(152,151,150)' : d.color;
  });

}
//--------End bubble Interaction Functions: Mouseover,MouseOut ------------------------------- 

//   var mouseX;
//   var mouseY;
//   $('#canvas').mousemove( function(e) {
//      var offset = $(this).offset();
//     // get mouse position relative to the #canvas  as bubbles top and  left position is set relative to the dic
//      mouseX = e.pageX-offset.left; 
//      mouseY = e.pageY-offset.top;
// });


// var bubbletop;
// var bubbleleft;

//var transitionE = transition().duration(7500).ease("circle");



//--------Category Interaction Functions: Clicked -------------------------------   
function category_clicked(d, i) {


  var cur_class = d3.select(this).attr("class");

  if (!d.ui_click)

  {
    d.ui_click = true;

    d3.select(this).attr("class", cur_class + ' selected')
      .style("color", color_set(i))
      .style("border-color", color_set(i));


    bubble.selectAll(".category-" + i).style("border-color", color_set(i));
  } else {

    d.ui_click = false;

    d3.select(this).attr("class", cur_class.replace(" selected", ""))
      .style("color", "rgb(152,151,150)")
      .style("border-color", "transparent");

    bubble.selectAll(".category-" + i).style("border-color", "rgb(179,179,179)");

  }
}

function category_mouseover(d, i) {

  d.ui_mouseover = true;

  if (d.ui_click == false) {
    d3.select(this).style('color', color_set(i));
  }

}

function category_mouseout(d, i) {

  d.ui_mouseover = false;

  if (d.ui_click == false) {
    d3.select(this).style('color', 'rgb(179,179,179)');
  }

}


//--------End Category Interaction Functions: Clicked -------------------------------   

function renderStaticUIElements() {

  //--------UI Interaction Functions: Categorize,Reset ------------------------------- 

  $("#categorize").on("click", function(e) {
    nodes.forEach(function(o, i) {
      o.center = o.cat_id;
      o.fixed = false;
    })

    force.resume();
    return false;
  });


  $("#reset").on("click", function(e) {
    nodes.forEach(function(o, i) {
      o.center = o.default_center;
      o.fixed = false;
    })

    force.resume();
    return false;
  });


  $("#timeline").on("click", function(e) {

    nodes.forEach(function(o, i) {
      o.center = Math.floor(color_tags.length / 2);
    })

    force.resume();
    return false;
  });



  $('#add').click(function() {
  $('#popup').bPopup({
    easing: 'easeOutBack', //uses jQuery easing plugin
    speed: 450,
    transition: 'slideDown'
  });
});


$("#submit").on("click", function() {
  var url = $('[name="addurl"]').val();
  var category = $('[name="category"]').val();


  //console.log(nodes);

  force.stop();





  //alert("url "+ url);
  //  return false;
})




  $('.enter').click(function() {$('.inputurl').slideToggle()});


$("input.inputnewurl").keyup(function(e) {
  if (e.keyCode === 13) {
       addNewURL( $("input.inputnewurl").val())
      $('.inputurl').slideToggle();

  }
})



  $('.enterCat').click(function() {$('.inputcat').slideToggle();});


$("input.inputnewcat").keyup(function(e) {
  if (e.keyCode === 13) {
    //alert($("input.inputnewcat").val())
        addNewCategory( $("input.inputnewcat").val().replace("\r", "<br>"))
       $('.inputcat').slideToggle();

  }
})

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


function bubblefill_get_class(d) {
  var bubblefill_class = 'bubbleFill' + ' ';

  bubblefill_class += 'category-' + d.cat_id + ' ';
  if (d.ui_drag) {
    bubblefill_class += 'dragged' + ' '
  }
  return bubblefill_class;
}

//--------Editting Functionality: Drag and Drop to edit ------------------------------- 



// var dragSrcEl = null;

//Binding Events




function bubble_handleDragStart(e) {


  e.dataTransfer.setData('text/plain', this.id);

  d3.selectAll("#" + this.id).attr("class", function(d) {
    d.ui_drag = true;
    return bubblefill_get_class(d)
  });

  e.dataTransfer.effectAllowed = 'move';

}


function bubble_handleDragEnd(e) {

  d3.selectAll("#" + this.id).attr("class", function(d) {
    d.ui_drag = false;
    //      console.log(bubblefill_get_class(d));
    return bubblefill_get_class(d)
  });
  return false;

}

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




//--------Editting Functionality: End Drag and Drop to edit ------------------------------- 








//end drag-and-drop


//Add new to JSON
