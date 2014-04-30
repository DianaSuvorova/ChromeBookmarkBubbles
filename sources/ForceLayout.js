function ForceLayout(element,centers) {

	var canvas = this.canvas= d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var height = canvas.style("height").slice(0, -2);


	this.initializeLayout = function (initNodes){
		for (var i = 0; i < initNodes.length; i++) {
		    nodes.push(initNodes[i]);
		}
		update();
	}

	var force = d3.layout.force()
		.size([width, height])
		.charge(-Math.pow(radius / 2 + padding, 1) * 20)
		.gravity(0)
		.friction(0.87);

	var nodes = force.nodes();

	var update = function() {

		var node = canvas.selectAll("div.bubble").data(nodes);

		var nodeEnter = node.enter().append("div")
			.attr("class", "bubble")
			.attr("id", function(d, i) {
				return "bubble-" + i
			})
			.call(force.drag);

		nodeEnter.append("div")
			.attr("id", function(d, i) {
				return "bubbleFill-" + i
			})
			.attr("class", bubblefill_get_class)
			.style("background-image", function(d, i) {
				return 'url(http://api.thumbalizr.com/?url=' + d.item.url + '&width=250)'
			})
			.style("width", radius + "px")
			.style("height", radius + "px")
			.attr("draggable", "true")
			.on("click", bubble_mouseover)
			.on("mouseout", bubble_mouseout)
			.on("dblclick", bubble_click);

		node.exit().remove();


		var jq_bubbleFill = document.querySelectorAll('.bubbleFill');
		[].forEach.call(jq_bubbleFill, function(bubbleFill) {
			bubbleFill.addEventListener('dragstart', bubble_handleDragStart, false);
			bubbleFill.addEventListener('dragend', bubble_handleDragEnd, false);
			//  bubbleFill.addEventListener('drop', function(){console.log("drrrop")}, false);
		});

		var jq_categories = document.querySelectorAll('.categories');
		[].forEach.call(jq_categories, function(cat) {
			cat.addEventListener('dragenter', category_handleDragEnter, false);
			cat.addEventListener('dragover', category_handleDragOver, false);
			cat.addEventListener('dragleave', category_handleDragLeave, false);
			cat.addEventListener('drop', category_handleDrop, false);
		});


		force.on("tick", function(e) {
			var k = 0.2 * e.alpha;
			nodes.forEach(function(o, i) {
				o.y += (this.centers[o.center].y - o.y) * k;

				o.x += (this.centers[o.center].x - o.x) * k;
			});

			node
				.style("left", function(d, i) {
					if (d.x < 0) d.x = -d.x;
					return d.x + "px";
				})
				.style("top", function(d, i) {
					if (d.y < 0) d.y = -d.y;
					return d.y + "px";
				});

		});

		force.start();


	}

	update();


}