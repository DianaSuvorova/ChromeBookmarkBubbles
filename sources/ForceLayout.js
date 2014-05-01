function ForceLayout(element, centers) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var height = canvas.style("height").slice(0, -2);


	this.initializeLayout = function(initNodes) {
		for (var i = 0; i < initNodes.length; i++) {
			nodes.push(initNodes[i]);
		}
		update();
	}


	this.addNode = function(node) {
		nodes.push(node);
		update();
	}

	var force = d3.layout.force()
		.size([width, height])
		.charge(-Math.pow(radius / 2 + padding, 1) * 20)
		.gravity(0)
		.friction(0.87);

	var nodes = force.nodes();

	var update = function() {


		  var node_drag = force.drag()
          .on("dragstart", dragStart)
   	       .on("drag", dragMove)
          .on("dragend", dragEnd);

         function dragStart(d){
  			d3.select(this).classed("fixed", d.fixed = true);

         };

		function dragMove(d, i) {

		var cat ;

			d3.selectAll("div.categories").each(function(cat_d, cat_i) {

				cat = "#category-"+cat_i;

					if (overlaps("#bubble-" + i, cat)) {

						d3.selectAll(cat).attr("class", function(d) {
							d.ui_dragover = true;
							return d.get_class();
						});
					} else {

						d3.selectAll(cat).attr("class", function(d) {
							d.ui_dragover = false;
							return d.get_class();
						});
					}
				}

			);
			d.px += d3.event.dx;
			d.py += d3.event.dy;
			d.x += d3.event.dx;
			d.y += d3.event.dy;
			tick(); // this is the key to make it work together with updating both px,py,x,y on d !
		}

		function dragEnd(d, i) {
			
			var cat;
			var node_id=d.item.id

			d3.selectAll("div.categories").each(function(cat_d, cat_i) {

					cat = "#category-" + i;

					console.log(cat_d);
					parent_id=cat_d.item.id;

				    Model.updateNodeAssigntoCategory(node_id, parent_id, function() {
				         console.log("in the model")
				    });
				}

			);

			d3.select(this).classed("fixed", d.fixed = true);
		}


		var node = canvas.selectAll("div.bubble").data(nodes);

		var nodeEnter = node.enter().append("div")
			.attr("class", "bubble")
			.attr("id", function(d, i) {
				return "bubble-" + i
			})
			.call(node_drag);

		nodeEnter.append("div")
			.attr("id", function(d, i) {
				return "bubbleFill-" + i
			})
			.attr("class", function(d) {return d.get_class()})
			.style("background-image", function(d, i) {
				return 'url(http://api.thumbalizr.com/?url=' + d.item.url + '&width=250)'
			})
			.style("width", radius + "px")
			.style("height", radius + "px")
			.attr("draggable", "true")
			.on("click", showDetails)
			.on("mouseout", hideDetails)
			.on("dblclick", gotoLink);

		node.exit().remove();

		force.on("tick",tick);

		 function tick() {
			var k = 0.2 * force.alpha();
			nodes.forEach(function(o, i) {
				o.y += (this.centers[o.center].y - o.y) * k;

				o.x += (this.centers[o.center].x - o.x) * k;
			});

			node
				.style("left", function(d, i) {
					//if (d.x < 0) d.x = -d.x;
					return d.x + "px";
				})
				.style("top", function(d, i) {
					//if (d.y < 0) d.y = -d.y;
					return d.y + "px";
				});

		};

		force.start();


	}

		function showDetails(d, i) {

			d3.event.preventDefault();

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


		function hideDetails(d, i) {
			var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");


			var category = d3.selectAll("#" + curr_class);

			d3.selectAll(".bubbleFill").transition().duration(50).ease("linear")
				.style("opacity", 1)
				.style('width', radius + 'px')
				.style('height', radius + 'px')
				.style("z-index", 0);

			d3.selectAll("#bubble-" + i).select('.tooltip').remove();
			d3.selectAll("#bubble-" + i).selectAll(".bubbleFill").style("border-color", function() {
				return (category.attr("class") == 'categories') ? 'rgb(152,151,150)' : d.color;
			});
			category.style('color', function() {
				return (d3.select(this).attr("class") == 'categories') ? 'rgb(152,151,150)' : d.color;
			});
		}

		function gotoLink(d, i) {
			if (d3.event.defaultPrevented) return;
			return (d.item.url == "") ? "" : window.open(d.item.url);


		}

		
}