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

		 minus : function(v) {

				 return new Vector3(this.x-v.x, this.y-v.y, this.z-v.z);
		 
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

		multiplyV4: function(v) {
			var arr = [v.x, v.y, v.z, v.w];
			var res = [0, 0, 0, 0];
			for (r = 0; r < this.rows; r++) {
				var ip = 0;
				for (c = 0; c < this.cols; c++) {
					ip = ip + (this.get(r,c) * arr[c]);
				}
				res[r] = ip;
			}
			return new Vector4(res[0], res[1], res[2], res[3]);
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

		translate: function(v) {
				var T = new Matrix();
				T.identity();
				T.set(0,3,v.x);
				T.set(1,3,v.y);
				T.set(2,3,v.z);
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

		rotateY_old: function(theta) {
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
				var R = new Matrix();
				R.set(0,0, c);
				R.set(0,1,-s);
				R.set(1,0, s);
				R.set(1,1, c);
				this.multiply(R);
				return this.clone();
			},

		rotateZ_old: function(theta) {
				var s = Math.sin(theta);
				var c = Math.cos(theta);
				this.set(0,0, c);
				this.set(0,1,-s);
				this.set(1,0, s);
				this.set(1,1, c);
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
// Spline class 
/////////////////////////////////////////////////////////////

function Spline(ctrlPoints, steps, match) {
	this.points = [];
	this.steps  = 10;
	this.matchDeriv = true;
	this.init(ctrlPoints, steps, match);
}

Spline.prototype = {

		init: function(ctrlPoints, steps, match) {
			this.steps = steps;
			this.matchDeriv = match;	
			this.build(ctrlPoints);
		},

		build: function(ctrlPoints) {

			this.points = [];
			var len = ctrlPoints.length;

			if (len < 2)
				throw 'not enough points'

			var H = hermiteMatrix();
			var tension = 1;

			var p = 0;
			for (k = 1; k < len; k++) { 

				var p_km1 = ctrlPoints[k-1];
				var p_k   = ctrlPoints[k];
				var p_kp1 = (k == len-1) ? ctrlPoints[k]: ctrlPoints[k+1];

				//find derivatives here
				var p1x = (k==1) ? 0 : tension * (p_k.x - p_km1.x);
				var p1y = (k==1) ? 0 : tension * (p_k.y - p_km1.y);
				//var p1x =  tension * (p_k.x - p_km1.x);
				//var p1y =  tension * (p_k.y - p_km1.y);
				var p2x = (k == len-1) ? 1 : tension * (p_kp1.x - p_k.x);
				var p2y = (k == len-1) ? 1 : tension * (p_kp1.y - p_k.y);

				if (this.matchDeriv == true)
				{
					if (k > 1)
					{
						p2x = p1x;
						p2y = p2y;
					}
				}

				//var xvec = new Vector4(p_km1.x, p_k.x, p_km1.z, p_k.z);
				//var yvec = new Vector4(p_km1.y, p_k.y, p_km1.z, p_k.z);
				var xvec = new Vector4(p_km1.x, p_k.x, p1x, p2x);
				var yvec = new Vector4(p_km1.y, p_k.y, p1y, p2y);

				//testing hermite interpolation
				for (i = 0; i <= this.steps; ++i)
				{
					var t = i/this.steps;
					var x_abcd = H.multiplyV4(xvec);
					var y_abcd = H.multiplyV4(yvec);
					var xval = hermitePoly(x_abcd.x, x_abcd.y, x_abcd.z, x_abcd.w, t);
					var yval = hermitePoly(y_abcd.x, y_abcd.y, y_abcd.z, y_abcd.w, t);
					var pt = new Vector3(xval, yval, 1);
					this.points[p] = pt;
					p = p+1;
				}	
			}
		
		},

		draw: function(id) {

			drawLines(id, this.points, 1);
		},

		getPoint: function(i) {
		
			idx = Math.floor(i % this.points.length);
			return this.points[idx];
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
				var vtx4 = new Vector3(x-hsz, y-hsz, z+hsz);
				var vtx5 = new Vector3(x+hsz, y-hsz, z+hsz);
				var vtx6 = new Vector3(x-hsz, y+hsz, z+hsz);
				var vtx7 = new Vector3(x+hsz, y+hsz, z+hsz);
				this.vertices = [vtx0, vtx1, vtx2, vtx3, vtx4, vtx5, vtx6, vtx7];
				this.edges    = [ 
								 [0,1], [1,3], [3,2], [2,0],
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

function Sphere() {
	this.xadj = 5.5;
	this.yadj = 5.5;
	this.nu = 50;
	this.nv = 50;
	this.vertices = [];
	this.vertices.length = this.nu * (this.nv-1);

	this.uv2xyz = function(u, v, dst) {
		var angle = 2 * time;
		var theta = 2 * Math.PI * u;
		var phi   = Math.PI * v - Math.PI/2;
		var x = (Math.cos(phi) * Math.sin(theta)) /this.xadj + Math.cos(angle) * 0.05;
		var y = Math.sin(phi) / this.yadj + 0.17;
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

	//console.log(x); 
	//console.log(y);

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

function drawCube(shape, canvas, w, h, f) {

	canvas.strokeStyle = shape.getBorder();
	//canvas.fillStyle = shape.getFill();

	//move to the first vertex
	canvas.beginPath();

	var vtx1 = shape.getVertex(0);
	var pix = [];
	viewPortPers(vtx1, pix, w, h, f);
	var x = pix[0];
	var y = pix[1];

	canvas.moveTo(x, y);

	//loop through all of the edges
	for (e=0; e < shape.numEdges(); e++)
	{
		var edge = shape.getEdge(e);
		var vtx  = shape.getVertex(edge[1]);

		var pix  = [];
		viewPortPers(vtx, pix, w, h, f);
		var x = pix[0];
		var y = pix[1];
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

function viewPortPers(pt, pix, w, h, f) {
	if (f == undefined) f = 1.0;
	var vtx = persVector(pt, f);
	pix[0] = (w / 2) + vtx.x * (w / 2);
	pix[1] = (h / 2) - vtx.y * (w / 2);
}

function viewPortVec(pt, pix, w, h, f) {
	if (f == undefined) f = 1.0;
	var vtx = pVector(pt, f);
	pix.x = (w / 2) + vtx.x * (w / 2);
	pix.y = (h / 2) - vtx.y * (w / 2);
	pix.z = 1;
}

function windowToCanvas(canvas, x, y) {
	var bbox = canvas.getBoundingClientRect();
	return { x: x - bbox.left * (canvas.width  / bbox.width),
			 y: y - bbox.top  * (canvas.height / bbox.height)
		   };
}

function viewToPoint(canvas, x, y) {
	var pix = windowToCanvas(canvas, x, y);
	var w = canvas.width;
	var h = canvas.height;
	return { x : ((2 * pix.x) / w) - 1, 
			 y : (h/w) - ((2 * pix.y) / w)
			};
}

function drawLines(id, pts, oridelw) {

	var canvas = document.getElementById(id);
	var g = canvas.g;

	var lw = g.lw;

	g.lineWidth = 2;
	if (oridelw !== undefined) g.lineWidth = oridelw;

	g.beginPath();

	var px = new Vector3(0,0,0);
	viewPortVec(pts[0], px, canvas.width, canvas.height);

	g.moveTo(px.x, px.y);

    for(i=1; i < pts.length; i+=1)  {
		var px = new Vector3(0,0,0);
		viewPortVec(pts[i], px, canvas.width, canvas.height);
		g.lineTo(px.x, px.y);

	}

	g.fill();
	g.stroke();

	g.lineWidth = lw;
}

function drawPoint(id, pt) {

	var canvas = document.getElementById(id);
	var g = canvas.g;

	var pix = new Vector3(0,0,0);
	viewPortVec(pt, pix, canvas.width, canvas.height);
	g.beginPath();
	g.arc(pix.x, pix.y, 1, 0, 2*Math.PI, true);
	g.stroke();
}

function drawPoints(id, points, selIdx) {
	
	var canvas = document.getElementById(id);
	var g = canvas.g;

	for (i = 0; i < points.length; ++i)
	{
		g.strokeStyle = (i == selIdx) ? 'red' : 'black';
		drawPoint(id, points[i]);
	}
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

function persVector(vtx, f) { 
	var x = vtx.x / f;
	var y = vtx.y / f;
	var z = vtx.z / f;
	var x = (vtx.z == 0) ? 0 : (f * vtx.x) / vtx.z;
	var y = (vtx.z == 0) ? 0 : (f * vtx.y) / vtx.z;
	var z = (vtx.z == 0) ? 0 : (f / vtx.z);
	return new Vector3(x, y, z);
}

function hermiteMatrix() {

	var H = new Matrix();
	//row 1
	H.set(0, 0, 2);
	H.set(0, 1, -2);
	H.set(0, 2, 1);
	H.set(0, 3, 1);
	//row 2
	H.set(1, 0, -3);
	H.set(1, 1, 3);
	H.set(1, 2, -2);
	H.set(1, 3, -1);
	//row 3
	H.set(2, 0, 0);
	H.set(2, 1, 0);
	H.set(2, 2, 1);
	H.set(2, 3, 0);
	//row 4
	H.set(3, 0, 1);
	H.set(3, 1, 0);
	H.set(3, 2, 0);
	H.set(3, 3, 0);

	return H;
}

function hermitePoly(a, b, c, d, t) {

		var outval = a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + d;
		return outval;

}

function drawCubicSpline(id, points, n, matchDeriv) {

		var len = points.length;

		if (len < 2)
			throw 'not enough points'

		var H = hermiteMatrix();
		var canvas = document.getElementById(id);
		var g = canvas.g;

		var p0 = points[0];
		var pN = points[len-1];
		var tension = 1;

		for (k = 1; k < len; k++) { 

			var p_km1 = points[k-1];
			var p_k   = points[k];
			var p_kp1 = (k == len-1) ? points[k]: points[k+1];

			//find derivatives here
			var p1x = (k==1) ? 0 : tension * (p_k.x - p_km1.x);
			var p1y = (k==1) ? 0 : tension * (p_k.y - p_km1.y);
			//var p1x =  tension * (p_k.x - p_km1.x);
			//var p1y =  tension * (p_k.y - p_km1.y);
			var p2x = (k == len-1) ? 1 : tension * (p_kp1.x - p_k.x);
			var p2y = (k == len-1) ? 1 : tension * (p_kp1.y - p_k.y);

			if (matchDeriv == true)
			{
				if (k > 1)
				{
					p2x = p1x;
					p2y = p2y;
				}
			}

			//var xvec = new Vector4(p_km1.x, p_k.x, p_km1.z, p_k.z);
			//var yvec = new Vector4(p_km1.y, p_k.y, p_km1.z, p_k.z);
			var xvec = new Vector4(p_km1.x, p_k.x, p1x, p2x);
			var yvec = new Vector4(p_km1.y, p_k.y, p1y, p2y);

			//testing hermite interpolation
			var ptArr = [];
			for (i = 0; i <= n; ++i)
			{
				var t = i/n;
				var x_abcd = H.multiplyV4(xvec);
				var y_abcd = H.multiplyV4(yvec);
				var xval = hermitePoly(x_abcd.x, x_abcd.y, x_abcd.z, x_abcd.w, t);
				var yval = hermitePoly(y_abcd.x, y_abcd.y, y_abcd.z, y_abcd.w, t);
				var pt = new Vector3(xval, yval, 1);
				ptArr[i-1] = pt;

			}

			drawLines(id, ptArr);

		}
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
	   canvas.oncontextmenu = function(e) { e.preventDefault(); }
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


