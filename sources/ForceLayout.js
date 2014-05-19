function ForceLayout(element) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var height = canvas.style("height").slice(0, -2);
	var viscenters = [];


	updateviscenters = function() {
		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
			viscenters.push({
				x: $(cat).offset().left + $(cat).width() / 2,
				y: $(cat).offset().top + $(cat).height() / 2
			});
			console.log(viscenters);
		})

	}


	updateCenters = function() {

		var centers = [];

		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
			//		console.log($(cat).width())

			centers[$(cat).attr('id') + 'x'] = $(cat).offset().left + $(cat).width() / 2;
			centers[$(cat).attr('id') + 'y'] = $(cat).offset().top + $(cat).height() / 2

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
		force.resume();
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


	this.highlightNodes = function(nodes) {


		d3.selectAll(".bubbleFill")
			.each(function(d) {
				d.ui_dim = true;
			})
			.style("opacity", "0.1");

		nodes.forEach(function(node) {
			d3.selectAll("#bubbleFill-" + node.id)
				.each(function(d) {
					d.ui_dim = false;
					d.ui_highlight = true;
				})
				.style("opacity", "1");
		})
	}

	this.highlightAllNodes = function() {
		d3.selectAll(".bubbleFill")
			.each(function(d) {
				d.ui_dim = false;
			})
			.style("opacity", "1");

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
				return "bubble-" + d.item.id
			})
			.call(node_drag);

		nodeEnter.append("div")
			.attr("id", function(d, i) {
				return "bubbleFill-" + d.item.id
			})
			.attr("class", function(d, i) {
				return d.get_class()
			})
			.style("background-image", function(d, i) {
				return 'url(http://api.thumbalizr.com/?url=' + d.item.url + '&width=250)'
			})
			.style("border-color", function(d) {
				return color_set["category-" + d.cat_id]
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


			node.each(cluster(10 * force.alpha() * force.alpha(), centers))
				.each(collide(0.01))
				.style("left", function(d, i) {
					console.log
					return d.x + "px";
				})
				.style("top", function(d, i) {
					return d.y + "px";
				});

		}


		// Move d to be adjacent to the cluster node.
		function cluster(alpha, centers) {
			return function(d) {

				var clusterX = centers.cat_centers[d.center + "x"];
				var clusterY = centers.cat_centers[d.center + "y"];


				if (d.center == -1) {
					clusterY = centers.default_center.y;
					clusterX = centers.default_center.x;
				}


				k = 10 * alpha;

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
							r = radius + quad.point.radius + padding; //+ (d.cluster === quad.point.cluster ? padding : clusterPadding);
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

		function hideDetails(d) {

			if (d.ui_expandwDetails) {


				d.ui_expandwDetails = false;

				var curr_class = d3.select(this).attr("class").replace("bubbleFill ", "");

				var category = d3.selectAll("#" + curr_class);

				d3.select(this).transition().duration(50)
					.style('top', "auto")
					.style('left', "auto")
				//					.style("opacity", 1)
				.style('width', radius + 'px')
					.style('height', radius + 'px')
					.style("z-index", 0);

				d3.selectAll("#bubble-" + d.item.id).select('.tooltip').remove();

				//d3.selectAll(".bubbleFill").style("opacity", 1);

				if (d.ui_highlight) {

					d3.selectAll("#bubble-" + d.item.id).selectAll(".bubbleFill").style("border-color", color_set[d.center]);
				} else {

					d3.selectAll("#bubble-" + d.item.id).selectAll(".bubbleFill").style("border-color", "");

				}


				if (d.ui_dim) {
					console.log(d)
					d3.select(this).style("opacity", 0.1);
				}
			}
		}

		function showDetails(d, i) {


			if (d3.event.defaultPrevented) return;

				d.ui_expandwDetails = true;

				d3.selectAll("#bubble-" + d.item.id).select('.tooltip').remove();


				d3.select(this).transition().duration(50)
					.style('top', -(expanded_radius - radius) / 2 + "px")
					.style('left', -(expanded_radius - radius) / 2 + "px")
					.style('width', expanded_radius + 'px')
					.style('height', expanded_radius + 'px')
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


			if (d3.event.defaultPrevented) return;
			return (d.item.url == "") ? "" : window.open(d.item.url);


		}

		function dragStart(d) {


			d3.event.sourceEvent.stopPropagation();
			d3.select(this).classed("fixed", d.fixed = true);

		};

	function dragMove(d, i) {

		d.ui_move= true;

		var cat;

		d3.selectAll("div.categories").each(function(cat_d, cat_i) {

				cat = "#category-" + cat_d.item.id;

				//	console.log(cat);

				if (overlaps("#bubbleFill-" + d.item.id, cat)) {

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

		force.tick();
	}

	function dragEnd(d, i) {


		if (!d.ui_move) return;

				d.ui_move= false;

		var cat;
		var node_id = d.item.id

		d3.selectAll("div.categories").each(function(cat_d, cat_i) {
			cat = "#category-" + cat_d.item.id;
			//console.log(cat)

			if (overlaps("#bubbleFill-" + d.item.id, cat)) {
				//	cat = "#category-" + i;
				parent_id = cat_d.item.id;


				// console.log("parent_id: " + parent_id);
				// console.log("cat: " + cat);

				d3.selectAll(cat).attr("class", function(d) {
					d.ui_dragover = false;
					return d.get_class();
				});



				Model.updateNodeAssigntoCategory(node_id, parent_id, function(updatednode) {

					d3.select("#bubbleFill-" + d.item.id).attr("class", function(d) {
						d.center = updatednode.center;
						d.cat_id = updatednode.cat_id;
						d.item = updatednode.item;

						return d.get_class()
					});

					if (cat_d.ui_highlight) {
						d3.selectAll("#bubbleFill-" + d.item.id).style("border-color", color_set[d.center]);
					}

					if (!cat_d.ui_highlight) {
						d3.selectAll("#bubbleFill-" + d.item.id).style("border-color", "rgb(179,179,179)");
					}

					update();

				});
			}


		});

		d3.select(this).classed("fixed", d.fixed = false);


	}

}