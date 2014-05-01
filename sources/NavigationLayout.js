function NavigationLayout(element, color_set) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var nodes = [];


	this.getNavigationCenters = function(height) {
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

	this.initializeLayout = function(initNodes) {
		for (var i = 0; i < initNodes.length; i++) {
			nodes.push(initNodes[i]);
		}
		update();
	}

	this.addNode=function(node){		
		nodes.push(node);
		update();

	}


	function mouseover(d, i) {

		d.ui_mouseover = true;
		if (d.ui_click == false) {
			d3.select(this).style('color', color_set(i));
		}

	}

	function mouseout(d, i) {
		d.ui_mouseover = false;
		if (d.ui_click == false) {
			d3.select(this).style('color', 'rgb(179,179,179)');
		}
	}


	function clicked(d, i) {

		var cur_class = d3.select(this).attr("class");

		if (!d.ui_click) {
			d.ui_click = true;
			d3.select(this).attr("class", cur_class + ' selected')
				.style("color", color_set(i))
				.style("border-color", color_set(i));

			d3.selectAll(".category-" + i).style("border-color", color_set(i));
		} else {
			d.ui_click = false;
			d3.select(this).attr("class", cur_class.replace(" selected", ""))
				.style("color", "rgb(152,151,150)")
				.style("border-color", "transparent");
			d3.selectAll(".category-" + i).style("border-color", "rgb(179,179,179)");

		}
	}


	var update = function() {
		var node = canvas.selectAll("div.categories").data(nodes);
		var nodeEnter = node.enter().append("div")
			.attr("class", "categories")
			.attr("id", function(d, i) {
				return "category-" + i
			})
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", clicked)
			.text(function(d) {
				return d.item.title.toUpperCase();
			});

		node.style("width", (90 / nodes.length) + '%');

	}



}