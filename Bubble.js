


var isbookmarks=0;
var isdebugmode=1;


///some global vars


function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 


// these are bookmark items
//node items will be an arry of items
//with url and tags
//url
//tags
//
//var node_items=JSON.parse('[{"url":"images/tn_123.jpeg","url_full":"images/123.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_layers.jpeg","url_full":"images/layers.jpeg","subject":"Philosophy","media":"picture","source":""},{"url":"images/tn_crocodile.jpeg","url_full":"images/crocodile.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_perceivedProbability.jpeg","url_full":"images/perceivedProbability.jpeg","subject":"Psychology","media":"picture","source":""},{"url":"images/tn_worldWithoutUs.jpeg","url_full":"images/worldWithoutUs.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_historyOfArt.jpeg","url_full":"images/historyOfArt.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_TimeOfDay.jpeg","url_full":"images/TimeOfDay.jpeg","subject":"Art","media":"D3","source":"http://bl.ocks.org/clayzermk1/raw/9142407/"}]');

//var root = JSON.parse('{"id":"1","name":"Structure","children":[{"id":"2","name":"Media","children":[{"id":"3","name":"static","children":[{"id":"4","name":"text","size":"10"},{"id":"5","name":"picture","size":"10"}]},{"id":"6","name":"interaction","children":[{"id":"7","name":"D3","size":"10"}]},{"id":"8","name":"film","children":[{"id":"9","name":"animation","size":"10"},{"id":"10","name":"movie","size":"10"}]}]},{"id":"11","name":"Subject","children":[{"id":"12","name":"Neurosicence","children":[{"id":"13","name":"BIO","size":"10"},{"id":"14","name":"AI","size":"10"}]},{"id":"15","name":"Psychology","size":"10"},{"id":"16","name":"Philosophy","size":"10"},{"id":"17","name":"Art","size":"10"}]}]}');

// console.log(node_items);


var Model = BookmarkDataSingleton.getInstance();

$(document).ready(function(){  
  Model.fetchData();
  console.log(Model.getBubbleNodeItems())

})

// renderUI(); })

//Ithink it's ugly





function renderUI(){

  var color = d3.scale.category10();
  var canvas = d3.select("#canvas");
  var width= canvas.style("width").slice(0, -2);
  var height= canvas.style("height").slice(0, -2);
  
  var bookmark = d3.select("#bookmark");
  var bookmark_width = Math.floor((bookmark.style("width").slice(0, -2)/navigation_items.length - 2*2)/bookmark.style("width").slice(0, -2)*100)+'%';
  
  
  categories
  var categories = d3.range(navigation_items.length).map(function(i){return {color:color(i),title:navigation_items[i]}; });
  var centers =[];




  var bookmarks = bookmark.selectAll(".categories").data(categories)
                .enter().append("div")
                .attr("class","categories")
                .attr("id",function(d){
                  return d.title.replace(/ /g,'')})
                .style("width", bookmark_width)
                .on("mouseover",function(d){d3.select(this).style('color',d.color)})
                .on("mouseout",function(d){ if  (d3.select(this).attr("class")=='categories') d3.select(this).style('color','rgb(152,151,150)')})
                .on("click", categories_clicked)
                .text(function(d){return d.title;});

  
  bookmarks.each(function(){centers.push({x:(this.offsetLeft),y: height/2})});

 if(isdebugmode) console.log(centers);

    ///Bubble collision part
 
 var radius= 75; 
 var expanded_radius=240;
 var padding=10;   




if(isdebugmode) console.log(color_tags);


  var nodes = d3.range(node_items.length).map(function(i) { return { center : Math.floor(color_tags.length/2) , radius:radius/2+padding , image : node_items[i] ,cluster : color_tags.indexOf(node_items[i].tags)  ,color : color(color_tags.indexOf(node_items[i].tags)) }});
  console.log(nodes);

  var bubble = canvas.selectAll(".bubble").data(nodes)
                  .enter().append("div")
                  .attr("class","bubble")
                  .attr("id",function(d, i){ return "bubble-"+i});
                  //.call(drag);
                  

  var bubbleFill = bubble
                .append("div")
                .attr("id",function(d, i){ return "bubbleFill-"+i})
                .attr("class",function(d, i) { return "bubbleFill "+ d.image.tags})
                .style("background-image", function(d, i) {return 'url(http://api.thumbalizr.com/?url='+d.image.url+'&width=250)'})
                  //'url(http://api.page2images.com/directlink?p2i_url='+d.image.url+'&p2i_key=c022422933354341&&p2i_size=300x300)'})
                  //http://immediatenet.com/t/m?Size=1024x768&URL=http://immediatenet.com/"/
                  //{ return "url("+d.image.url_full+")"})
                .style("width",radius+"px")
                .style("height",radius+"px")
                .attr("draggable","true")
                //.style("background-color",function(d,i){ return color(i)})
                // .on("contextmenu",node_drag)
                //.on("mouseover", mouseover)
                //.on("mouseout", mouseout)
                
                .on("click",function(d) {
                //either click or drag
                   if (d3.event.defaultPrevented) return;
                  return (d.image.url=="")? "" : window.open(d.image.url); 
                })
            ;
               

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .charge(-Math.pow(radius/2+padding,1)*20 )
        .gravity(0)
        //.friction(0.87)
        .on("tick", tick)
        .start();





  var mouseX;
  var mouseY;
  $('#canvas').mousemove( function(e) {
     var offset = $(this).offset();
    // get mouse position relative to the #canvas  as bubbles top and  left position is set relative to the dic
     mouseX = e.pageX-offset.left; 
     mouseY = e.pageY-offset.top;
});


var bubbletop;
var bubbleleft;

//var transitionE = transition().duration(7500).ease("circle");


    function mouseover(d, i) {



     //  force.stop();


       //center of an expanded div is at the mouse
       // d3.selectAll("#bubble-"+i).transition().duration(250).ease("linear")
       //   .style("top", (mouseY- 120 )+"px" ) 
       //   .style("left", (mouseX- 120)+"px" );

       
       //keep center in the center

        console.log("onmouseover")

         bubbletop=parseFloat(d3.select("#bubble-"+i).style("top"));
         bubbleleft=parseFloat(d3.select("#bubble-"+i).style("left"));

         // d3.selectAll("#bubble-"+i).transition().duration(750).ease("linear")
         //    .style("top", bubbletop-(expanded_radius-radius)/4 + "px" ) 
         //    .style("left", bubbleleft-(expanded_radius-radius)/4 + "px"); 

        d3.selectAll(".bubbleFill")
              .style("opacity", 0.5);

        d3.select(this).transition().duration(500).ease("circle")
            .style('width', expanded_radius+'px')
            .style('height', expanded_radius+'px')
            .style("border-color",d.color)
            .style("z-index",1)
            .each("end",function() { 
                 d3.select(this).append('div')
                  .attr('class','tooltip')
                  .style("background-color",function(){console.log(d.color);return d.color})  
    //                    .transition()
                  .style("top",expanded_radius/4+3+"px")
                  .style("left",3+"px")       
                  .style("opacity",0.7)
                  .style("z-index",2) 
                .append("span")
                  .text(function(d, i) { return ((d.image.url =="" ) ? "no link " : d.image.title )});
            });

           // d3.select(this).select('div.tooltip')
           //          .append("span")
           //          .transition().delay(250).duration(25).ease("linear")
                    
      
          //highlight category         

          d3.selectAll("#"+d.image.tags).style('color',d.color);

    }

    function mouseout(d, i) {
      //force.gravity(0.05);

    //  if (d3.event.defaultPrevented) return;

      //bring bubble's center where it was before expanding


              console.log("onmouseout")

       // d3.selectAll("#bubble-"+i).transition().duration(5750).ease("linear")
       //   .style("top", bubbletop + "px" ) 
       //   .style("left", bubbleleft + "px" ); 


      var category=d3.selectAll("#"+d.image.tags);

      d3.selectAll(".bubbleFill").transition().duration(50).ease("linear")
      .style("opacity", 1)
      .style('width', radius+'px')
      .style('height', radius+'px')
      //.style("border-color","rgb(179,179,179)")
   //   .style('border-color','rgb(179,179,179)')
      .style("z-index",0); 



       d3.selectAll("#bubble-"+i).select('.tooltip').remove();
       d3.selectAll("#bubble-"+i).selectAll(".bubbleFill").style("border-color",function(){
       return (category.attr("class")=='categories')? 'rgb(152,151,150)': d.color ;});

       category.style('color',function(){ return (d3.select(this).attr("class")=='categories')? 'rgb(152,151,150)': d.color ;});



//      force.resume();

    }

    function categories_clicked(d,i){

      if (d3.select(this).attr("class") == "categories"){
        
        d3.select(this).attr("class","categories selected")
        .style("color",d.color)
        .style("border-color",d.color)
        ;
        bubble.selectAll("."+d.title.replace(/ /g,'')).style("border-color",d.color);
      }

      else{

        d3.select(this).attr("class","categories")
        .style("color","rgb(152,151,150)")
        .style("border-color","transparent");
          bubble.selectAll("."+d.title.replace(/ /g,'')).style("border-color","rgb(179,179,179)");

        }
    }

 
    function tick(e) {
        var k = 0.2 * e.alpha;
           nodes.forEach(function(o, i) {
              o.y += (centers[o.center].y- o.y) * k;
              o.x += (centers[o.center].x - o.x) * k;
            });



          bubble
            //    .style("left", function(d,i) {  if (d.x < 0) d.x=-d.x; return  d.x +"px";})
            //    .style("top", function(d,i) {  if (d.y < 0) d.y=-d.y;return d.y + "px"; });

                .style("left", function(d,i) { return  d.x +"px";})
                .style("top", function(d,i) { return d.y + "px"; });
  
    }


$("#categorize").on("click", function(e) {
    nodes.forEach(function(o, i) {
      o.center=o.cluster;
      o.fixed=false;
    })

      force.resume();
    return false;
  });


$("#reset").on("click", function(e) {
    nodes.forEach(function(o, i) {
      o.center=Math.floor(color_tags.length/2-1) ;
      o.fixed=false;
    })

      force.resume();
    return false;
  });


$("#timeline").on("click", function(e) {

    nodes.forEach(function(o, i) {
      o.center=Math.floor(color_tags.length/2) ;
    })

      force.resume();
    return false;
  });


//end render ui
//Drag-and-drop nodes. Maybe not needed.





  var node_drag = d3.behavior.drag()
      //  .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
     force.stop() // stops the force auto positioning before you start dragging
    //d.fixed = true;
    //d3.event.sourceEvent.stopPropagation();
    //d3.event.sourceEvent.preventDefault();
    }

    function dragmove(d, i) {

      console.log(d);
      console.log(d3.event);
        d.px += d3.event.dx;
        d.py += d3.event.dy;

      

      //  d.x = Math.max(d.radius, Math.min(width - d.radius, d3.event.x));
      //   d.y = Math.max(d.radius, Math.min(height - d.radius, d3.event.y)); 

               console.log(d);


        force.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
       // force.tick();
         force.resume();
         console.log(d3.select(this).select('.bubbleFill'));
      //  d3.select(this).on("click",function(d) {return (d.image.url=="")? "" : window.open(d.image.url); })
    }


  //bubble.call(node_drag);  


  var dragSrcEl = null;


function handleDragStart(e) {
  this.style.opacity = '0.4';  // this / e.target is the source node.
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';


  e.dataTransfer.setData('text/plain',this.id);

  console.log(this.id);
}

var cols = document.querySelectorAll('.bubbleFill');
[].forEach.call(cols, function(col) {
  col.addEventListener('dragstart', handleDragStart, false);
  col.addEventListener('dragend', handleDragEnd, false);
});


function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('selected');
  this.classList.add('over');
}


function handleDragLeave(e) {
  this.classList.remove('over');
   this.classList.remove('selected');  // this / e.target is previous target element.
}


function handleDrop(e) {
  // this / e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  // See the section on the DataTransfer object.
  console.log(this.id);

  var droppedElID=e.dataTransfer.getData('text/plain');

  $("#"+droppedElID).removeClass();
  $("#"+droppedElID).addClass('bubbleFill');
  $("#"+droppedElID).addClass(this.id);


  //++ modify bookmarks as well/

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.

   //  his.classList.remove('over');
   // this.classList.remove('selected');


   this.style.opacity = '1';  

  // [].forEach.call(cats, function (cat) {
  //   cat.classList.remove('selected');
  //   cat.classList.remove('over');
  // });
}


var cats = document.querySelectorAll('.categories');
[].forEach.call(cats, function(cat) {
  cat.addEventListener('dragenter', handleDragEnter, false);
  cat.addEventListener('dragover', handleDragOver, false);
  cat.addEventListener('dragleave', handleDragLeave, false);
  cat.addEventListener('drop', handleDrop, false);

});


}






//end drag-and-drop


//Add new to JSON
$(function() {
    $('#enter').click(function(){
      $('.inputfield').slideToggle();
    });
});

$(document).keyup(function (e) {
    if ($("input.inputnewurl") && (e.keyCode === 13)) {
    //   alert('I told ya there is no Sorry no back end:(')

    }
 });



