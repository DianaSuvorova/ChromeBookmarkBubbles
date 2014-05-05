function ForceLayout(element, color_set) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var height = canvas.style("height").slice(0, -2);



	updateCenters = function() {

		var centers = [];

		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
	//		console.log($(cat).width())
			centers.push({
				x: $(cat).offset().left-$(cat).width()/2,
				y: $(cat).offset().top+$(cat).height()/4 
			})
		})


		return {
			default_center: {
				y: height / 2,
				x: width / 2
			},
			cat_centers: centers
		};
	}

	this.reset = function() {

		nodes.forEach(function(o, i) {
			o.center = -1;
		})
		force.resume();
	}

	this.categorize = function() {
		nodes.forEach(function(o, i) {

			o.center = o.cat_id;
		})
		force.resume();
	}


	this.changeBubbleSize = function(radius) {
		d3.selectAll(".bubbleFill")
			.transition().duration(750)
			.style("width", radius + "px")
			.style("height", radius + "px");

		force.charge(-Math.pow(radius / 2 + padding, 1) * 20);
		update();
	}

	this.initializeLayout = function(initNodes) {
		for (var i = 0; i < initNodes.length; i++) {
			nodes.push(initNodes[i]);
		}
		update();
	}


	this.addNode = function(node, radius) {
		node.x = 0;
		node.y = 0;
		nodes.push(node);
		update();
	}


	var force = d3.layout.force()
		.size([width, height])
		.charge(-Math.pow(radius / 2 + padding, 1) *20)
		.gravity(0)
		.friction(0.87);

	var nodes = force.nodes();

	var update = function(raduis) {

		var node_drag = force.drag()
			.on("dragstart", dragStart)
			.on("drag", dragMove)
			.on("dragend", dragEnd);


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
			.attr("class", function(d, i) {
				return d.get_class()
			})
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

		force.on("tick", tick);

		function tick() {

			//maybe wrong place to update centers
			var centers = updateCenters();

			var k = 0.15* force.alpha();

			nodes.forEach(function(o, i) {
				if (o.center == -1) {
					o.y += (centers.default_center.y - o.y) * k;

					o.x += (centers.default_center.x - o.x) * k;

				} else {
					o.y += (centers.cat_centers[o.center].y - o.y) * k;
					o.x += (centers.cat_centers[o.center].x - o.x) * k;
				}
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



		function hideDetails(d, i) {

			//this  doesn't fix first circle tick
			d3.select(this).classed("fixed", d.fixed = false);


			var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");

			var category = d3.selectAll("#" + curr_class);

			d3.selectAll(".bubbleFill").transition().duration(50).ease("linear")
				.style("opacity", 1)
				.style('top', (expanded_radius - radius) / 4 + 'px')
				.style('left', (expanded_radius - radius) / 4 + 'px')
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


		function showDetails(d, i) {

			d3.event.preventDefault();

			//this doesn't fix  first circle tick
			d3.select(this).classed("fixed", d.fixed = true);

			var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");

			d3.selectAll(".bubbleFill").style("opacity", 0.5);

			d3.selectAll("#bubble-" + i).select('.tooltip').remove();


			d3.select(this).transition().duration(250).ease("circle")
				.style('width', expanded_radius + 'px')
				.style('height', expanded_radius + 'px')
				.style('top', -(expanded_radius - radius) / 4 + 'px')
				.style('left', -(expanded_radius - radius) / 4 + 'px')
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



		function gotoLink(d, i) {

			d3.selectAll(".bubbleFill").style("opacity", 0.5);

			console.log(d);

			if (d3.event.defaultPrevented) return;
			return (d.item.url == "") ? "" : window.open(d.item.url);


		}

		function dragStart(d) {
			d3.event.sourceEvent.stopPropagation();
			d3.select(this).classed("fixed", d.fixed = true);

		};

	function dragMove(d, i) {

		var cat;

		d3.selectAll("div.categories").each(function(cat_d, cat_i) {

				cat = "#category-" + cat_i;

				if (overlaps("#bubbleFill-" + i, cat)) {

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
		//			tick(); // this is the key to make it work together with updating both px,py,x,y on d !
	}

	function dragEnd(d, i) {

		var cat;
		var node_id = d.item.id

		d3.selectAll("div.categories").each(function(cat_d, cat_i) {
			cat = "#category-" + cat_i;

			if (overlaps("#bubbleFill-" + i, cat)) {
				//	cat = "#category-" + i;
				parent_id = cat_d.item.id;


				// console.log("parent_id: " + parent_id);
				// console.log("cat: " + cat);

				d3.selectAll(cat).attr("class", function(d) {
					d.ui_dragover = false;
					return d.get_class();
				});



				Model.updateNodeAssigntoCategory(node_id, parent_id, function(updatednode) {

					d3.select("#bubbleFill-" + i).attr("class", function(d) {
						d.center = d.cat_id = updatednode.cat_id;
						d.item = updatednode.item;

						return d.get_class()
					});

					if (cat_d.ui_click) {
						d3.selectAll("#bubbleFill-" + i).style("border-color", color_set(cat_i));
					}

					if (!cat_d.ui_click) {
						d3.selectAll("#bubbleFill-" + i).style("border-color", "rgb(179,179,179)");
					}

					update();

				});
			}


		});

		d3.select(this).classed("fixed", d.fixed = false);


	}

}