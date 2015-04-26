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
	this.xAxis = null;
	this.yAxis = null;
	this.border = null;
	this.series = [];

	console.log('chart created');

	//border
	//backcolor
	this.init();
};

Chart.prototype = {
		
		init : function() {
			this.createBorder();
			this.yAxis = new Axis('vertical', this.size.y);
			this.xAxis = new Axis('horizontal', this.size.x);
		},

		createBorder : function () {
			var geom = new THREE.BoxGeometry(this.size.x, this.size.y, 0);
			var mat  = new THREE.MeshBasicMaterial( { color: 0x7e7e7e} );
			var cube = new THREE.Mesh(geom, mat);
			cube.position.set(this.loc.x, this.loc.y, 0);
			this.border = new THREE.EdgesHelper(cube, 0x7e7e7e);
		},

		addSeries: function(s) {
			var len = this.series.length;
			this.series[len] = s;
		},

		_globalRangeX: function() {
			var min = 10000;
			var max = -10000;
			for (s = 0; s < this.series.length; s++)
			{
				xMax = this.series[s].maximumX();
				xMin = this.series[s].minimumX();
				min = Math.min(xMin, min);
				max = Math.max(xMax, max);
			}
			return new THREE.Vector2(min, max);
		},

		_globalRangeY: function() {
			var min = 10000;
			var max = -10000;
			for (s = 0; s < this.series.length; s++)
			{
				yMax = this.series[s].maximumY();
				yMin = this.series[s].minimumY();
				min = Math.min(yMin, min);
				max = Math.max(yMax, max);
			}
			return new THREE.Vector2(min, max);
		},


		render : function (scene) {

			//we will have different renderers based on the chart type - factory will return
			var renderer = new ChartRenderer();

			//we will have multiple series so have to find overall max/min
			xRng = this._globalRangeX(); 
			yRng = this._globalRangeY();

			this.xAxis.setRange(xRng);
			this.yAxis.setRange(yRng);

			renderer.draw(scene, this);
		}
};

/***********************************************************
 * ChartRenderer - helper class for rendering 
 * the chart components
 ***********************************************************/
var ChartRenderer = function() {

}

ChartRenderer.prototype = {

	_globalWeightFactor: function(chart) {
		var min = 10000;
		var max = -10000;
		for (s = 0; s < chart.series.length; s++)
		{
			wMax = chart.series[s].maximumW();
			wMin = chart.series[s].minimumW();
			min = Math.min(wMin, min);
			max = Math.max(wMax, max);
		}
		return (max - min);
	},

	draw : function(scene, chart) {

		console.log('drawing the chart')

		//render border
		scene.add(chart.border);
		//render axes
		chart.xAxis.render(scene);
		chart.yAxis.render(scene);
		//render series

		xFactor = chart.xAxis.getScaleFactor();
		yFactor = chart.yAxis.getScaleFactor();

		wFactor = this._globalWeightFactor(chart);

		console.log('x scale factor: ' + xFactor);
		console.log('y scale factor: ' + yFactor);

		for (s = 0; s < chart.series.length; s++) {
			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);
				pt.scale(xFactor, yFactor, wFactor);
				var mesh = pt.getDrawable();
				scene.add(mesh);
			}
		}

	},

}

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
	this.rangeMin = 0;
	this.rangeMax = 0;
	this.buffer = 1.5;
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

			this.material = new THREE.LineBasicMaterial( { color: 0x7e7e7e});
			this.geometry = new THREE.Geometry();
			this.geometry.vertices.push( start, end );
			this.line = new THREE.Line( this.geometry, this.material );
		},

		setRange : function(rng) {
			var v1 = Math.abs(rng.x);
			var v2 = Math.abs(rng.y);
			var val = Math.max(v1, v2);
			this.rangeMin = -val * this.buffer;
			this.rangeMax = val * this.buffer;	
		},

		getScaleFactor : function() {
			var range = this.rangeMax - this.rangeMin;
			return (this.length / range);
		},

		render : function (scene) {
			scene.add(this.line);
		},

		update : function () {
		}

};


/***********************************************************
 * Series - really just a container for points
 ***********************************************************/
var Series = function(name, type) {
	this.name = name;
	this.type = type;
	this.points = [];
	this.maxX = 0;
	this.minX = 0;
	this.maxY = 0;
	this.minY = 0;
	this.maxW = 0;
	this.minW = 0;
	this.init();
	//dictionary <tag, index>
}

Series.prototype = {
	
		init : function(type) {
		},

		//it's more efficient to do this at the time the point is added/updated
		_evaluateMaxMin: function(pt) {
			if (pt.val > this.maxY)	 { this.maxY = pt.val; }
			if (pt.val < this.minY)  { this.minY = pt.val; }
			if (pt.arg > this.maxX)	 { this.maxX = pt.arg; }
			if (pt.arg < this.minX)  { this.minX = pt.arg; }
			if (pt.type == "bubble")
			{
				if (pt.weight > this.maxW)	{ this.maxW = pt.weight; }
				if (pt.weight < this.minW)  { this.minW = pt.weight; }
			}
		},

		add: function(pt) {
			if (pt.type !== this.type)
				throw 'Exception: Point type does not match series type';
			var len = this.points.length;	
			this.points[len] = pt;
			this._evaluateMaxMin(pt);
		},

		addPoints: function(pts) {
			for (p = 0; p < pts.length; ++p)	
				this.add(pts[p]);
		},

		maximumX : function() {
			return this.maxX;	
		},
		minimumX : function() {
			return this.minX;	
		},
		maximumY : function() {
			return this.maxY;	
		},
		minimumY : function() {
			return this.minY;	
		},
		maximumW : function() {
			return this.maxW;	
		},
		minimumW : function() {
			return this.minW;	
		},
		getPoint : function(idx) {
			if (idx >= this.numPoints())
				throw 'Exception: invalid point'
			return this.points[idx];
		},
		numPoints : function() {
			return this.points.length;
		}

};


/***********************************************************
 * Series point base class
 ***********************************************************/
var SeriesPoint = function(x, y) {
	this.type = "basic";
	this.arg = x;
	this.val = y;
	this.tag = "";
	this.color = "";
	this.mesh = null;
	this.init();
}

SeriesPoint.prototype = {

		init : function() {
		},

		set : function(arg, val) {
			this.arg = arg;
			this.val = val;		
		},

		getDrawable: function() {
			return this.mesh;	
		},

		scale : function(xScale, yScale, wScale) {
			this.mesh.position.set(this.arg*xScale, this.val*yScale, 0);
		},

};


/***********************************************************
 * Bubble Point - x, y, w
 ***********************************************************/
var BubblePoint = function(x, y, w) {
	SeriesPoint.call(this, x, y);
	this.type   = "bubble";
	this.weight = w;
	this.init();
}

BubblePoint.prototype = Object.create(SeriesPoint.prototype);
BubblePoint.prototype.constructor = BubblePoint;

BubblePoint.prototype.init = function() {
	var radius = 0.25;
	var geom = new THREE.SphereGeometry(radius, 50, 50);
	var mat  = new THREE.MeshNormalMaterial();
	this.mesh = new THREE.Mesh(geom, mat);
};

BubblePoint.prototype.set = function(arg, val, wt) {
	this.arg = arg;
	this.val = val;
	this.weight = wt;
};

BubblePoint.prototype.scale = function(xScale, yScale, wScale) {
	this.mesh.position.set(this.arg*xScale, this.val*yScale, 0);
	var normW = Math.sqrt(this.weight / wScale);
	console.log(normW);
	this.mesh.scale.set(normW, normW, normW);
};


