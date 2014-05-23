var BookmarkDataSingleton = (function() {

	var instance;


	function init() {
		// Private methods and variables

		var navigation_items = [];
		var node_items = [];
		var categories = [];
		var nodes = [];

		//fetchData(function(){console.log("callback")});

		function initTestData() {

			navigation_items = ["NEURONS", "YOGA", "INFO", "VISD3JS", "BOOKMARKS BAR", "OTHER BOOKMARKS", "MOBILE BOOKMARKS", "+"];
			node_items = [{
				tags: "NEURONS",
				title: "Figure 1 : Pyramidal neurons: dendritic structure and synaptic integration : Nature Reviews Neuroscience",
				url: "http://www.nature.com/nrn/journal/v9/n3/fig_tab/nrn2286_F1.html"
			}, {
				tags: "NEURONS",
				title: "Software Engineer at Chartio - Python - Stack Overflow Careers 2.0",
				url: "http://careers.stackoverflow.com/jobs/48832/software-engineer-chartio?a=XyrH9zCU&searchTerm=%22data%20visualization%22"
			}, {
				tags: "YOGA",
				title: "Butterfly Yoga > Login Or Sign Up",
				url: "https://www.secure-booker.com/butterflyyoga/LoginOrSignUp/LoginOrSignUp.aspx"
			}];
		};


		function fetchBookmarkData(callBack) {


			if (chrome.bookmarks) {
				node_items = [];
				navigation_items = [];

				chrome.bookmarks.getTree(function(itemTree) {
					itemTree.forEach(function(item) {
						processNode(item);

						navigation_items.sort(function(a, b) {
							if (a.id < b.id) return 1;
							if (a.id > b.id) return -1;
							return 0;
						})


					});

					callBack();
				});
			} else {
				console.log("bookmarks are not available");
				initTestData();
				callBack();
			}
		};

		function processNode(node) {
			// recursively process child nodes
			//all it's parents folder names
			if (node.children) {
				node.children.forEach(function(child) {
					processNode(child);
				});
			}

			var isFolderWithChildren = !node.url
			var isFoldernotdefaulhidden = node.title != "Other Bookmarks" //&& node.title != "Mobile Bookmarks"
			//&& node.children.length > 0;
			var isRoot = node.title.length == 0;

			if (isFolderWithChildren && !isRoot && isFoldernotdefaulhidden) {
				categories.push(processCategory(node))

				categories.sort(function(a, b) {
					if (a.item.id < b.item.id) return -1;
					if (a.item.id > b.item.id) return 1;
					return 0;
				})

			}

			if (node.url) {
				nodes.push(processBookmark(node))
			}

		};

		function updateBookmarkParentForNode(node_id, parent_id, callback) {


			chrome.bookmarks.move(node_id, {
				parentId: parent_id
			}, function(result) {
				callback(processBookmark(result))
			});

		}


		function createNewBookmarkinFolder(url,parent_id ,callback) {
			chrome.bookmarks.create({
					'parentId': parent_id,
					'title': url,
					'url': url
				},
				function(result) {
					callback(processBookmark(result))
				}
			);

		}


		function processBookmark(node) {
			var node_item = {
				id: node.id,
				parent_id: node.parentId,
				url: node.url,
				title: node.title,
				date: node.dateAdded
			};

			var rnode = {
				default_center: -1,
				center: "category-" + node_item.parent_id, //lookupCategoryID(navigation_items, node_item),
				radius: null,
				item: node_item,
				cat_id: node_item.parent_id, //lookupCategoryID(navigation_items, node_item),
				ui_dim:false,
				ui_move: false ,
				ui_highlight: true,
				ui_expandwDetails: false,
				get_class: function() {
					var bubblefill_class = 'bubbleFill' + ' ';

					bubblefill_class = bubblefill_class + 'category-' + this.cat_id + ' ';
					if (this.ui_drag) {
						bubblefill_class += 'dragged' + ' '
					}
					return bubblefill_class;
				}
			};
			return rnode;

		}


		function processCategory(node) {
			var node_item = {
				id: node.id,
				title: node.title,
				date: node.dateAdded
			};


			navigation_items.push(node_item);

			var rnode = {
				item: node_item,
				displayNodes:maxNodesPerCategory,  
				totalNodes : 0,
				width: null,
				ui_dim: false,
				ui_highlight: true,
				ui_dragover	: false,
				get_class: function() {
					var cat_class = 'categories' + ' ';
					if (this.ui_dragover) {
						cat_class += "over ";
					}
					if (this.ui_highlight) {
						cat_class += "selected ";
					}
					return cat_class;
				}
			}
			return rnode;

		}

		function updateCategoryID(nodes) {
			return nodes.forEach(function(d) {
				d.center = d.cat_id = lookupNavigationItemID(navigation_items, d.item)
			});
		}

		function createNewCategoryinBookMarkBar(name, callback) {
			chrome.bookmarks.create({
					'parentId': '1',
					'title': name
				},
				function(result) {
					//					console.log(processCategory(result))
					categories.push(processCategory(result));
					callback(processCategory(result))
				}
			);
		}


		function getNodesWithMaxNumIneachCategory(nodes, maxNodes){

			limited_nodes =[];

			nodes.sort(function(a, b) {
					if (a.item.date < b.item.date) return -1;
					if (a.item.date > b.item.date) return 1;
					return 0;
				})


			categories.forEach(function(category){
				var nodesforCategory=getAllNodesForCategory(category.item.id)
				category.totalNodes=nodesforCategory.length;
				category.cat_id=category.item.id;
				category.center="category-"+category.item.id;
				category.default_center= -1;

				if 	(category.totalNodes<=maxNodes){
					nodesforCategory.forEach(function(node){
						limited_nodes.push(node)});
				}
				else {
					nodesforCategory.slice(0,maxNodes).forEach(function(node){
						limited_nodes.push(node)
					});
					limited_nodes.push(category);
				}		
			})
			

			// nodes.map(function(node,i){
			// 	var category_item=categories[lookupCategoryItemID(categories,node.cat_id)];
			// 	category_item.totalNodes++;
			// 	if (category_item.totalNodes<=maxNodes)
			// 	{
			// 		limited_nodes.push(node) 
			// 	}

			// 	else{
			// 		category_item.cat_id=node.cat_id;
			// 		category_item.center=node.center;
			// 		limited_nodes
			// 		//limited_nodes.splice(maxNodes,0,category_item)
			// 	}
			// })
			return limited_nodes;
		}


		function lookupCategoryItemID(categories,id){
			for (var i = 0; i < categories.length; i++) {
				if (categories[i].item.id === id) {
					return i;
				}
			}
			return -1;
		}

		function lookupNavigationItemID(navigation_items, node_item) {
			for (var i = 0; i < navigation_items.length; i++) {
				if (navigation_items[i].id === node_item.parent_id) {
					return i;
				}
			}
			return -1;

		}

		function getAllNodesForCategory(cat_id){
			var nodesForCategory=[];
			nodes.forEach(function(node){
				if (node.cat_id== cat_id){
					nodesForCategory.push(node);
				}
			} )
		
			return nodesForCategory;
		}


		//End Private methods and variables

		//public methods
		return {

			getColorSetforCategories: function(colorSet, categories) {
				var ColorSetforCategories = [];
				categories.forEach(function(d, i) {
					ColorSetforCategories["category-" + categories[i].item.id] = colorSet(i);
				})

				return ColorSetforCategories;

			},


			getUIData: function(callBackonBookmarksProcesed) {
				fetchBookmarkData(callBackonBookmarksProcesed)
			},

			getNavigationItems: function() {
				return navigation_items;
			},

			getNodeItems: function() {
				return node_items;
			},

			getCategories: function() {
				return categories;
			},

			getNodes: function() {
				//updateCategoryID(nodes);

				return nodes;
			},

			getNodesLimitedForEachCategory: function(maxNodesPerCategory){
				return 	getNodesWithMaxNumIneachCategory(nodes,maxNodesPerCategory)
			},

			updateNodeAssigntoCategory: function(node_id, cat_id, callback) {
				updateBookmarkParentForNode(node_id, cat_id, function(result) {
					callback(result);
				});

			},

			deleteNode: function(node_id, callback) {

				chrome.bookmarks.remove(node_id);

			},

			createNewBookmark: function(url, callback) {
				createNewBookmarkinFolder(url,"1" ,function(result) {
					callback(result)
				});
			},

			createNewBookmarkinFolder: function(url, parent_id ,callback) {
				createNewBookmarkinFolder(url, parent_id,function(result) {
					callback(result)
				});
			},

			createNewCategory: function(name, callback) {
				createNewCategoryinBookMarkBar(name, function(result) {
					callback(result)
				});
			},

			search: function(term, callback){

				chrome.bookmarks.search(term, function(result) {
					callback(result)
				});
			
			},

			getRemainingNodesForCategory: function(cat_id, startingFrom){
				var nodesForCategory=getAllNodesForCategory(cat_id);

				nodesForCategory.sort(function(a, b) {
					if (a.item.date < b.item.date) return -1;
					if (a.item.date > b.item.date) return 1;
					return 0;
				})

				return nodesForCategory.slice(startingFrom,nodesForCategory.length);
			}


			//end of public methods   

		};
	};

	return {
		// Get the Singleton instance if one exists
		// or create one if it doesn't
		getInstance: function() {
			if (!instance) {
				instance = init();
			}
			return instance;
		}
	};

})();