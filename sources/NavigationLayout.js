function NavigationLayout(element, color_set) {

	var canvas = this.canvas = d3.select(element);
	var width = canvas.style("width").slice(0, -2);
	var nodes = [];

	this.initializeLayout = function(initNodes) {
		for (var i = 0; i < initNodes.length; i++) {
			nodes.push(initNodes[i]);
		}
		update();
	}

	this.addNode=function(node){		
		nodes.unshift(node);
//		console.log(nodes);
		update();
		console.log(nodes);

	}



	function mouseover(d, i) {

		d.ui_mouseover = true;
		if (d.ui_click == false) {
			d3.select(this).style('color', color_set["category-"+d.item.id]);
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

		if (!d.ui_click) {
			d.ui_click = true;
			d3.select(this).attr("class", function(d,i){return d.get_class()})
				 .style("color", color_set["category-"+d.item.id])
				 .style("border-color", color_set["category-"+d.item.id]);

			d3.selectAll(".category-" + d.item.id).style("border-color", color_set["category-"+d.item.id]);



		} else {
			d.ui_click = false;
			d3.select(this).attr("class",function(d,i){return d.get_class()})
				.style("color", "rgb(152,151,150)")
				.style("border-color", "");
				//.style();

			d3.selectAll(".category-" + d.item.id).style("border-color", "rgb(179,179,179)");




		}
	}

	function showOptions(d, i){
		d3.select(this).selectAll("span").style("visibility","visible");
	}

	function hideOptions(d, i){
			d3.select(this).selectAll("span").style("visibility","hidden");

	}

	  function findNodeIndexForCategory(cat_id) {
        for (var i in nodes) {if (nodes[i].item.id === cat_id) return i};
    }	


	function removeCategory(d,i){
	
		nodes.splice(findNodeIndexForCategory(d.item.id),1);
//		d3.selectAll("#cat_wrapper-"+d.item.id).remove();
		bubbleForceLayout.removeNodesForCategory(d.item.id);
		update();


	}


	function showDialog(d,i)
	{
	$("#dialog").dialog({
				width: 600,
				modal: true,
				resizable: false,
				buttons: {
					"Yeah!": function() {
								// d3.selectAll(".category-"+d.item.id).each(function(d,i){
								// 	Model.deleteNode(d.item.id);
								// })
								// Model.deleteNode(d.item.id);
								removeCategory(d,i);

						$(this).dialog("close");
					},
					"Wait a  sec": function() {
						$(this).dialog("close");
					}
				}
			});
	}


	function emptyCategory(d,i){

		showDialog(d,i);
	}


	var drag = d3.behavior.drag()
	    .origin(function(d) { return d; })
	    .on("drag", dragmove);


	function dragmove(d) {
		console.log("drag");
  		d3.select(this)
      	.style("top", d.y = d3.event.y)
      	.style("left", d.x = d3.event.x);
}    


	var update = function() {

		var node = canvas.selectAll("div.cat_wrapper").data(nodes, function(d) { return d.item.id });
		var nodeEnter = node.enter().insert("div")
			.attr("class", "cat_wrapper")
			.attr("id", function(d, i) {
				return "cat_wrapper-" + d.item.id
			})
			.on("mouseover", showOptions)
			.on("mouseout", hideOptions)
			.call(drag);

		 nodeEnter.append("span").attr('class', 'close')
		 .on("click",removeCategory)
		 .text("X");
		 
		 nodeEnter.append("span").attr('class', 'only')
		 //.on("click",removeOtherCategories)
		 .on("click",emptyCategory)
		 .text("empty");

		 nodeEnter.append("div")
			.attr("class", "categories")
			.attr("id", function(d, i) {
				return "category-" + d.item.id
			})
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", clicked)
			.text(function(d) {
				return d.item.title.toUpperCase();
			});


		node.exit().remove();	

		// canvas.selectAll("#bin").data(["bin"])
		// 	.enter().append("div")
		// //	.attr("class", "categories")
		// 	.attr("id", "bin" )
		// 	 .on("mouseover", mouseover)
		// 	 .on("mouseout", mouseout)
		// 	 .on("click", clicked)
		// 	.text("BIN");

	//	node.style("width", (90 / nodes.length) + '%');

	}



}