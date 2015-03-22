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

function Matrix() {
 this.rows = 0;
 this.cols = 0;
 this.elems = 0;
 this.data = [];
 this.init(4,4);
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
			for (idx =0; idx < this.elems; idx++) {
					this.data[idx] = 0;
				}
				this.set(0,0,1);
				this.set(1,1,1);
				this.set(2,2,1);
				this.set(3,3,1);
			},

		clone: function() {
				var M = new Matrix();
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

		multiply: function(B) {
				//console.log("This before");
				//console.log(this.display());
				//console.log("Matrix B");
				//console.log(B.display());

				if (this.cols != B.rows) {
					throw "Incompatible dimensions";
				}
				var result = [];
				for (var r = 0; r < this.rows; r++) {
					for (var c = 0; c < B.cols; c++) {
						var sum = 0;
						for (var k =0; k < this.cols; k++) {
							sum += this.get(r, k) * B.get(k, c);	
						}
						result[r + c * B.cols] = sum;
					}	
				}
				this.data = result;
				//console.log("This after");
				//console.log(this.display());
				//throw "error!"
			},

		translate: function(x, y, z) {
				var T = new Matrix();
				T.identity();
				T.set(0,3,x);
				T.set(1,3,y);
				T.set(2,3,z);
				this.multiply(T);
				return this.clone();
			},

		rotateX: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				var R = new Matrix();
				R.set(1,1, c);
				R.set(1,2,-s);
				R.set(2,1, s);
				R.set(2,2, c);
				this.multiply(R);
				return this.clone();
			},

		rotateY: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				var R = new Matrix();
				R.set(0,0, c);
				R.set(0,2, s);
				R.set(2,0,-s);
				R.set(2,2, c);
				this.multiply(R);
				return this.clone();
			},

		rotateZ: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				var R = new Matrix();
				R.set(0,0, c);
				R.set(0,1,-s);
				R.set(1,0, s);
				R.set(1,1, c);
				this.multiply(R);
				return this.clone();
			},

		scale: function(x, y, z) {
				var S = new Matrix();
				S.set(0,0,x);
				S.set(1,1,y);
				S.set(2,2,z);
				this.multiply(S);
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


//Cube:
function Cube(center, sz) {
 this.vertices = [];
 this.edges    = []; 
 this.nEdges   = 0;
 this.nVertex  = 0;
 this.size	   = 0;
 this.center   = new Vector3();
 this.border   = 'black';
 this.fill	   = 'white';
 this.init(center,sz);
}

Cube.prototype = {
		init: function(center, sz) {
		       	if (center.x  == undefined) throw "Undefined start x coordinate";
		       	if (center.y  == undefined) throw "Undefined start y coordinate";
		       	if (center.z  == undefined) throw "Undefined start z coordinate";
		       	if (sz == undefined) throw "Undefined size";
				this.center = center;
				x = center.x;
				y = center.y;
				z = center.z;
				this.nEdges  = 18;//because we are overlapping for drawing
				this.nVertex = 8;
				this.size	 = sz;
				var hsz = sz/2;
				var vtx0 = new Vector3(x-hsz, y-hsz, z-hsz);
				var vtx1 = new Vector3(x+hsz, y-hsz, z-hsz);
				var vtx2 = new Vector3(x-hsz, y+hsz, z-hsz);
				var vtx3 = new Vector3(x+hsz, y+hsz, z-hsz);
				var vtx4 = new Vector3(x-hsz+0.02, y-hsz+0.02, z+hsz);
				var vtx5 = new Vector3(x+hsz+0.02, y-hsz+0.02, z+hsz);
				var vtx6 = new Vector3(x-hsz+0.02, y+hsz+0.02, z+hsz);
				var vtx7 = new Vector3(x+hsz+0.02, y+hsz+0.02, z+hsz);
				this.vertices = [vtx0, vtx1, vtx2, vtx3, vtx4, vtx5, vtx6, vtx7];
				this.edges    = [[0,1], [1,3], [3,2], [2,0],
								 [0,4], [4,5], [5,1], [1,5],
								 [5,7], [7,6], [6,4], [4,6],
								 [6,2], [2,6], [6,7], [7,5],
								 [5,7], [7,3]
								];
		    },

		numEdges: function() {
				return this.nEdges;	
			},

		getVertex: function (v) {
				if (v > 7)	throw "Invalid vertex, must be from 0 to 7";
				return this.vertices[v];
			},

		setVertex: function(v, vertex) {
				if (v > 7)	throw "Invalid vertex, must be from 0 to 7";
				this.vertices[v] = vertex;
			},

		getEdge: function (e) {
				if (e > 17)	throw "Invalid vertex, must be from 0 to 17";
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
				var cube = new Cube(this.center, this.size);
				cube.setBorder(this.getBorder());
				cube.setFill(this.getFill());
				return cube;
		    },

		//transform using a matrix 
		//true/false flag to change the matrix
		transform: function(M, inplace) {
				var cube;
				if (inplace == true)	
					cube = this;
				else
					cube = this.clone();

				//console.log(this.getX());

				for (v = 0; v < this.nVertex; v++)
				{
					var newVtx = new Vector3(0, 0, 0);
					M.transform(cube.getVertex(v), newVtx);
					cube.setVertex(v, newVtx);
				}

				//console.log(this.getX());

				return cube;
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
				var p = new Pentagon(this.x, this.y, this.r);
				p.setBorder(this.getBorder());
				p.setFill(this.getFill());
				return p;
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


//here x/y is the center point, r is the "radius" from the center
function Octagon(x,y,r) {
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

Octagon.prototype = {
		init: function(x, y, r) {
		       	if (x == undefined) throw "Undefined start x coordinate";
		       	if (y == undefined) throw "Undefined start y coordinate";
		       	if (r == undefined) throw "Undefined radius";
				this.x = x;
				this.y = y;
				this.r = r;
				this.nEdges  = 8;
				this.nVertex = 8;
				this.size	 = r;

				var c1 = r * Math.cos(Math.PI / 4);
				var s1 = r * Math.sin(Math.PI / 4);

				//ignore the z coordinate and use z to represent 1 for a homogeneous point
				var vtx0 = new Vector3(    x,   y-r, 1);
				var vtx1 = new Vector3(-c1+x, -s1+y, 1);
				var vtx2 = new Vector3( c1+x, -s1+y, 1);
				var vtx3 = new Vector3( -r+x,     y, 1);
				var vtx4 = new Vector3(  r+x,     y, 1);
				var vtx5 = new Vector3(-c1+x,  s1+y, 1);
				var vtx6 = new Vector3( c1+x,  s1+y, 1);
				var vtx7 = new Vector3(    x,   y+r, 1);
				this.vertices = [vtx0, vtx1, vtx2, vtx3, vtx4, vtx5, vtx6, vtx7];
				this.edges    = [[0,2], [2,4], [4,6], [6,7], [7,5], [5,3], [3,1], [1,0]];
		    },
		numEdges: function() {
				return this.nEdges;	
			},
		getVertex: function (v) {
				if (v > 7)	throw "Invalid vertex, must be from 0 to 7";
				return this.vertices[v];
			},
		setVertex: function(v, vertex) {
				if (v > 7)	throw "Invalid vertex, must be from 0 to 7";
				this.vertices[v] = vertex;
			},
		getEdge: function (e) {
				if (e > 7)	throw "Invalid vertex, must be from 0 to 7";
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
				var o = new Octagon(this.x, this.y, this.r);
				o.setBorder(this.getBorder());
				o.setFill(this.getFill());
				return o;
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
//  Parametric Surface
/////////////////////////////////////////////////////////////
//
function Surface() {
	this.xadj = 2.5;
	this.yadj = 1.5;
	this.nu = 60;
	this.nv = 35;
	this.vertices = [];
	this.vertices.length = this.nu * this.nv;

	this.uv2xyz = function(u, v, dst) {
		var x = Math.sin(2 * Math.PI * u)/this.xadj;
		var y = (8 * v - 2);
		var z = Math.cos(2 * Math.PI * u)/this.xadj;
		//var x = (2 * u - 1)/this.xadj;// * Math.sin(time);
		//var x = (Math.cos(2 * Math.PI * u)-1)/this.xadj;
		//var y = (2 * v - 1)/this.yadj ;
		//var z = Math.cos(2 * Math.PI * u)/this.xadj;
		//var z = 1;//(2 * Math.PI * u)/this.xadj;
		var p  = 2;
		var yp = Math.abs(Math.cos(time)) + 2;
		var t = Math.pow(Math.pow(x,p) + Math.pow(y,yp) + Math.pow(z,p), 1/p);
		x = x / t / this.xadj;
		y = y / t / this.yadj - 0.25;
	   	z = z / t / this.xadj;	
		dst.set(x, y, z);
	}

	this.build = function (elapsed) {
			var du = 1 / this.nu;
			var dv = 1 / this.nv;
			var i = 0;
			for (var u = 0; u < .999; u += du) {
				for (var v = 0; v < .999; v += dv) {
						//square of 4 vertexes
						var sq = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
						this.uv2xyz(u	, v	  , sq[0]);
						this.uv2xyz(u+du, v	  , sq[1]);
						this.uv2xyz(u+du, v+dv, sq[2]);
						this.uv2xyz(u	, v+dv, sq[3]);
						this.vertices[i] = sq;
						i += 1;
				}
			}
	}

	this.draw = function(g, w, h) {
			g.beginPath();
			for (var idx = 0; idx < this.vertices.length; idx++) {

				var initVtx = this.vertices[idx][0];
				var px = [];
				viewPort(initVtx, px, w, h);
				g.moveTo(px[0], px[1]);

				for (var v = 1; v < 4; v++) {
					var px = [];		
					viewPort(this.vertices[idx][v], px, w, h);
					g.lineTo(px[0], px[1]);
				}
			}
			g.fill();
			g.stroke();
	}

}


function Cylinder() {
	this.xadj = 3.5;
	this.yadj = 2.5;
	this.nu = 50;
	this.nv = 20;
	this.vertices = [];
	this.vertices.length = this.nu * this.nv;

	this.uv2xyz = function(u, v, dst) {
		var x = Math.sin(2 * Math.PI * u)/this.xadj;
		var y = (2 * v - 1)/this.yadj;
		var z = Math.cos(2 * Math.PI * u)/this.xadj;
		dst.set(x, y, z);
	}

	this.build = function (elapsed) {
			var du = 1 / this.nu;
			var dv = 1 / this.nv;
			var i = 0;
			for (var u = 0; u < .999; u += du) {
				for (var v = 0; v < .999; v += dv) {
						//square of 4 vertexes
						var sq = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
						this.uv2xyz(u	, v	  , sq[0]);
						this.uv2xyz(u+du, v	  , sq[1]);
						this.uv2xyz(u+du, v+dv, sq[2]);
						this.uv2xyz(u	, v+dv, sq[3]);
						this.vertices[i] = sq;
						i += 1;
				}
			}
	}

	this.draw = function(g, w, h, f) {
			g.beginPath();
			for (var idx = 0; idx < this.vertices.length; idx++) {

				var initVtx = this.vertices[idx][0];
				var px = [];
				viewPort(initVtx, px, w, h, f);
				g.moveTo(px[0], px[1]);

				for (var v = 1; v < 4; v++) {
					var px = [];		
					viewPort(this.vertices[idx][v], px, w, h, f);
					g.lineTo(px[0], px[1]);
				}
			}
			g.fill();
			g.stroke();
	}
}

function Birdcage() {
	this.xadj = 3.5;
	this.yadj = 2.5;
	this.nu = 50;
	this.nv = 3;
	this.vertices = [];
	this.vertices.length = this.nu * (this.nv-1);

	this.uv2xyz = function(u, v, dst) {
		var theta = 2 * Math.PI * u;
		var phi   = Math.PI * v - Math.PI/2;
		var x = (Math.cos(phi) * Math.sin(theta)) /this.xadj;
		var y = Math.sin(phi) / this.yadj;
		var z = (Math.cos(phi) * Math.cos(theta))/this.xadj;
		dst.set(x, y, z);
	}

	this.build = function (elapsed) {
			var du = 1 / this.nu;
			var dv = 1 / this.nv;
			var i = 0;
			for (var u = 0; u < .999; u += du) {
				for (var v = dv; v < .999; v += dv) {
						//square of 4 vertexes
						var sq = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
						this.uv2xyz(u	, v	  , sq[0]);
						this.uv2xyz(u+du, v	  , sq[1]);
						this.uv2xyz(u+du, v+dv, sq[2]);
						this.uv2xyz(u	, v+dv, sq[3]);
						this.vertices[i] = sq;
						i += 1;
				}
			}
	}

	this.draw = function(g, w, h) {
			g.beginPath();
			for (var idx = 0; idx < this.vertices.length; idx++) {

				var initVtx = this.vertices[idx][0];
				var px = [];
				viewPort(initVtx, px, w, h);
				g.moveTo(px[0], px[1]);

				for (var v = 1; v < 4; v++) {
					var px = [];		
					viewPort(this.vertices[idx][v], px, w, h);
					g.lineTo(px[0], px[1]);
				}
			}
			g.fill();
			g.stroke();
	}
}

function SuperSphere() {
	this.xadj = 3.5;
	this.yadj = 4.5;
	this.nu = 40;
	this.nv = 40;
	this.vertices = [];
	this.vertices.length = this.nu * this.nv;

	this.uv2xyz = function(u, v, dst) {
		var theta = 2 * Math.PI * u;
		var phi   = Math.PI * v - Math.PI/2;
		var x = (Math.cos(phi) * Math.sin(theta));
		var y = Math.sin(phi);
		var z = (Math.cos(phi) * Math.cos(theta));
		var t = Math.pow(Math.pow(x,8) + Math.pow(y,2) + Math.pow(z,8), 1/8);
		x = x / t / this.xadj;
		y = y / t / this.yadj;
	   	z = z / t / this.xadj;	
		dst.set(x, y, z);
	}

	this.build = function (elapsed) {
			var du = 1 / this.nu;
			var dv = 1 / this.nv;
			var i = 0;
			for (var u = 0; u < .999; u += du) {
				for (var v = 0; v < .999; v += dv) {
						//square of 4 vertexes
						var sq = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
						this.uv2xyz(u	, v	  , sq[0]);
						this.uv2xyz(u+du, v	  , sq[1]);
						this.uv2xyz(u+du, v+dv, sq[2]);
						this.uv2xyz(u	, v+dv, sq[3]);
						this.vertices[i] = sq;
						i += 1;
				}
			}
	}

	this.draw = function(g, w, h) {
			g.beginPath();
			for (var idx = 0; idx < this.vertices.length; idx++) {

				var initVtx = this.vertices[idx][0];
				var px = [];
				viewPort(initVtx, px, w, h);
				g.moveTo(px[0], px[1]);

				for (var v = 1; v < 4; v++) {
					var px = [];		
					viewPort(this.vertices[idx][v], px, w, h);
					g.lineTo(px[0], px[1]);
				}
			}
			g.fill();
			g.stroke();
	}
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


function drawBorder(canvas, color, w, h) {
	canvas.strokeStyle = color;
	canvas.beginPath();
	canvas.moveTo(0,0);
	canvas.lineTo(w,0);
	canvas.lineTo(w,h);
	canvas.lineTo(0,h);
	canvas.lineTo(0,0);
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

function viewPort(pt, pix, w, h, f) {
	if (f == undefined) f = 1.0;
	var vtx = pVector(pt, f);
	pix[0] = (w / 2) + vtx.x * (w / 2);
	pix[1] = (h / 2) - vtx.y * (w / 2);
}

function drawLine(id, vec1, vec2) {

	var canvas = document.getElementById(id);
	var g = canvas.g;

	g.beginPath();

	pix1 = [0, 0];
	viewPort(vec1, pix1, canvas.width, canvas.height);

	pix2 = [0, 0];
	viewPort(vec2, pix2, canvas.width, canvas.height);

	g.moveTo(pix1[0], pix1[1]);
	g.lineTo(pix2[0], pix2[1]);

	g.fill();
	g.stroke();
}

function pVector(vtx, f) { 
	return vtx;
	//var x = vtx.x / f;
	//var y = vtx.y / f;
	//var z = vtx.z / f;
	//var x = (vtx.z == 0) ? 0 : (f * vtx.x) / vtx.z;
	//var y = (vtx.z == 0) ? 0 : (f * vtx.y) / vtx.z;
	//var z = (vtx.z == 0) ? 0 : (f / vtx.z);
	//return new Vector3(x, y, z);
}

//////////////////////////////////////////////////////////////
//  Noise function
/////////////////////////////////////////////////////////////

function Noise() {
   var abs = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = Math.abs(x[i]);
         return dst;
      };
   var add = function(x, y, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] + y[i];
         return dst;
      };
   var dot = function(x, y) {
         var z = 0;
         for (var i = 0 ; i < x.length ; i++)
            z += x[i] * y[i];
         return z;
      };
   var fade = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i]*x[i]*x[i]*(x[i]*(x[i]*6.0-15.0)+10.0);
         return dst;
      };
   var floor = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = Math.floor(x[i]);
         return dst;
      };
   var fract = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] - Math.floor(x[i]);
         return dst;
      };
   var gt0 = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] > 0 ? 1 : 0;
         return dst;
      };
   var lt0 = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] < 0 ? 1 : 0;
         return dst;
      };
   var mix = function(x, y, t, dst) {
         if (! Array.isArray(x))
            return x + (y - x) * t;
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] + (y[i] - x[i]) * t;
         return dst;
      };
   var mod289 = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] - Math.floor(x[i] * (1.0 / 289.0)) * 289.0;
         return dst;
      };
   var multiply = function(x, y, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] * y[i];
         return dst;
      };
   var multiplyScalar = function(x, s) {
         for (var i = 0 ; i < x.length ; i++)
            x[i] *= s;
         return x;
      };
   var permute = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            tmp0[i] = (x[i] * 34.0 + 1.0) * x[i];
         mod289(tmp0, dst);
         return dst;
      };
   var scale = function(x, s, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] * s;
         return dst;
      };
   var set3 = function(a, b, c, dst) {
         dst[0] = a;
         dst[1] = b;
         dst[2] = c;
         return dst;
      }
   var set4 = function(a, b, c, d, dst) {
         dst[0] = a;
         dst[1] = b;
         dst[2] = c;
         dst[3] = d;
         return dst;
      }
   var subtract = function(x, y, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = x[i] - y[i];
         return dst;
      };
   var taylorInvSqrt = function(x, dst) {
         for (var i = 0 ; i < x.length ; i++)
            dst[i] = 1.79284291400159 - 0.85373472095314 * x[i];
         return dst;
      };

   var HALF4 = [.5,.5,.5,.5];
   var ONE3  = [1,1,1];
   var f     = [0,0,0];
   var f0    = [0,0,0];
   var f1    = [0,0,0];
   var g0    = [0,0,0];
   var g1    = [0,0,0];
   var g2    = [0,0,0];
   var g3    = [0,0,0];
   var g4    = [0,0,0];
   var g5    = [0,0,0];
   var g6    = [0,0,0];
   var g7    = [0,0,0];
   var gx0   = [0,0,0,0];
   var gy0   = [0,0,0,0];
   var gx1   = [0,0,0,0];
   var gy1   = [0,0,0,0];
   var gz0   = [0,0,0,0];
   var gz1   = [0,0,0,0];
   var i0    = [0,0,0];
   var i1    = [0,0,0];
   var ix    = [0,0,0,0];
   var ixy   = [0,0,0,0];
   var ixy0  = [0,0,0,0];
   var ixy1  = [0,0,0,0];
   var iy    = [0,0,0,0];
   var iz0   = [0,0,0,0];
   var iz1   = [0,0,0,0];
   var norm0 = [0,0,0,0];
   var norm1 = [0,0,0,0];
   var nz    = [0,0,0,0];
   var nz0   = [0,0,0,0];
   var nz1   = [0,0,0,0];
   var tmp0  = [0,0,0,0];
   var tmp1  = [0,0,0,0];
   var tmp2  = [0,0,0,0];
   var sz0   = [0,0,0,0];
   var sz1   = [0,0,0,0];
   var t3    = [0,0,0];

   this.noise = function(P) {
         mod289(floor(P, t3), i0);
         mod289(add(i0, ONE3, t3), i1);
         fract(P, f0);
         subtract(f0, ONE3, f1);
         fade(f0, f);
   
         set4(i0[0], i1[0], i0[0], i1[0], ix );
         set4(i0[1], i0[1], i1[1], i1[1], iy );
         set4(i0[2], i0[2], i0[2], i0[2], iz0);
         set4(i1[2], i1[2], i1[2], i1[2], iz1);
   
         permute(add(permute(ix, tmp1), iy, tmp2), ixy);
         permute(add(ixy, iz0, tmp1), ixy0);
         permute(add(ixy, iz1, tmp1), ixy1);
   
         scale(ixy0, 1 / 7, gx0);
         scale(ixy1, 1 / 7, gx1);
         subtract(fract(scale(floor(gx0, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy0);
         subtract(fract(scale(floor(gx1, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy1);
         fract(gx0, gx0);
         fract(gx1, gx1);
         subtract(subtract(HALF4, abs(gx0, tmp1), tmp2), abs(gy0, tmp0), gz0);
         subtract(subtract(HALF4, abs(gx1, tmp1), tmp2), abs(gy1, tmp0), gz1);
         gt0(gz0, sz0);
         gt0(gz1, sz1);
   
         subtract(gx0, multiply(sz0, subtract(lt0(gx0, tmp1), HALF4, tmp2), tmp0), gx0);
         subtract(gy0, multiply(sz0, subtract(lt0(gy0, tmp1), HALF4, tmp2), tmp0), gy0);
         subtract(gx1, multiply(sz1, subtract(lt0(gx1, tmp1), HALF4, tmp2), tmp0), gx1);
         subtract(gy1, multiply(sz1, subtract(lt0(gy1, tmp1), HALF4, tmp2), tmp0), gy1);
   
         set3(gx0[0],gy0[0],gz0[0], g0);
         set3(gx0[1],gy0[1],gz0[1], g1);
         set3(gx0[2],gy0[2],gz0[2], g2);
         set3(gx0[3],gy0[3],gz0[3], g3);
         set3(gx1[0],gy1[0],gz1[0], g4);
         set3(gx1[1],gy1[1],gz1[1], g5);
         set3(gx1[2],gy1[2],gz1[2], g6);
         set3(gx1[3],gy1[3],gz1[3], g7);
   
         taylorInvSqrt(set4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3), tmp0), norm0);
         taylorInvSqrt(set4(dot(g4,g4), dot(g5,g5), dot(g6,g6), dot(g7,g7), tmp0), norm1);
   
         multiplyScalar(g0, norm0[0]);
         multiplyScalar(g1, norm0[1]);
         multiplyScalar(g2, norm0[2]);
         multiplyScalar(g3, norm0[3]);
   
         multiplyScalar(g4, norm1[0]);
         multiplyScalar(g5, norm1[1]);
         multiplyScalar(g6, norm1[2]);
         multiplyScalar(g7, norm1[3]);
   
         mix(set4(g0[0] * f0[0] + g0[1] * f0[1] + g0[2] * f0[2],
								                g1[0] * f1[0] + g1[1] * f0[1] + g1[2] * f0[2],
												               g2[0] * f0[0] + g2[1] * f1[1] + g2[2] * f0[2],
															                  g3[0] * f1[0] + g3[1] * f1[1] + g3[2] * f0[2], tmp1),
						 
						           set4(g4[0] * f0[0] + g4[1] * f0[1] + g4[2] * f1[2],
										                  g5[0] * f1[0] + g5[1] * f0[1] + g5[2] * f1[2],
														                 g6[0] * f0[0] + g6[1] * f1[1] + g6[2] * f1[2],
																		                g7[0] * f1[0] + g7[1] * f1[1] + g7[2] * f1[2], tmp2), f[2], nz);
   
         return 2.2 * mix(mix(nz[0],nz[2],f[1]), mix(nz[1],nz[3],f[1]), f[0]);
      };
};

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


