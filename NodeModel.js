var Node = function(index,radius,item,navigation_items) {
    var     _index = index
    		_def_center = 	Math.floor(navigation_items.length/2), 
            _radius=	radius , 
            _item = item ,
            _cat_id =  navigation_items.indexOf(item.parent_id);

   
    return {
      getIndex: function () {
        return _index
      },
      getDefaultCenter: function () {
        return _def_center
      },
       getRadius: function () {
        return _radius
      },
 	   getItem: function () {
        return _item
      },
      getCatID: function () {
        return _cat_id
      }

    };
};
