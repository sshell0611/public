/////////////////////////////////////////////////////////////
//  Building Block classes - Vector and Matrix
/////////////////////////////////////////////////////////////
function Vector3(x, y, z) {
 this.x = 0;
 this.y = 0;
 this.z = 0;
 this.set(x, y, z);
}

Vector3.prototype = {
         set : function(x, y, z) {
		          if (x !== undefined) this.x = x;
		          if (y !== undefined) this.y = y;
		          if (z !== undefined) this.z = z;
		       },
}

function Matrix(rows, cols) {
 this.rows = 0;
 this.cols = 0;
 this.elems = 0;
 this.data = [];
 this.init(rows, cols);
}

Matrix.prototype = {
		init: function(rows, cols) {
		       	if (rows !== undefined) this.rows = rows;
		       	if (cols !== undefined) this.cols = cols;
				this.elems = this.rows * this.cols;
				for (idx =0; idx < this.elems; idx++) {
					this.data[idx] = 0;
				}
		    },

		get: function (r, c) {
				if (r*c >= this.elems) {
					throw "Invalid Row/Column";
				}
				return this.data[r + c * this.cols]	;
			},

		set: function (r, c, val) {
				if (r*c >= this.elems) {
					//console.log(this.elems);
					throw "Invalid Row/Column";
				}
				this.data[r + c * this.cols] = val;
			},
	 	
		identity: function() {
				this.set(0,0,1);
				this.set(1,1,1);
				this.set(2,2,1);
				this.set(3,3,1);
			},

		clone: function() {
				var M = new Matrix(this.rows, this.cols);
				for (i = 0; i < M.elems; i++) {
						var v = this.data[i];
						M.data[i] = v;
				}
				return M;
			},

		display: function() {
				for (r = 0; r < this.rows; r++) {
					var str = "";
					for (c =0; c < this.cols; c++) {
							str = str.concat(this.get(r,c), " ");
						}
					console.log(str);
					console.log("\n");
				}
			},

		translate: function(x, y, z) {
				this.set(0,3,x);
				this.set(1,3,y);
				this.set(2,3,z);
				return this.clone();
			},

		rotateX: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				this.set(1,1, c);
				this.set(1,2,-s);
				this.set(2,1, s);
				this.set(2,2, c);
				return this.clone();
			},

		rotateY: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				this.set(0,0, c);
				this.set(0,2, s);
				this.set(2,0,-s);
				this.set(2,2, c);
				return this.clone();
			},

		rotateZ: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				this.set(0,0, c);
				this.set(0,1,-s);
				this.set(1,0, s);
				this.set(1,1, c);
				return this.clone();
			},

		scale: function(x, y, z) {
				this.set(0,0,x);
				this.set(1,1,y);
				this.set(2,2,z);
				return this.clone();
			},

		innerproduct: function(r, src) {
				//take the inner product of row r
				//in our matrix with vector src
				var ip = 0;
				var arr = [src.x, src.y, src.z];
				for (c = 0; c < this.cols-1; c++) {
					ip = ip + (this.get(r,c) * arr[c]);
				}
				return ip;
		    },

		//src and dst are of type Vector3
		transform: function(src, dst) {
				if (this.cols !== 4) {
						throw "Invalid dimensions for transformation";
				}
				dst.x = this.innerproduct(0, src);
				dst.y = this.innerproduct(1, src);
				dst.z = this.innerproduct(2, src);
			},

}

/////////////////////////////////////////////////////////////
//  Shape Definitions
/////////////////////////////////////////////////////////////

function Square(x,y,sz) {
 this.vertices = [];
 this.edges    = []; 
 this.nEdges   = 0;
 this.nVertex  = 0;
 this.size	   = 0;
 this.init(x,y,sz);
}

Square.prototype = {
		init: function(x, y, sz) {
		       	if (x  == undefined) throw "Undefined start x coordinate";
		       	if (y  == undefined) throw "Undefined start y coordinate";
		       	if (sz == undefined) throw "Undefined size";
				this.nEdges  = 4;
				this.nVertex = 4;
				this.size	 = sz;
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

		clone: function() {
				var x  = this.vertices[0].x;
				var y  = this.vertices[1].y;
				var sq = new Square(x, y, this.size);
				return sq;
		    },

		//transform using a matrix
		transform: function(M) {
			},

}

/////////////////////////////////////////////////////////////
//  Helper functions
/////////////////////////////////////////////////////////////

function transformViewport(x, y, w, h) {
	px = (w / 2) + x * (w / 2);
	py = (h / 2) - y * (w / 2);
	return [px, py];
}

function drawSquare(square, canvas, w, h) {

    var x = w/2, y = h/2;

	canvas.strokeStyle = 'red';
	canvas.beginPath();
	canvas.moveTo(x-50,y);
	canvas.lineTo(x+50,y);
	canvas.stroke();

}



/////////////////////////////////////////////////////////////
//  Canvas stuff provided by Prof
/////////////////////////////////////////////////////////////

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id) {
	   var canvas = document.getElementById(id);
	   canvas.setCursor = function(x, y, z) {
				var r = this.getBoundingClientRect();
		 this.cursor.set(x - r.left, y - r.top, z);
			 }
	   canvas.cursor = new Vector3(0, 0, 0);
	   canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
	   canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
	   canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
	   canvases.push(canvas);
	   return canvas;
}

function tick() {
		 time = (new Date()).getTime() / 1000 - startTime;
		 for (var i = 0 ; i < canvases.length ; i++)
			if (canvases[i].update !== undefined) {
					var canvas = canvases[i];
						var g = canvas.getContext('2d');
						g.clearRect(0, 0, canvas.width, canvas.height);
						canvas.update(g);
					 }
		 setTimeout(tick, 1000 / 60);
}

tick();
