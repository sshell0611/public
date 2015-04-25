//hammer visualization library
//
var HAMMER = HAMMER || {};

/***********************************************************
 * Chart 
 ***********************************************************/
//position and size
var Chart = function(loc, sz) {
	this.loc   = loc; 	//vector2 of upper left corner
	this.size  = sz;		//vector2 of size
	this.xaxis = null;
	this.yaxis = null;
	this.border = null;

	console.log('chart created');

	//border
	//backcolor
	this.init();
};

Chart.prototype = {
		
		init : function() {
			this.createBorder();
			this.yaxis = new Axis('vertical', this.size.y);
			this.xaxis = new Axis('horizontal', this.size.x);
		},

		createBorder : function () {
			var geom = new THREE.BoxGeometry(this.size.x, this.size.y, 0);
			var mat  = new THREE.MeshBasicMaterial( { color: 0x000000 } );
			var cube = new THREE.Mesh(geom, mat);
			cube.position.set(this.loc.x, this.loc.y, 0);
			this.border = new THREE.EdgesHelper(cube, 0x000000);
		},

		render : function (scene) {

			console.log('rendering the chart')
			//render border
			scene.add(this.border);
			//render axes
			this.xaxis.render(scene);
			this.yaxis.render(scene);
		}
};


/***********************************************************
 * Axis 
 ***********************************************************/
// pass position and length
var Axis = function(type, length) {
	this.length = length;
	this.thickness = 1;
	this.unit = "";
	this.init();
	this.line = null;
	this.geometry = null;
	this.material = null;
	this.type = type;
	this.init(type);
}

Axis.prototype = { 

		init : function (type) {

			var start, end;
			if (type == 'vertical') {
				start = new THREE.Vector3(0, -this.length/2, 0);
				end   = new THREE.Vector3(0, this.length/2, 0);
			}
			else {
				start = new THREE.Vector3(-this.length/2, 0, 0);
				end   = new THREE.Vector3(this.length/2, 0, 0);
			}

			this.material = new THREE.LineBasicMaterial( { color: 0x000000});
			this.geometry = new THREE.Geometry();
			this.geometry.vertices.push( start, end );
			this.line = new THREE.Line( this.geometry, this.material );
		}

		,

		render : function (scene) {
			scene.add(this.line);
		}

		,

		update : function () {
		}

};



