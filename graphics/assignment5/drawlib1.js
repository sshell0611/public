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

function Vector4(x, y, z, w) {
 this.x = 0;
 this.y = 0;
 this.z = 0;
 this.w = 1;
 this.set(x, y, z, w);
}

Vector4.prototype = {
         set : function(x, y, z, w) {
		          if (x !== undefined) this.x = x;
		          if (y !== undefined) this.y = y;
		          if (z !== undefined) this.z = z;
		          if (w !== undefined) this.w = w;

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
				this.data[this.elems-1] = 1;
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
				var arr = [src.x, src.y, src.z, 1];
				for (c = 0; c < this.cols; c++) {
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
				//dst.z = 1;
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
 this.x		   = 0;
 this.y		   = 0;
 this.border   = 'black';
 this.fill	   = 'white';
 this.init(x,y,sz);
}

Square.prototype = {
		init: function(x, y, sz) {
		       	if (x  == undefined) throw "Undefined start x coordinate";
		       	if (y  == undefined) throw "Undefined start y coordinate";
		       	if (sz == undefined) throw "Undefined size";
				this.x = x;
				this.y = y;
				this.nEdges  = 4;
				this.nVertex = 4;
				this.size	 = sz;
				var hsz = sz/2;
				//ignore the z coordinate and use z to represent 1 for a homogeneous point
				var vtx0 = new Vector3(x-hsz, y-hsz, 1);
				var vtx1 = new Vector3(x+hsz, y-hsz, 1);
				var vtx2 = new Vector3(x-hsz, y+hsz, 1);
				var vtx3 = new Vector3(x+hsz, y+hsz, 1);
				this.vertices = [vtx0, vtx1, vtx2, vtx3];
				this.edges    = [[0,1], [1,3], [3,2], [2,0]];
		    },

		numEdges: function() {
				return this.nEdges;	
			},

		getVertex: function (v) {
				if (v > 3)	throw "Invalid vertex, must be from 0 to 3";
				return this.vertices[v];
			},

		setVertex: function(v, vertex) {
				if (v > 3)	throw "Invalid vertex, must be from 0 to 3";
				this.vertices[v] = vertex;
			},

		getEdge: function (e) {
				if (e > 3)	throw "Invalid vertex, must be from 0 to 3";
				return this.edges[e];
			},

		setBorder: function(color) {
				this.border = color;	
			},

		getBorder: function() {
				return this.border;	
			},

		setFill: function(color) {
				this.fill = color;	
			},

		getFill: function() {
				return this.fill;	
			},

		clone: function() {
				var sq = new Square(this.x, this.y, this.size);
				sq.setBorder(this.getBorder());
				sq.setFill(this.getFill());
				return sq;
		    },

		//transform using a matrix 
		//true/false flag to change the matrix
		transform: function(M, inplace) {
				var sq;
				if (inplace == true)	
					sq = this;
				else
					sq = this.clone();

				//console.log(this.getX());

				for (v = 0; v < this.nVertex; v++)
				{
					var newVtx = new Vector3(0, 0, 0);
					M.transform(sq.getVertex(v), newVtx);
					sq.setVertex(v, newVtx);
				}

				//console.log(this.getX());

				return sq;
			},

}


//here x/y is the center point, r is the "radius" from the center
function Pentagon(x,y,r) {
 this.vertices = [];
 this.edges    = []; 
 this.nEdges   = 0;
 this.nVertex  = 0;
 this.size	   = 0;
 this.x		   = 0;
 this.y 	   = 0;
 this.r		   = 0;
 this.border   = 'black';
 this.fill	   = 'white';
 this.init(x,y,r);
}

Pentagon.prototype = {
		init: function(x, y, r) {
		       	if (x == undefined) throw "Undefined start x coordinate";
		       	if (y == undefined) throw "Undefined start y coordinate";
		       	if (r == undefined) throw "Undefined radius";
				this.x = x;
				this.y = y;
				this.r = r;
				this.nEdges  = 5;
				this.nVertex = 5;
				this.size	 = r;

				var c1 = r * Math.cos((2 * Math.PI) / 5) ;
				var c2 = r * Math.cos(Math.PI / 5);
				var s1 = r * Math.sin((2 * Math.PI) / 5);
				var s2 = r * Math.sin((4 * Math.PI) / 5);

				//ignore the z coordinate and use z to represent 1 for a homogeneous point
				var vtx0 = new Vector3(-s2+x, -c2+y, 1);
				var vtx1 = new Vector3( s2+x, -c2+y, 1);
				var vtx2 = new Vector3(-s1+x,  c1+y, 1);
				var vtx3 = new Vector3( s1+x,  c1+y, 1);
				var vtx4 = new Vector3(  x, y+r, 1);
				this.vertices = [vtx0, vtx1, vtx2, vtx3, vtx4];
				this.edges    = [[0,1], [1,3], [3,4], [4,2], [2,0]];
		    },

		numEdges: function() {
				return this.nEdges;	
			},

		getVertex: function (v) {
				if (v > 4)	throw "Invalid vertex, must be from 0 to 4";
				return this.vertices[v];
			},

		setVertex: function(v, vertex) {
				if (v > 4)	throw "Invalid vertex, must be from 0 to 4";
				this.vertices[v] = vertex;
			},

		getEdge: function (e) {
				if (e > 4)	throw "Invalid vertex, must be from 0 to 4";
				return this.edges[e];
			},

		setBorder: function(color) {
				this.border = color;	
			},

		getBorder: function() {
				return this.border;	
			},

		setFill: function(color) {
				this.fill = color;	
			},

		getFill: function() {
				return this.fill;	
			},

		clone: function() {
				var sq = new Square(this.x, this.y, this.size);
				sq.setBorder(this.getBorder());
				sq.setFill(this.getFill());
				return sq;
		    },

		//transform using a matrix 
		//true/false flag to change the matrix
		transform: function(M, inplace) {
				var obj;
				if (inplace == true)	
					obj = this;
				else
					obj = this.clone();

				//console.log(this.getX());

				for (v = 0; v < this.nVertex; v++)
				{
					var newVtx = new Vector3(0, 0, 0);
					M.transform(obj.getVertex(v), newVtx);
					obj.setVertex(v, newVtx);
				}

				//console.log(this.getX());

				return obj;
			},

}

/////////////////////////////////////////////////////////////
//  Helper functions
/////////////////////////////////////////////////////////////

function toViewport(x, y, w, h) {
	px = (w / 2) + x * (w / 2);
	py = (h / 2) - y * (w / 2);
	return [px, py];
}

function toViewportX(x, w) {
	return (w/2) + x * (w/2);
}

function toViewportY(y, w, h) {
	return (h/2) - y * (w/2);
}

function drawSquare(square, canvas, w, h) {

	canvas.strokeStyle = square.getBorder();
	canvas.fillStyle = square.getFill();

	//move to the first vertex
	canvas.beginPath();

	var vtx1 = square.getVertex(0);
	var x = toViewportX(vtx1.x, w);
	var y = toViewportY(vtx1.y, w, h);

	canvas.moveTo(x, y);

	//loop through all of the edges
	for (e=0; e < square.numEdges(); e++)
	{
		var edge = square.getEdge(e);
		var vtx  = square.getVertex(edge[1]);
		var x    = toViewportX(vtx.x, w);
		var y    = toViewportY(vtx.y, w, h);
		canvas.lineTo(x, y);
	}

	canvas.fill();
	canvas.stroke();
}

function drawShape(shape, canvas, w, h) {

	canvas.strokeStyle = shape.getBorder();
	canvas.fillStyle = shape.getFill();

	//move to the first vertex
	canvas.beginPath();

	var vtx1 = shape.getVertex(0);
	var x = toViewportX(vtx1.x, w);
	var y = toViewportY(vtx1.y, w, h);

	canvas.moveTo(x, y);

	//loop through all of the edges
	for (e=0; e < shape.numEdges(); e++)
	{
		var edge = shape.getEdge(e);
		var vtx  = shape.getVertex(edge[1]);
		var x    = toViewportX(vtx.x, w);
		var y    = toViewportY(vtx.y, w, h);
		canvas.lineTo(x, y);
	}

	canvas.fill();
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
