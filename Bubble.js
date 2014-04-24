
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 


function getUICategoryCenters(categoriesUIElements,width,height ){
    var centers=[];
    categoriesUIElements.each(function(){centers.push({x:(this.offsetLeft),y: height/2})});
    return centers;
}


var Model = BookmarkDataSingleton.getInstance();


$(document).ready(function(){ 
  Model.getUIData(renderUI );

})


function renderUI(){


    var radius= 75; 
    var expanded_radius=240;
    var padding=10;   
    

    var color_set = d3.scale.category10();
    var canvas = d3.select("#canvas");
    var width= canvas.style("width").slice(0, -2);
    var height= canvas.style("height").slice(0, -2);


    var categories = Model.getCategories();
    var nodes = Model.getNodes();
  
    var bookmark = d3.select("#bookmark");
    var cat_width_pct = Math.floor((bookmark.style("width").slice(0, -2)/categories.length - 2*2)/bookmark.style("width").slice(0, -2)*100)+'%';

  
  //---------Main UI Object rendering----------------------------------------------------- 

    var bookmarks = bookmark.selectAll(".categories").data(categories)
                  .enter().append("div")
                  .attr("class","categories")
                  .attr("id",function(d,i){return "category-"+i})
                  .style("width", function(d,i){return cat_width_pct})
                  .on("mouseover",function(d,i){d3.select(this).style('color',color_set(i))})
                  // // .on("mouseout",function(d){ if  !(d.ui_selected)
                  //  d3.select(this).style('color','rgb(152,151,150)')})
                  .on("click", categories_clicked)
                  .text(function(d){return d.item.title;});

    var centers = getUICategoryCenters(bookmarks,width,height );
              

    var bubble = canvas.selectAll("div").data(nodes)
                    .enter().append("div")
                    .attr("class","bubble")
                    .attr("id",function(d, i){ return "bubble-"+i});
                    //.call(drag);
                  

    var bubbleFill = bubble.append("div")
                .attr("id",function(d, i){ return "bubbleFill-"+i})
                .attr("class",function(d, i) { return "bubbleFill category-"+ d.cat_id})
                .style("background-image", function(d, i) {return 'url(http://api.thumbalizr.com/?url='+d.item.url+'&width=250)'})
                  //'url(http://api.page2images.com/directlink?p2i_url='+d.image.url+'&p2i_key=c022422933354341&&p2i_size=300x300)'})
                  //http://immediatenet.com/t/m?Size=1024x768&URL=http://immediatenet.com/"/
                  //{ return "url("+d.image.url_full+")"})
                .style("width",radius+"px")
                .style("height",radius+"px")
                .attr("draggable","true")
                //.style("background-color",function(d,i){ return color(i)})
                // .on("contextmenu",node_drag)
                //.on("mouseover", bubble_mouseover)
                //.on("mouseout", bubble_mouseout)
                
                .on("click",function(d) {
                //either click or drag
                   if (d3.event.defaultPrevented) return;
                  return (d.item.url=="")? "" : window.open(d.item.url); 
                })
            ;
               
    //--------End Main UI Object rendering--------------------------------------------------        

    //--------D3 Force Layout---------------------------------------------------------------  
    var force = d3.layout.force()
          .nodes(nodes)
          .size([width, height])
          .charge(-Math.pow(radius/2+padding,1)*20 )
          .gravity(0)
          //.friction(0.87)
          .on("tick", tick)
          .start();

      function tick(e) {
          var k = 0.2 * e.alpha;
             nodes.forEach(function(o, i) {
                o.y += (centers[o.default_center].y- o.y) * k;
                o.x += (centers[o.default_center].x - o.x) * k;
              });

            bubble
              //    .style("left", function(d,i) {  if (d.x < 0) d.x=-d.x; return  d.x +"px";})
              //    .style("top", function(d,i) {  if (d.y < 0) d.y=-d.y;return d.y + "px"; });

                  .style("left", function(d,i) { return  d.x +"px";})
                  .style("top", function(d,i) { return d.y + "px"; });    
      }

    //--------End D3 Force Layout----------------------------------------------------------------  
    //--------bubble Interaction Functions: Mouseover,MouseOut ------------------------------- 
      function bubble_mouseover(d, i) {



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
                  .style("top",expanded_radius/4+3+"px")
                  .style("left",3+"px")       
                  .style("opacity",0.7)
                  .style("z-index",2) 
                .append("span")
                  .text(function(d, i) { return ((d.image.url =="" ) ? "no link " : d.image.title )});
            });       

          d3.selectAll("#"+d.image.tags).style('color',d.color);

      }

    function bubble_mouseout(d, i) {
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
   //--------End Category Interaction Functions: Clicked -------------------------------   
 



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

   //--------End UI Interaction Functions: Categorize,Reset ------------------------------- 

   //--------Editting Functionality: Drag and Drop to edit ------------------------------- 



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
 
 //--------Editting Functionality: End Drag and Drop to edit ------------------------------- 


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



