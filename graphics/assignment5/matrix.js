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

