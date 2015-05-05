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
	this.size  = sz;		//vector2 of size
	this.xAxis = null;
	this.yAxis = null;
	this.border = null;
	this.series = [];
	this.factory = null;
	this.borderEps = 0.15;
	this.screenRangeX = null;
	this.screenRangeY = null;
	this.margin = 0.20;

	console.log('chart created');

	//border
	//backcolor
	this.init(type, loc, sz);
}

Chart.prototype = {
		
		init : function(type, loc, sz) {
			this.chartType = type;
			this.loc = loc;
			this.size = sz;
			this.createBorder();
			this.screenRangeX = new AxisRange(-sz.x/2+this.margin, sz.x/2-this.margin);
			this.screenRangeY = new AxisRange(-sz.y/2+this.margin, sz.y/2-this.margin);
			this.yAxis = new Axis('vertical', this);
			this.xAxis = new Axis('horizontal', this);
			//hack for now
			if (this.chartType == 'line') {
				this.yAxis.onlypositive = true;
				this.xAxis.onlypositive = true;
			}
			this.factory = new ChartRendererFactory();
		},

		createBorder : function () {
			var geom = new THREE.BoxGeometry(this.size.x+this.borderEps, this.size.y+this.borderEps, 0);
			var mat  = new THREE.MeshBasicMaterial( { color: 0x7e7e7e} );
			var cube = new THREE.Mesh(geom, mat);
			cube.position.set(this.loc.x-this.borderEps, this.loc.y+this.borderEps, 0);
			this.border = new THREE.EdgesHelper(cube, 0x7e7e7e);
		},

		addSeries: function(s) {
			var len = this.series.length;
			this.series[len] = s;
		},

		getScreenRange : function(side) {
			if (side == 'horizontal') {
				return this.screenRangeX;	
			}
			else if (side == 'vertical') {
				return this.screenRangeY;
			}
			return null;
		},

		getMargin: function() {
			return this.margin;	
		},

		_globalDataRangeX: function() {
			var min = 10000;
			var max = -10000;
			for (s = 0; s < this.series.length; s++)
			{
				xMax = this.series[s].maximumX();
				xMin = this.series[s].minimumX();
				min = Math.min(xMin, min);
				max = Math.max(xMax, max);
			}
			//return new THREE.Vector2(min, max);
			return new AxisRange(min, max);
		},

		_globalDataRangeY: function() {
			var min = 10000;
			var max = -10000;
			for (s = 0; s < this.series.length; s++)
			{
				yMax = this.series[s].maximumY();
				yMin = this.series[s].minimumY();
				min = Math.min(yMin, min);
				max = Math.max(yMax, max);
			}
			//return new THREE.Vector2(min, max);
			return new AxisRange(min, max);
		},


		render : function (scene) {

			//we will have different renderers based on the chart type - factory will return
			var renderer = this.factory.createRenderer(this.chartType);

			//we will have multiple series so have to find overall max/min
			var xRng = this._globalDataRangeX(); 
			var yRng = this._globalDataRangeY();

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

		var xScreenRng = chart.getScreenRange('horizontal');
		var yScreenRng = chart.getScreenRange('vertical');

		for (s = 0; s < chart.series.length; s++) {

			//color needs to be different for each
			var material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth:1.0, linecap:'bevel', linejoin:'bevel' });
			var geometry = new THREE.Geometry();

			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);
				
				//console.log(pt);
				//console.log('before: ' + pt.arg + ', ' + pt.val);

				var screenPt = pt.clone();
				//var x = chart.xAxis.axisRange.convertTo(xScreenRng, pt.arg);
				//var y = chart.yAxis.axisRange.convertTo(yScreenRng, pt.val);
				var x = chart.xAxis.convertPointToScreen(xScreenRng, pt.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, pt.val);

				screenPt.set(x, y);
				//console.log(screenPt);

				//console.log('after: ' + screenPt.arg + ', ' + screenPt.val);
				//first scale to the axis
				//pt.scale(chart.xAxis.)
				//then scale to the screen
				//pt.scale(xFactor, yFactor, 1);

				geometry.vertices.push(screenPt.getVector());

				var circle = screenPt.getDrawable();
				//console.log(circle);
				scene.add(circle);
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
			wMax = Math.abs(chart.series[s].maximumW());
			wMin = Math.abs(chart.series[s].minimumW());
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

		var xScreenRng = chart.getScreenRange('horizontal');
		var yScreenRng = chart.getScreenRange('vertical');

		xFactor = chart.xAxis.getScaleFactor();
		yFactor = chart.yAxis.getScaleFactor();

		wFactor = this._globalWeightFactor(chart);

		//console.log('x scale factor: ' + xFactor);
		//console.log('y scale factor: ' + yFactor);

		for (s = 0; s < chart.series.length; s++) {
			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);
				
				var screenPt = pt.clone();
				screenPt.scale(wFactor);

				var x = chart.xAxis.convertPointToScreen(xScreenRng, pt.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, pt.val);

				screenPt.set(x, y);

				var mesh = screenPt.getDrawable();
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
	this.buffer = 0; //buffer is a percentage
	this.padding = 0;
}

AxisRange.prototype = {

	init : function () {
	},

	getRange: function () {
		return this.upper - this.lower;
	},

	//normalize a value on this axis to the 0 -> 1 axis
	normalize: function(value) {
		//console.log('old axis lower: ' + this.lower);
		//console.log('old axis range: ' + this.getRange());
		return (value - this.lower) / this.getRange();
	},

	//convert point on this axis to the axis given
	convertTo : function(axisRng, value) {
		var normpt = this.normalize(value);
		//console.log('norm pt: ' + normpt);
		//console.log('new axis range: ' + axisRng.getRange());
		//console.log('new axis lower: ' + axisRng.lower);
		var newpt = normpt * axisRng.getRange()	+ axisRng.lower;
		return newpt;	
	},

	addBuffer : function(buffer) {
		this.buffer = buffer;
		this.upper = this.upper + (this.upper * buffer);
		this.lower = this.lower - (this.lower * buffer);
	},

	addPadding : function(padding) {
		this.padding = padding;
		this.upper = this.upper + padding;
		this.lower = this.lower - padding;
	}
}


/***********************************************************
 * Axis 
 ***********************************************************/
// pass position and length
var Axis = function(type, chart) {
	this.chartRef  = null;
	this.axisRange = null;
	this.dataRange = null;
	this.thickness = 2.0;
	this.unit = "";
	this.line = null;
	this.geometry = null;
	this.material = null;
	this.type = type;
	this.rangeMin = 0;
	this.rangeMax = 0;
	this.buffer = .10;
	this.padding= 1.0;
	this.onlypositive = false;
	this.init(type, chart);
}

Axis.prototype = { 

		init : function (type, chart) {
			this.type = type;
			if (chart !== 'undefined') {
				this.chartRef  = chart;
				this.axisRange = chart.getScreenRange(type);
			}
		},

		_create : function() {
		
			//var margin = this.chartRef.getMargin();
			var margin = 0;
			var start, end;
			if (this.type == 'vertical') {
				if (this.onlypositive == true) {
					
					var screenRng = this.chartRef.getScreenRange('horizontal');
					start = new THREE.Vector3(screenRng.lower+margin, this.axisRange.lower+margin, 0);
					end   = new THREE.Vector3(screenRng.lower+margin, this.axisRange.upper-margin, 0);
				}
				else {
					start = new THREE.Vector3(0, this.axisRange.lower, 0);
					end   = new THREE.Vector3(0, this.axisRange.upper, 0);
				}
			}
			else {
				if (this.onlypositive == true) {

					var screenRng = this.chartRef.getScreenRange('vertical');
					start = new THREE.Vector3(this.axisRange.lower+margin, screenRng.lower+margin, 0);
					end   = new THREE.Vector3(this.axisRange.upper-margin, screenRng.lower+margin, 0);
				}

				else {
					start = new THREE.Vector3(this.axisRange.lower, 0, 0);
					end   = new THREE.Vector3(this.axisRange.upper, 0, 0);
				}
			}
			this.material = new THREE.LineBasicMaterial( { color: 0x7e7e7e, linewidth:this.thickness});
			this.geometry = new THREE.Geometry();
			this.geometry.vertices.push( start, end );
			this.line = new THREE.Line( this.geometry, this.material );
		},

		setDataRange : function(rng) {
			this.dataRange = rng;
			this.dataRange.addPadding(this.padding);
			//this.axisRange = rng;
			var v1 = Math.abs(rng.lower);
			var v2 = Math.abs(rng.upper);
			var val = Math.max(v1, v2);
			this.rangeMin = -val * this.buffer*100.0;
			this.rangeMax = val * this.buffer*100.0;	
		},

		scalePoint: function(pt) {
			var newpt = pt.clone();
			//var x = this.
		},

		convertPointToScreen: function(screenRng, ptval) {
			var sp = this.dataRange.convertTo(screenRng, ptval);
			return sp;
		},

		getScaleFactor : function() {
			var range = this.rangeMax - this.rangeMin;
			return (this.axisRange.getRange() / range);
		},

		//render type, leave blank for whole axis
		//render fit will adjust the display just for the visible range 
		render : function (scene) {
			this._create();
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
			//if (pt.type !== this.type && pt.type !== 'basic')
			//	throw 'Exception: Point type does not match series type';
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
	this.tag = "";
	this.color = null;
	this.mesh = null;
	this.init(x, y, type);
}

SeriesPoint.prototype = {

		init : function(x, y, type) {
			this.arg = x;
			this.val = y;
			this.color = 0x0000ff;
		    	if (type !== undefined) this.type = type;
			var radius = 0.025;
			var geom = new THREE.CircleGeometry(radius, 32);
			var mat  = new THREE.MeshBasicMaterial({ color : this.color } );
			//ambient  : 0,
			//emissive : 0x0000ff,
			//color    : 0x0000ff,
			//specular : 0x101010,
			//shininess: 50 });
			this.mesh = new THREE.Mesh(geom, mat);
			//this.mesh.material.shading = THREE.SmoothShading;
		},

		set : function(arg, val) {
			this.arg = arg;
			this.val = val;		
		},

		clone : function() {
			var cln = new SeriesPoint(this.arg, this.val, this.type);
			cln.color = this.color;
			cln.tag = this.tag;	
			cln.mesh = this.mesh;
			return cln;
		},

		getDrawable: function() {
			this.mesh.position.set(this.arg, this.val, 0);
			return this.mesh;	
		},

		/*scale : function(xScale, yScale, wScale) {
			this.x = this.arg * xScale;
			this.y = this.val * yScale;
			if (this.mesh !== null) {
				this.mesh.position.set(this.x, this.y, 0);
			}
		},*/

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
	this.baserad = 0.10;
	this.type   = "bubble";
	this.weight = w;
	this.z = w;		//this is the scaled value
	this.init();
}

BubblePoint.prototype = Object.create(SeriesPoint.prototype);
BubblePoint.prototype.constructor = BubblePoint;

BubblePoint.prototype.init = function() {
	var geom = new THREE.SphereGeometry(this.baserad, 32, 32);
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
	if (wt !== 'undefined') {
		this.weight = wt;
	}
};

BubblePoint.prototype.scale = function(/*xScale, yScale,*/wScale) {
	//this.x = this.arg * xScale;
	//this.y = this.val * yScale;
	//this.mesh.position.set(this.x, this.y, 0);
	var middle = wScale / 2.0;		//the middle is our base radius
	//var normW = Math.sqrt(this.weight / wScale);
	var normW = Math.sqrt(this.weight / middle);
	console.log(normW);
	this.z = normW;
	this.mesh.scale.set(normW, normW, normW);
};

BubblePoint.prototype.clone = function() {
	var cln = new BubblePoint(this.arg, this.val, this.weight);
	cln.type = this.type;
	cln.color = this.color;
	cln.tag = this.tag;	
	cln.mesh = this.mesh;
	cln.z = this.z;
	return cln;
};

