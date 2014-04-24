
var BookmarkDataSingleton=( function(){

	var instance;
	var navigation_items = [];
	var node_items=[];
	var color_tags=[];
	var local_tags='';


	
	function init() {

	function initialisetest(){

		navigation_items=["NEURONS","YOGA","INFO","VISD3JS","BOOKMARKS BAR","OTHER BOOKMARKS","MOBILE BOOKMARKS","+"];
		node_items=[ {tags: "NEURONS", title: "Figure 1 : Pyramidal neurons: dendritic structure and synaptic integration : Nature Reviews Neuroscience",url: "http://www.nature.com/nrn/journal/v9/n3/fig_tab/nrn2286_F1.html"},{tags: "NEURONS",title: "Software Engineer at Chartio - Python - Stack Overflow Careers 2.0",url: "http://careers.stackoverflow.com/jobs/48832/software-engineer-chartio?a=XyrH9zCU&searchTerm=%22data%20visualization%22"},{tags: "YOGA",title: "Butterfly Yoga > Login Or Sign Up",url: "https://www.secure-booker.com/butterflyyoga/LoginOrSignUp/LoginOrSignUp.aspx"}];
		color_tags=["NEURONS","YOGA","INFO","VISD3JS","BOOKMARKSBAR","OTHERBOOKMARKS","MOBILEBOOKMARKS","+"];
	}

	function processNode(node,tags) {

	    // recursively process child nodes
	    //all it's parents folder names
	    if(node.children) {
	        node.children.forEach(function(child) { 
	           //node.title ? local_tags=local_tags+" "+ node.title.replace(/ /g,'').toUpperCase() : local_tags ;
	          local_tags = node.title.replace(/ /g,'').toUpperCase();
	          processNode(child,local_tags);

	        });
	    }

	    // it's a folder and it has a content
	    if(!node.url && node.children.length>0 ) { 
		      navigation_items.push(node.title.toUpperCase()); 
		      color_tags.push(node.title.replace(/ /g,'').toUpperCase());
	      }

	    if(node.url) { 
	      node_items.push({
	        url :node.url,
	        title: node.title,
	        tags: tags,
	        date: node.dateAdded
	      });
	    }
	    local_tags='';

	 }

	 //This is async call. I am using jQ promise to syncronize it.
	 function processBookmarkTree(){
	 	chrome.bookmarks.getTree(function(itemTree){
	 		itemTree.forEach(function(item){processNode(item,'');})
	 	})
	}

	};	

	 //public methods
	return {
		
		fetchData: function () {
			if (chrome.bookmarks){
				 $.when(processBookmarkTree()).done(function(){	
			    });
			   }
			  else {
			    initialisetest();
			  }
		},

	 	getBubbleNodeItems: function(){
	 		return node_items;
	 	},

	 	getNavigationItems: function(){
	 		return navigation_items;
	 	} , 

	 	getColorTags : function(){
	 		return color_tags;
	 	}

  	};


  	return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
      if ( !instance ) {
        instance = init();
      }
      return instance;
    }
  };

})();

