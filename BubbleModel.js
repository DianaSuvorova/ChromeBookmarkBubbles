var BookmarkDataSingleton = (function() {

	var instance;


	function init() {
		// Private methods and variables

		var navigation_items = [];
		var node_items = [];
		var color_tags = [];
		var local_tags;

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
				node_items=[];
				navigation_items=[];

				chrome.bookmarks.getTree(function(itemTree) {
					itemTree.forEach(function(item) {
						processNode(item);
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

			var isFolderWithChildren = !node.url && node.children.length > 0;
			var isRoot = node.title.length == 0;

			if (isFolderWithChildren && !isRoot) {
				navigation_items.push({
					id: node.id,
					title: node.title
				});
			}

			if (node.url) {
				node_items.push({
					id: node.id,
					parent_id: node.parentId,
					url: node.url,
					title: node.title,
					date: node.dateAdded,
				});
			}

		};

		function updateBookmarkParentForNode(node_id, parent_id, callBack) {


			chrome.bookmarks.move(node_id, {
				parentId: parent_id
			}, function(node) {
				console.log("it moved ");
			});

		}


		function createNewBookmarkinBookMarkBar(url,callback){
			      chrome.bookmarks.create({'parentId': '1',
                  'title': url,
                  'url': url}, 
                  callback());
		}

		function lookupCategoryID(navigation_items, node_item) {
			for (var i = 0; i < navigation_items.length; i++) {
				if (navigation_items[i].id === node_item.parent_id) {
					return i;
				}
			}
			return -1;

		}

		function updateCategories(navigation_items) {

			var categories = [];

			d3.range(navigation_items.length).map(function(i) {
				categories.push({
					item: navigation_items[i],
					width: null,
					ui_click: false,
					ui_mouseover: false,
					ui_dragover:false,
				});

			});

			return categories;
		}

		function UpdateNodes(node_items, navigation_items) {

			var nodes = [];

			d3.range(node_items.length).map(function(i) {
				nodes.push({
					default_center: Math.floor(navigation_items.length / 2),
					center: Math.floor(navigation_items.length / 2),
					radius: null,
					item: node_items[i],
					cat_id: lookupCategoryID(navigation_items, node_items[i]),
					ui_drag: false,
				})
			});

			return nodes;
			//  console.log(nodes);
		}

		//End Private methods and variables

		//public methods
		return {

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
				return updateCategories(navigation_items)
			},

			getNodes: function() {
				return UpdateNodes(node_items, navigation_items)
			},

			updateNodeAssigntoCategory: function(node_id, cat_id, callBackonBookmarksUpdated) {
				updateBookmarkParentForNode(node_id, cat_id, callBackonBookmarksUpdated)

			},

			createNewBookmark: function(url,parent_id,callback){
				createNewBookmarkinFolder(url,parent_id,callback)
			},

			createNewBookmark: function(url,callback){
				createNewBookmarkinBookMarkBar(url,callback)
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