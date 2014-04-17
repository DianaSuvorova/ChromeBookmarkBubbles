
///some global vars
var navigation_items = [];
var node_items=[];


// these are bookmark items
//node items will be an arry of items
//with url and tags
//url
//tags
//
//var node_items=JSON.parse('[{"url":"images/tn_123.jpeg","url_full":"images/123.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_layers.jpeg","url_full":"images/layers.jpeg","subject":"Philosophy","media":"picture","source":""},{"url":"images/tn_crocodile.jpeg","url_full":"images/crocodile.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_perceivedProbability.jpeg","url_full":"images/perceivedProbability.jpeg","subject":"Psychology","media":"picture","source":""},{"url":"images/tn_worldWithoutUs.jpeg","url_full":"images/worldWithoutUs.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_historyOfArt.jpeg","url_full":"images/historyOfArt.jpeg","subject":"Art","media":"picture","source":""},{"url":"images/tn_TimeOfDay.jpeg","url_full":"images/TimeOfDay.jpeg","subject":"Art","media":"D3","source":"http://bl.ocks.org/clayzermk1/raw/9142407/"}]');


console.log(node_items);




$(document).ready(function(){  

chrome.bookmarks.getTree(function(itemTree){
    itemTree.forEach(function(item){
        processNode(item,'');
    });

    renderUI();
});

})

//Ithink it's ugly
  var local_tags='';

function processNode(node,tags) {



    // recursively process child nodes
    //all it's parents folder names
    if(node.children) {
        node.children.forEach(function(child) { 
           node.title ? local_tags=local_tags+" "+ node.title.replace(/ /g,'').toUpperCase() : local_tags ;
          processNode(child,local_tags);

        });
    }


    // navigation
    if(!node.url) { 
      navigation_items.push(node.title.toUpperCase()); }

    if(node.url) { 
     console.log(node)
      node_items.push({
        url :node.url,
        title: node.title,
        tags: tags
      });
    }
    local_tags='';

}


//console.log(bookmark_items);




function renderUI(){



//only last tag
//var images=JSON.parse('[{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdae4b0aec88e8bd2d4/1394925530896/tn_123.jpeg?format=1000w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd7e4b0aec88e8bd2c9/1394925648275/123.jpeg?format=1000w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdae4b0aec88e8bd2d9/1394925530891/tn_layers.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd9e4b026a30a706f8c/1394925531554/layers.jpeg?format=750w","subject":"Philosophy","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdbe4b0aec88e8bd2dd/1394925532407/worldWithoutUs.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdbe4b0aec88e8bd2dd/1394925532407/worldWithoutUs.jpeg?format=750w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdbe4b07c72ce3c15fc/1394925531956/tn_perceivedProbability.jpeg?format=1000w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd9e4b0aec88e8bd2d0/1394925529958/perceivedProbability.jpeg?format=1000w","subject":"Psychology","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdae4b0aec88e8bd2d6/1394925530950/tn_historyOfArt.jpeg?format=500w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd9e4b0aec88e8bd2ce/1394925530153/historyOfArt.jpeg?format=500w","subject":"Art","media":"picture","source":""},{"url":"http://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd7e4b026a30a706f8a/1394925663047/Crocodile.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfd7e4b026a30a706f8a/1394925663047/Crocodile.jpeg?format=750w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdae4b0aec88e8bd2d2/1394925530899/TimeOfDay.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5324dfdbe4b0aec88e8bd2db/1394925531900/tn_TimeOfDay.jpeg?format=750w","subject":"Art","media":"D3","source":"http://bl.ocks.org/clayzermk1/raw/9142407/"},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/532682d2e4b011eeaa055c40/1395032787112/MissingScarf.png?format=1000w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/532682d2e4b011eeaa055c40/1395032787112/MissingScarf.png?format=1000w","subject":"Art","media":"movie","source":"http://themissingscarf.com/"},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/53268449e4b0aec88e8cf9bc/1395033162096/Dunning-KrugerEffect.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/53268449e4b0aec88e8cf9bc/1395033162096/Dunning-KrugerEffect.jpeg?format=750w","subject":"Psychology","media":"picture","source":"http://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect"},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5326859ee4b07a87f2c62826/1395033502770/CitiesforYouth.jpeg?format=300w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5326859ee4b07a87f2c62826/1395033502770/CitiesforYouth.jpeg?format=300w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/532686dce4b074f7f8859fd3/1395034145767/CalendarOfMeaningfulDates.jpeg?format=500w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/532686dce4b074f7f8859fd3/1395034145767/CalendarOfMeaningfulDates.jpeg?format=500w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/53268749e4b0da5800e6fdc6/1395034142209/RetroIceCream.jpeg?format=500w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/53268749e4b0da5800e6fdc6/1395034142209/RetroIceCream.jpeg?format=500w","subject":"Art","media":"picture","source":""},{"url":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5326878de4b0fb8ebe74bc5a/1395034018802/ProgLanguagePopularity.jpeg?format=750w","url_full":"https://static.squarespace.com/static/52992023e4b0ef97324bbbf6/5324dface4b028bc910c33c6/5326878de4b0fb8ebe74bc5a/1395034018802/ProgLanguagePopularity.jpeg?format=750w","subject":"AI","media":"picture","source":"http://www.dataists.com/2010/12/ranking-the-popularity-of-programming-langauges/"}]');


var root = JSON.parse('{"id":"1","name":"Structure","children":[{"id":"2","name":"Media","children":[{"id":"3","name":"static","children":[{"id":"4","name":"text","size":"10"},{"id":"5","name":"picture","size":"10"}]},{"id":"6","name":"interaction","children":[{"id":"7","name":"D3","size":"10"}]},{"id":"8","name":"film","children":[{"id":"9","name":"animation","size":"10"},{"id":"10","name":"movie","size":"10"}]}]},{"id":"11","name":"Subject","children":[{"id":"12","name":"Neurosicence","children":[{"id":"13","name":"BIO","size":"10"},{"id":"14","name":"AI","size":"10"}]},{"id":"15","name":"Psychology","size":"10"},{"id":"16","name":"Philosophy","size":"10"},{"id":"17","name":"Art","size":"10"}]}]}');

//console.log(images);
// var media_categories=["picture","animation","video","text","D3"];
// var subject_categories=["philosophy","art","psychology","Neurosicence"];


// for (var i=0;i<media_categories.length;i++ ){
//   media_categories[i]=media_categories[i].toUpperCase();
// } 

// for (var i=0;i<subject_categories.length;i++ ){
//   subject_categories[i]=subject_categories[i].toUpperCase();
// } 

    var color = d3.scale.category20c();

    //navigation part


    var bookmark = d3.select("#bookmark");
    console.log(bookmark);

    var bookmark_width = Math.floor((bookmark.style("width").slice(0, -2)/navigation_items.length - 2*2)/bookmark.style("width").slice(0, -2)*100)+'%';

    var bookmarks = bookmark.selectAll(".categories").data(navigation_items)
                  .enter().append("div")
                  .attr("class","categories")
                  .attr("id",function(d){return d.replace(/ /g,'')})
                  .style("width", bookmark_width)
                  .on("click", categories_clicked)
                  .text(function(d){return d;});

    ///Bubble collision part


    var canvas = d3.select("#canvas");
    // var radius= 18.5; 
    // var big_radius=60;
    // var padding=7.5;   
     var radius= 75; 
     var expanded_radius=240;
     var padding=15;   


    //Get the size from HTML
    var width= canvas.style("width").slice(0, -2);
    var height= canvas.style("height").slice(0, -2);


    var nodes = d3.range(node_items.length).map(function(i) { return { radius:radius+padding/2 , image : node_items[i] }; });
    var  color = d3.scale.category10();


    var bubble = canvas.selectAll(".bubble").data(nodes)
                  .enter().append("div")
                  .attr("class","bubble")
                  .attr("id",function(d, i){ return "bubble-"+i});
                //  .call(node_drag);   


    var bubbleFill = bubble
                  .append("div")
                  .attr("class",function(d, i) { return "bubbleFill "+ d.image.tags})
                  //.style("background-image", function(d, i) { return "url("+d.image.url_full+")"})
                  .style("width",radius+"px")
                  .style("height",radius+"px")
                  .style("background-color",function(d,i){ return color(i)})
                  .on("mouseover", mouseover)
                  .on("mouseout", mouseout)
                  .on("click",function(d) {return (d.image.url=="")? "" : window.open(d.image.url); });
               
    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();


    function mouseover(d, i) {


       force.stop();

       d3.selectAll(".bubbleFill").transition().duration(250).ease("linear")
        .style("opacity", 0.5);

        d3.select("#bubble-"+i).select('.bubbleFill').transition().duration(250).ease("linear")
        .style('width', expanded_radius+'px')
        .style('height', expanded_radius+'px')
        .attr("class",function(){return $(this).attr("class")+" highlighted"})
        .style("z-index",1); 

         d3.select("#bubble-"+i).append('div')
                  .attr('class','tooltip')
                  .transition().delay(250).duration(25).ease("linear")
                  .style("top",expanded_radius/4+3+"px")
                  .style("left",3+"px")
                  .style("width",0)           
                  .style("width","240px")
                  .style("opacity",1)
                  .style("z-index",2); 

        d3.select("#bubble-"+i).select('div.tooltip')
                  .append("span")
                  .transition().delay(250).duration(25).ease("linear")
                  .text(function(d, i) { return ((d.image.url =="" ) ? "no link " : d.image.url )
                                               + d.image.tags});
         

    }

    function mouseout(d, i) {
      //force.gravity(0.05);


      d3.selectAll(".bubbleFill").transition().duration(50).ease("linear")
      .style("opacity", 1)
      .style('width', radius+'px')
      .style('height', radius+'px')
      .attr("class",function(){return $(this).attr("class").replace(" highlighted", "")})
   //   .style('border-color','rgb(179,179,179)')
      .style("z-index",0); 

       d3.selectAll("#bubble-"+i).select('.tooltip').remove();

      force.resume();

    }


    function categories_clicked(d,i){

      if (d3.select("#"+d.replace(/ /g,'')).attr("class") == "categories"){
        
        d3.select("#"+d.replace(/ /g,'')).attr("class","categories selected");
        bubble.selectAll("."+d.replace(/ /g,'')).attr("class",function(){return $(this).attr("class")+" highlighted"});
      }

      else{

        d3.select("#"+d.replace(/ /g,'')).attr("class","categories");
          bubble.selectAll("."+d.replace(/ /g,'')).attr("class",function(){return $(this).attr("class").replace(" highlighted", "")});

        }
    }


     function tick() {

          var q = d3.geom.quadtree(nodes),
              i = 0,
              n = nodes.length;

          while (++i < n) q.visit(collide(nodes[i]));

          canvas.selectAll(".bubble")
              .style("left", function(d) { return d.x+ "px"; })
              .style("top", function(d) { return d.y+"px"; });

    }

    function collide(node) {
      var r = node.radius+padding*2,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
     }

}

//end render ui
//Drag-and-drop nodes. Maybe not needed.

  var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x = Math.max(d.radius, Math.min(width - d.radius, d3.event.x));
        d.y = Math.max(d.radius, Math.min(height - d.radius, d3.event.y)); 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
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



