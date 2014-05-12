function ForceLayout(element, color_set) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var height = canvas.style("height").slice(0, -2);
	var viscenters = [];


	updateviscenters = function() {
		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
			viscenters.push({
				x: $(cat).offset().left+ $(cat).width() / 2 ,
				y: $(cat).offset().top + $(cat).height()/2
			});
			console.log(viscenters);
		})

	}


	updateCenters = function() {

		var centers = [];

		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
			//		console.log($(cat).width())

			centers[$(cat).attr('id') + 'x'] = $(cat).offset().left+ $(cat).width() / 2;
			centers[$(cat).attr('id') + 'y'] = $(cat).offset().top +$(cat).height()/2

		})


		return {
			default_center: {
				y: height / 2,
				x: width / 2
			},
			cat_centers: centers
		};
	}

	findNodeIndexForCategory = function(cat_id) {
		for (var i in nodes) {
			if (nodes[i].cat_id === cat_id) return i
		};
	}

	function deleteNodesForCategory(cat_id) {
		while (findNodeIndexForCategory(cat_id)) {
			nodes.splice(findNodeIndexForCategory(cat_id), 1);
		}
	}


	function updateCategoriesForNodes(deleted_cat_id) {
		for (var i in nodes) {
			if (nodes[i].cat_id > deleted_cat_id)
				nodes[i].cat_id = nodes[i].center = nodes[i].cat_id - 1;
		}
	}

	this.removeNodesForCategory = function(cat_id) {
		//force.stop();
		deleteNodesForCategory(cat_id);
		//		d3.selectAll(".category-"+cat_id).remove();
		update();

	}

	this.reset = function() {

		nodes.forEach(function(o, i) {
			o.center = -1;
		})
		//force.resume();
	}

	this.categorize = function() {
		nodes.forEach(function(o, i) {

			o.center = "category-" + o.cat_id;
		})
		force.resume();
	}


	this.changeBubbleSize = function(radius) {
		d3.selectAll(".bubbleFill")
			.transition().duration(750)
			.style("width", radius + "px")
			.style("height", radius + "px");
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
		.charge(0)
		.gravity(0)
		.friction(0.87);

	var nodes = force.nodes();

	var update = function(raduis) {

		var node_drag = force.drag()
			.on("dragstart", dragStart)
			.on("drag", dragMove)
			.on("dragend", dragEnd);


		node = canvas.selectAll("div.bubble").data(nodes, function(d) {
			return d.item.id
		});

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


		force.start();


	}


function tick() {
			var centers = updateCenters();


			node.each(cluster(10 * force.alpha() * force.alpha(),centers))
				.each(collide(0.2))
				.style("left", function(d, i) {
					console.log
					return d.x + "px";
				})
				.style("top", function(d, i) {
					return d.y + "px";
				});

		}

		
		// Move d to be adjacent to the cluster node.
		function cluster(alpha,centers) {
			return function(d) {
	
				var clusterX = centers.cat_centers[d.center + "x"];
				var clusterY = centers.cat_centers[d.center + "y"];


			if (d.center == -1) {
				clusterY = centers.default_center.y; 
				clusterX = centers.default_center.x; 
			}


				k = 10*alpha;

				var x = d.x - clusterX,
					y = d.y - clusterY,
					l = Math.sqrt(x * x + y * y),
					r = radius;
				if (l != r) {
					l = (l - r) / l * alpha * k;
					d.x -= x *= l;
					d.y -= y *= l;
				}
			};
		}


		// Resolves collisions between d and all other circles.
		function collide(alpha) {
			var quadtree = d3.geom.quadtree(nodes);


			return function(d) {
				var r = radius + Math.max(padding, clusterPadding),
					nx1 = d.x - r,
					nx2 = d.x + r,
					ny1 = d.y - r,
					ny2 = d.y + r;
				quadtree.visit(function(quad, x1, y1, x2, y2) {
					if (quad.point && (quad.point !== d)) {
						var x = d.x - quad.point.x,
							y = d.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = radius + quad.point.radius +padding;//+ (d.cluster === quad.point.cluster ? padding : clusterPadding);
						if (l < r) {
							l = (l - r) / l * alpha;
							d.x -= x *= l;
							d.y -= y *= l;
							quad.point.x += x;
							quad.point.y += y;
						}
					}
					return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
				});
			};
		}


		// function tick() {

		// 	//maybe wrong place to update centers
		// 	var centers = updateCenters();

		// 	var k = 0.15 * force.alpha();

		// 	nodes.forEach(function(o, i) {
		// 		if (o.center == -1) {
		// 			o.y += (centers.default_center.y - o.y) * k;

		// 			o.x += (centers.default_center.x - o.x) * k;

		// 		} else {
		// 			o.y += (centers.cat_centers[o.center + "y"] - o.y) * k;
		// 			o.x += (centers.cat_centers[o.center + "x"] - o.x) * k;
		// 		}
		// 	});

		// 	node
		// 		.style("left", function(d, i) {
		// 			//if (d.x < 0) d.x = -d.x;
		// 			return d.x + "px";
		// 		})
		// 		.style("top", function(d, i) {
		// 			//if (d.y < 0) d.y = -d.y;
		// 			return d.y + "px";
		// 		});

		// }

		function visualiseCenters() {
			console.log(viscenters)
			canvas.selectAll("div#e").data(viscenters).enter().append("div")
				.attr("id", "e")
				.attr("class", "bubble")
				.style("top", function(d) {
					return d.y + "px"
				})
				.style("left", function(d) {
					return d.x + "px"
				})
				.text("X");

		}

		function hideDetails(d, i) {

			//this  doesn't fix first circle tick
			//	d3.select(this).classed("fixed", d.fixed = false);


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

			if (category.data()[0].ui_click) {

				d3.selectAll("#bubble-" + i).selectAll(".bubbleFill").style("border-color", color_set[d.center]);
			} else {

				d3.selectAll("#bubble-" + i).selectAll(".bubbleFill").style("border-color", "");

			}
		}

		function showDetails(d, i) {

			d3.event.preventDefault();

			//this doesn't fix  first circle tick
			//	d3.select(this).classed("fixed", d.fixed = true);

			// var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");

			d3.selectAll(".bubbleFill").style("opacity", 0.5);

			d3.selectAll("#bubble-" + i).select('.tooltip').remove();


			d3.select(this).transition().duration(250).ease("circle")
				.style('width', expanded_radius + 'px')
				.style('height', expanded_radius + 'px')
				.style('top', -(expanded_radius - radius) / 4 + 'px')
				.style('left', -(expanded_radius - radius) / 4 + 'px')
				.style("border-color", color_set[d.center])
				.style("opacity", 1)
				.style("z-index", 1)
				.each("end", function(d) {

					d3.select(this).append('div')
						.attr('class', 'tooltip')
						.style("background-color", color_set[d.center])
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

			//	d3.selectAll("#" + curr_class).style('color', color_set[d.center]);

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

				cat = "#category-" + cat_d.item.id;

			//	console.log(cat);

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
			cat = "#category-" + cat_d.item.id;
			//console.log(cat)

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
						d.center = updatednode.center;
						d.cat_id = updatednode.cat_id;
						d.item = updatednode.item;

						return d.get_class()
					});

					if (cat_d.ui_click) {
						d3.selectAll("#bubbleFill-" + i).style("border-color", color_set[d.center]);
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