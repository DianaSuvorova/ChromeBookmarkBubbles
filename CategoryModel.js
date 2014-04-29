function Category() {
        this.item = navigation_items;
        this.ui_click= false;
        this.ui_mouseover= false;
        this.ui_dragover=false;


};



function Category (type) {
    this.type = type;
    this.color = "red";
    this.getInfo = function() {
        return this.color + ' ' + this.type + ' apple';
    };
}