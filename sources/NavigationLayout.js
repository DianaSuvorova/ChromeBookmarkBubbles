function NavigationLayout(element) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var nodes = [];

	this.initializeLayout = function(initNodes) {
		for (var i = 0; i < initNodes.length; i++) {
			nodes.push(initNodes[i]);
		}
		update();
	}

	this.addNode = function(node) {
		nodes.unshift(node);
		update();
		bubbleForceLayout.categorize();

	}



	function mouseover(d, i) {

		d.ui_mouseover = true;
		if (d.ui_click == false) {
			d3.select(this).style('color', color_set["category-" + d.item.id]);
		}

	}

	function mouseout(d, i) {
		d.ui_mouseover = false;
		if (d.ui_click == false) {
			d3.select(this).style('color', 'rgb(179,179,179)');
		}

		d3.select(this.parent).selectAll("span").remove();

	}


	function clicked(d, i) {

		var cur_class = d3.select(this).attr("class");

		if (!d.ui_highlight) {
			d.ui_highlight = true;
			d3.select(this).attr("class", function(d, i) {
				return d.get_class()
			})
				.style("color", color_set["category-" + d.item.id]);
//				.style("border-color", color_set["category-" + d.item.id]);

			d3.selectAll(".category-" + d.item.id)
			.each(function(d) {d.ui_highlight = true;})
			.style("border-color", color_set["category-" + d.item.id]);



		} else {
			d.ui_highlight = false;
			d3.select(this).attr("class", function(d, i) {
				return d.get_class()
			})
				.style("color", "rgb(152,151,150)")
				.style("border-color", "");
			//.style();

			d3.selectAll(".category-" + d.item.id)
			.each(function(d) {d.ui_highlight = false;})
			.style("border-color", "rgb(179,179,179)");



		}
	}

	function showOptions(d, i) {
		d3.select(this).selectAll("span").style("visibility", "visible");
	}

	function hideOptions(d, i) {
		d3.select(this).selectAll("span").style("visibility", "hidden");

	}

	function findNodeIndexForCategory(cat_id) {
		for (var i in nodes) {
			if (nodes[i].item.id === cat_id) return i
		};
	}


	function hideCategory(d, i) {

		nodes.splice(findNodeIndexForCategory(d.item.id), 1);
		bubbleForceLayout.removeNodesForCategory(d.item.id);
		update();


	}


	function showDialog(d, i) {
		$("#dialog").text("Are you sure you want to delete " + d.item.title + " folder and everything in it?");
		$("#dialog").dialog({
			modal: true,
			resizable: false,
			buttons: {
				"Yeap": function() {
					d3.selectAll(".category-" + d.item.id).each(function(d, i) {
						Model.deleteNode(d.item.id);
					})
					Model.deleteNode(d.item.id);
					hideCategory(d, i);

					$(this).dialog("close");
				},
				"Wait a  sec": function() {
					$(this).dialog("close");
				}
			}
		});
	}


	function emptyCategory(d, i) {

		showDialog(d, i);
	}


	// var drag = d3.behavior.drag()
	// 	.origin(function(d) {
	// 		return d;
	// 	})
	// 	.on("drag", dragmove);


	// function dragmove(d, i) {
	// 	console.log(this);

	// 	d3.selectAll("div.categories").each(function(cat_d, cat_i) {

	// 			cat = "#category-" + cat_d.item.id;

	// 			if (overlaps("#category-" + i, cat)) {
	// 				console.log("overlaps");

	// 			}
	// 		});
	// 	}



	function addNewURL(url,parent_id) {
	  Model.createNewBookmarkinFolder(url,parent_id ,function(newnode) {
	    bubbleForceLayout.addNode(newnode)
	  });
	}

	var update = function() {


		var node = canvas.selectAll("div.cat_wrapper").data(nodes, function(d) {
			return d.item.id
		});




		var nodeEnter = node.enter().insert("div")
			.attr("class", "cat_wrapper")
			.attr("id", function(d, i) {
				return "cat_wrapper-" + d.item.id
			})
			.on("mouseover", showOptions)
			.on("mouseout", hideOptions);
		//.call(drag);



		nodeEnter.append("span").attr('class', 'option delete')
			.on("click", emptyCategory);

		nodeEnter.append("span").attr('class', 'option hide')
			.on("click", hideCategory);

		nodeEnter.append("span").attr('class', 'option add')
			.attr("id", function(d, i) {
				return "add-" + d.item.id
			}).on("click", function(d) {
				canvas.select("#inputurl-" + d.item.id)
					.style("visibility", function (){return  (canvas.select("#inputurl-" + d.item.id).style("visibility") =="hidden") ? "visible" :""})
			});

		nodeEnter.append("div")
			.attr("class", "inputurl")
			.attr("id", function(d) {
				return "inputurl-" + d.item.id
			})
			.append("input")
			.attr("class", "inputnewurl")
			.attr("id", function(d) {
				return "inputnewurl-" + d.item.id
			})
			.on("click", "")
			.on("keyup", function(d) {
				if (d3.event.keyCode === 13) {
					addNewURL($("#inputnewurl-"+d.item.id).val(),d.item.id);
					
					$("input.inputnewurl").val("");
					canvas.select("#inputurl-" + d.item.id)
					.style("visibility", "");

				}
			})
			.attr("name", "URL")




		nodeEnter.append("div")
			.attr("class", "categories")
			.attr("id", function(d, i) {
				return "category-" + d.item.id
			})
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", clicked)
			.style("color", function(d) {
				return color_set["category-" + d.item.id]})
						.append("div").attr("class", "ontop")
			.text(function(d) {
				return d.item.title.toUpperCase();
			});


		node.exit().remove();

	}



}