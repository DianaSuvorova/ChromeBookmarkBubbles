function NavigationLayout(element) {

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

// this.getNodeWidth = function() {
// 	return Math.floor(* 100) + '%';
// }

var update = function() {
	var node = canvas.selectAll("div.categories").data(nodes);
	var nodeEnter = node.enter().append("div")
		.attr("class", "categories")
		.attr("id", function(d, i) {
			return "category-" + i
		})
		.on("mouseover", category_mouseover)
		.on("mouseout", category_mouseout)
		.on("click", category_clicked)
		.text(function(d) {
			return d.item.title.toUpperCase();
		});

	node.style("width", (90/nodes.length)+'%');
}

}