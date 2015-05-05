//hammer visualization library
//
var HAMMER = HAMMER || {};




/***********************************************************
 * Chart 
 ***********************************************************/
//position and size
var Chart = function(type, loc, sz) {
	this.chartType = type;
	this.loc   = loc; 	//vector2 of upper left corner
	this.size  = sz;	//vector2 of size
	this.xAxis = null;
	this.yAxis = null;
	this.border = null;
	this.series = [];
	this.factory = null;
	this.borderEps = 0.15;
	this.screenRngX = null;
	this.screenRngY = null;

	console.log('chart created');

	//border
	//backcolor
	this.init();
};

Chart.prototype = {
		
		init : function() {
			this.createBorder();
			this.screenRngX = new AxisRange(this.loc.x-this.sz.x, this.loc.x);
			this.screenRngY = new AxisRange(this.loc.y, this.loc.y+this.sz.y);
			this.yAxis = new Axis('vertical', this);
			this.xAxis = new Axis('horizontal', this);
			this.factory = new ChartRendererFactory();
		},

		createBorder : function () {
			var geom = new THREE.BoxGeometry(this.size.x+this.borderEps, this.size.y+this.borderEps, 0);
			var mat  = new THREE.MeshBasicMaterial( { color: 0x7e7e7e} );
			var cube = new THREE.Mesh(geom, mat);
			cube.position.set(this.loc.x-this.borderEps, this.loc.y+this.borderEps, 0);
			this.border = new THREE.EdgesHelper(cube, 0x7e7e7e);
		},

		getScreenRange : function(side) {
			if (side == 'x' || side == 'horizontal') {
				return this.screenRangeX;	
			}
			else if (side == 'y' || side == 'vertical') {
				return this.screenRangeY;
			}
			return null;
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
			var renderer = this.factory.createRenderer(this.chartType);

			//we will have multiple series so have to find overall max/min
			xRng = this._globalRangeX(); 
			yRng = this._globalRangeY();

			this.xAxis.setDataRange(xRng);
			this.yAxis.setDataRange(yRng);

			renderer.draw(scene, this);
		}
};

/***********************************************************
 * ChartRendererFactory 
 ***********************************************************/
function ChartRendererFactory() {}
ChartRendererFactory.prototype.createRenderer = function createRenderer( chartType ) {
	
	var renderClass = null;
	if (chartType === 'bubble') {
		renderClass = new BubbleChartRenderer();
	}
	else if (chartType == 'line') {
		renderClass = new LineChartRenderer();	
	}

	return renderClass;
}

/***********************************************************
 * ChartRenderers - helper classes for rendering 
 * the chart components
 ***********************************************************/
/***********************************************************
 * LineChartRenderer 
 ***********************************************************/
var LineChartRenderer = function() {
}
LineChartRenderer.prototype = {

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

		for (s = 0; s < chart.series.length; s++) {

			//color needs to be different for each
			var material = new THREE.LineBasicMaterial( { color: 0x0000ff });
			var geometry = new THREE.Geometry();

			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);
				pt.scale(xFactor, yFactor, 1);

				geometry.vertices.push(pt.getDrawVector());

				//var mesh = pt.getDrawable();
				//scene.add(mesh);
			}

			var line = new THREE.Line(geometry, material);
			scene.add(line);
		}


	},

}

/***********************************************************
 * BubbleChartRenderer 
 ***********************************************************/
var BubbleChartRenderer = function() {
}

BubbleChartRenderer.prototype = {

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
 * AxisRange
 ***********************************************************/
var AxisRange = function(lower, upper) {
	this.lower = lower;
	this.upper = upper;	
};

AxisRange.prototype = {

	init : function () {
	},

	getRange: function () {
		return this.upper - this.lower;
	},

	//normalize a value on this axis to the 0 -> 1 axis
	normalize: function(value) {
		return (value - this.lower) / this.getRange();
	},

	//convert point on this axis to the axis given
	convertTo: function(axisRng, value) {
		val normpt = this.normalize(value);
		val newpt = normpt * axisRng.getRange()	+ axisRng.lower;
		return newpt;	
	},
}

/***********************************************************
 * Axis 
 ***********************************************************/
// pass position and length
var Axis = function(type, chart) {
	this.chartRef  = null;
	this.dataRng   = null;
	this.axisRng   = null;
	this.length = 0;;
	this.thickness = 2.0;
	this.unit = "";
	this.init();
	this.line = null;
	this.geometry = null;
	this.material = null;
	this.type = type;
	this.buffer = 1.5;
	this.autoscale = true;
	this.init(type, chart);
}

Axis.prototype = { 

		init : function (type, chart) {
			this.type = type;
			if (chart !== 'undefined') {
				this.chartRef = chart;
				this.axisRng = this.chartRef.getScreenRange(type);
				//initialize to the screen range if available
				this._create();
			}
		},

		_create: function () {
			if (this.axisRng !== null) { 
				this.material = new THREE.LineBasicMaterial( { color: 0x7e7e7e, linewidth:this.thickness});
				this.geometry = new THREE.Geometry();

				var start, end;
				var tmpRange;

				if (this.autoscale == true && this.dataRng != null) {
					tmpRange.upper = this.dataRng.upper;
					tmpRange.lower = this.dataRng.lower;
				}
				else {
					tmpRange.upper = this.axisRng.upper;
					tmpRange.lower = this.axisRng.lower;	
				}

				var screenRng = this.chartRef.getScreenRange(this.type);
				start = tmpRange.convertTo(tmpRange.

				if (type == 'vertical') {
					start = new THREE.Vector3(0, -this.axisRng.lower, 0);
					end   = new THREE.Vector3(0, this.axisRng.upper, 0);
				}
				else {
					start = new THREE.Vector3(-this.axisRng.lower, 0, 0);
					end   = new THREE.Vector3(this.axisRng.upper, 0, 0);
				}

				this.geometry.vertices.push( start, end );
				this.line = new THREE.Line( this.geometry, this.material );
			}
		},

		_getFitAxis : function() {
			var fitgeometry = new THREE.Geometry();
			fitgeometry.vertices.push( start, end );
			var fitline = new THREE.Line( fitgeometry, this.material );
			return fitline;	
		},

		setAxisRange : function(rng) {
			this.axisRng = rng;	
		},

		setDataRange : function(rng) {
			this.dataRng = new AxisRange(rng.x, rng.y);
			//var min = Math.abs(rng.x);
			//var max = Math.abs(rng.y);
			//var val = Math.max(v1, v2);
			//this.lowerBound = -val * this.buffer;
			//this.upperBound = val * this.buffer;	
		},

		getScaleFactor : function() {
			var range = this.rangeMax - this.rangeMin;
			return (this.length / range);
		},

		//render type, leave blank for whole axis
		//render fit will adjust the display just for the visible range 
		render : function (scene, type) {
			if (type == 'fit') {
				scene.add(this._getFitAxis());
			}
			else {
				scene.add(this.line);
			}
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
	this.maxX = -10000;
	this.minX = 10000;
	this.maxY = -10000;
	this.minY = 10000;
	this.maxW = -10000;
	this.minW = 10000;
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
			if (pt.type !== this.type && pt.type !== 'basic')
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
var SeriesPoint = function(x, y, type) {
	this.type = 'basic';
	this.arg = x;	//these are the actual values
	this.val = y;	//these are the actual values
	this.x   = x;	//these are the scaled values for drawing
	this.y	 = y;	//these are the scaled valeus for drawing
	this.tag = "";
	this.color = null;
	this.mesh = null;
	this.init(type);
}

SeriesPoint.prototype = {

		init : function(type) {
		    if (type !== undefined) this.type = type;
			color = 0x0000ff;
		},

		set : function(arg, val) {
			this.arg = arg;
			this.val = val;		
		},

		getDrawable: function() {
			return this.mesh;	
		},

		scale : function(xScale, yScale, wScale) {
			this.x = this.arg * xScale;
			this.y = this.val * yScale;
			if (this.mesh !== null) {
				this.mesh.position.set(this.x, this.y, 0);
			}
		},

		getVector: function() {
			return new THREE.Vector3(this.arg, this.val, 0);
		},

		getDrawVector: function() {
			return new THREE.Vector3(this.x, this.y, 0);
		}

};


/***********************************************************
 * Bubble Point - x, y, w
 ***********************************************************/
var BubblePoint = function(x, y, w) {
	SeriesPoint.call(this, x, y);
	this.type   = "bubble";
	this.weight = w;
	this.z = w;		//this is the scaled value
	this.init();
}

BubblePoint.prototype = Object.create(SeriesPoint.prototype);
BubblePoint.prototype.constructor = BubblePoint;

BubblePoint.prototype.init = function() {
	var radius = 0.25;
	var geom = new THREE.SphereGeometry(radius, 32, 32);
	var mat  = new THREE.MeshPhongMaterial({
		ambient  : 0,
		emissive : 0x0000ff,
		color    : 0x0000ff,
		specular : 0x101010,
		shininess: 50 });
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.material.shading = THREE.SmoothShading;
};

BubblePoint.prototype.set = function(arg, val, wt) {
	this.arg = arg;
	this.val = val;
	this.weight = wt;
};

BubblePoint.prototype.scale = function(xScale, yScale, wScale) {
	this.x = this.arg * xScale;
	this.y = this.val * yScale;
	this.mesh.position.set(this.x, this.y, 0);
	var normW = Math.sqrt(this.weight / wScale);
	console.log(normW);
	this.z = normW;
	this.mesh.scale.set(normW, normW, normW);
};


