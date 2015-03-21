function Square(x,y,sz) {
 this.vertices = [];
 this.edges    = []; 
 this.init(x,y,sz);
}

Square.prototype = {
		init: function(x, y, sz) {
		       	if (x  == undefined) throw "Undefined start x coordinate";
		       	if (y  == undefined) throw "Undefined start y coordinate";
		       	if (sz == undefined) throw "Undefined size";
				var vtx0 = new Vector3(x,   y   ,0);
				var vtx1 = new Vector3(x+sz,y   ,0);
				var vtx2 = new Vector3(x   ,y+sz,0);
				var vtx3 = new Vector3(x+sz,y+sz,0);
				this.vertices = [vtx0, vtx1, vtx2, vtx3];
				this.edges    = [[0,1], [1,3], [3,2], [2,0]];
		    },

		getVertex: function (v) {
				if (v > 3)	throw "Invalid vertex, must be from 0 to 3";
				return this.vertices[v];
			},

		getEdge: function (e) {
				if (e > 3)	throw "Invalid vertex, must be from 0 to 3";
				return this.edges[e];
			},


		transform: function(M) {
			},


		draw: function() {
		
			},
}

