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


function getUICategoryCenters(categoriesUIElements, width, height) {
  var centers = [];
  categoriesUIElements.each(function() {
    centers.push({
      x: (this.offsetLeft),
      y: height / 2
    })
  });
  return centers;
}


var Model = BookmarkDataSingleton.getInstance();


$(document).ready(function() {
  Model.getUIData(renderUI);

})


function renderUI() {


  var radius = 75;
  var expanded_radius = 240;
  var padding = 10;


  var color_set = d3.scale.category10();
  var canvas = d3.select("#canvas");
  var width = canvas.style("width").slice(0, -2);
  var height = canvas.style("height").slice(0, -2);


  var categories = Model.getCategories();
  var nodes = Model.getNodes();


  var bookmark = d3.select("#bookmark");
  var cat_width_pct = Math.floor((bookmark.style("width").slice(0, -2) / categories.length - 2 * 2) / bookmark.style("width").slice(0, -2) * 100) + '%';


  //---------Main UI Object rendering----------------------------------------------------- 

  var bookmarks = bookmark.selectAll(".categories").data(categories)
    .enter().append("div")
    .attr("class", "categories")
    .attr("id", function(d, i) {
      return "category-" + i
    })
    .style("width", function(d, i) {
      return cat_width_pct
    })
    .on("mouseover", category_mouseover)
    .on("mouseout", category_mouseout)
    .on("click", category_clicked)
    .text(function(d) {
      return d.item.title.toUpperCase();
    });

  var centers = getUICategoryCenters(bookmarks, width, height);


  var bubble = canvas.selectAll("div").data(nodes)
    .enter().append("div")
    .attr("class", "bubble")
    .attr("id", function(d, i) {
      return "bubble-" + i
    });
  //.call(drag);


  var bubbleFill = bubble.append("div")
    .attr("id", function(d, i) {
      return "bubbleFill-" + i
    })
    .attr("class", bubblefill_get_class)
    .style("background-image", function(d, i) {
      return 'url(http://api.thumbalizr.com/?url=' + d.item.url + '&width=250)'
    })
  //'url(http://api.page2images.com/directlink?p2i_url='+d.image.url+'&p2i_key=c022422933354341&&p2i_size=300x300)'})
  //http://immediatenet.com/t/m?Size=1024x768&URL=http://immediatenet.com/"/
  //{ return "url("+d.image.url_full+")"})
  .style("width", radius + "px")
    .style("height", radius + "px")
    .attr("draggable", "true")
  //.style("background-color",function(d,i){ return color(i)})
  // .on("contextmenu",node_drag)
  .on("click", bubble_mouseover)
    .on("mouseout", bubble_mouseout)

  .on("dblclick", bubble_click);
      //either click or drag




      //--------End Main UI Object rendering--------------------------------------------------        

      //--------D3 Force Layout---------------------------------------------------------------  
      var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .charge(-Math.pow(radius / 2 + padding, 1) * 20)
        .gravity(0)
      //.friction(0.87)
      .on("tick", tick)
        .start();

      function tick(e) {
        var k = 0.2 * e.alpha;
        nodes.forEach(function(o, i) {
          o.y += (centers[o.center].y - o.y) * k;
          o.x += (centers[o.center].x - o.x) * k;
        });

        bubble
          .style("left", function(d, i) {
            if (d.x < 0) d.x = -d.x;
            return d.x + "px";
          })
          .style("top", function(d, i) {
            if (d.y < 0) d.y = -d.y;
            return d.y + "px";
          });

        // .style("left", function(d, i) {
        //   return d.x + "px";
        // })
        //   .style("top", function(d, i) {
        //     return d.y + "px";
        //   });
      }

      //--------End D3 Force Layout----------------------------------------------------------------  
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

  //--------End UI Interaction Functions: Categorize,Reset ------------------------------- 

  //Calculate bubble class
  function bubblefill_get_class(d) {
    var bubblefill_class = 'bubbleFill' + ' ';

    bubblefill_class += 'category-' + d.cat_id + ' ';
    if (d.ui_drag) {
      console.log("dragged");
      bubblefill_class += 'dragged' + ' '
    }
    return bubblefill_class;
  }



  //--------Editting Functionality: Drag and Drop to edit ------------------------------- 



  // var dragSrcEl = null;

  //Binding Events

  var jq_bubbleFill = document.querySelectorAll('.bubbleFill');
  [].forEach.call(jq_bubbleFill, function(bubbleFill) {
    bubbleFill.addEventListener('dragstart', bubble_handleDragStart, false);
    bubbleFill.addEventListener('dragend', bubble_handleDragEnd, false);
    //  bubbleFill.addEventListener('drop', function(){console.log("drrrop")}, false);
  });


  var jq_categories = document.querySelectorAll('.categories');
  [].forEach.call(jq_categories, function(cat) {
    cat.addEventListener('dragenter', category_handleDragEnter, false);
    cat.addEventListener('dragover', category_handleDragOver, false);
    cat.addEventListener('dragleave', category_handleDragLeave, false);
    cat.addEventListener('drop', category_handleDrop, false);

  });



  function bubble_handleDragStart(e) {


    this.classList.add('dragged');
    e.dataTransfer.setData('text/plain', this.id);

    //d3 part not needed
    canvas.selectAll("#" + this.id).forEach(function(d, i) {
      d[i].__data__.ui_drag = true;
    });

    e.dataTransfer.effectAllowed = 'move';

  }


  function bubble_handleDragEnd(e) {

    this.classList.remove('dragged');
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

    this.classList.add('over');
    return false;
  }


  function category_handleDragLeave(e) {


    this.classList.remove('over'); // this / e.target is previous target element.
  }


  function category_handleDrop(e) {
    // this / e.target is current target element.

    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }

    this.classList.remove('over');

    var parent_id;
    var node_id;

    var droppedElID = e.dataTransfer.getData('text/plain');

    console.log(droppedElID);

    // See the section on the DataTransfer object.
    d3.selectAll("#" + this.id).forEach(function(d, i) {
      parent_id = d[i].__data__.item.id
      console.log(d[i].__data__)
    });

    d3.selectAll("#" + droppedElID).forEach(function(d, i) {
      node_id = d[i].__data__.item.id;
      d[i].__data__.item.parent_id = parent_id;
      d[i].__data__.cat_id = lookupCategoryID(categories, parent_id);
      d[i].__data__.center = lookupCategoryID(categories, parent_id);
      console.log(d[i].__data__);
    });

    force.resume();


    console.log(parent_id);
    console.log(node_id);

    Model.updateNodeAssigntoCategory(node_id, parent_id, function() {
      console.log("in the model")
    });


    //update categories array  


    // color_set(lookupCategoryID(categories, parent_id))


    $("#" + droppedElID).removeClass();
    $("#" + droppedElID).addClass('bubbleFill');
    $("#" + droppedElID).addClass(this.id);
    //console.log($("#" + droppedElID).attr("color"));


    //++ modify bookmarks as well/

    return false;
  }



  //--------Editting Functionality: End Drag and Drop to edit ------------------------------- 


}






//end drag-and-drop


//Add new to JSON
$(function() {
  $('#enter').click(function() {
    $('.inputfield').slideToggle();
  });
});

$(document).keyup(function(e) {
  if ($("input.inputnewurl") && (e.keyCode === 13)) {
    //   alert('I told ya there is no Sorry no back end:(')

  }
});