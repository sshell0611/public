//hammer visualization library
//
var HAMMER = HAMMER || {};


function guid(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
    return uuid;
};


/***********************************************************
 * Chart 
 ***********************************************************/
//position and size
var Chart = function(type, loc, sz, scene) {
	this.chartType = type;
	this.loc   = loc; 	//vector2 of upper left corner
	this.size  = sz;		//vector2 of size
	this.xAxis = null;
	this.yAxis = null;
	this.border = null;
	this.series = [];
	this.renderer = null;
	this.borderEps = 0.15;
	this.screenRangeX = null;
	this.screenRangeY = null;
	this.margin = 0.20;
	this.objects = [];
	this.objectMap = {};
	this.sceneRef = null;
	this.dimensionMap = [];
	console.log('chart created');
	this.init(type, loc, sz, scene);
}

Chart.prototype = {
		
		init : function(type, loc, sz, scene) {
			this.chartType = type;
			this.loc = loc;
			this.size = sz;
			this.createBorder();
			this.screenRangeX = new AxisRange(-sz.x/2+this.margin, sz.x/2-this.margin);
			this.screenRangeY = new AxisRange(-sz.y/2+this.margin, sz.y/2-this.margin);
			this.yAxis = new Axis('vertical', this);
			this.xAxis = new Axis('horizontal', this);
			if (scene !== 'undefined') { this.sceneRef = scene; }
			//hack for now
			if (this.chartType.indexOf("line") > -1) {
				this.yAxis.onlypositive = true;
				this.yAxis.tickmarks.ignoreFirst = true;
				this.xAxis.onlypositive = true;
				this.xAxis.tickmarks.ignoreFirst = true;
			}
			var factory = new ChartRendererFactory();
			this.renderer = factory.createRenderer(this.chartType);
		},

		createBorder : function () {
			var geom = new THREE.BoxGeometry(this.size.x+this.borderEps, this.size.y+this.borderEps, 0);
			var mat  = new THREE.MeshBasicMaterial( { color: 0x7e7e7e} );
			var cube = new THREE.Mesh(geom, mat);
			//cube.position.set(this.loc.x-this.borderEps, this.loc.y+this.borderEps, 0);
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

		getObjects: function() {
			return this.objects;	
		},

		getObject: function (uid) {

			for (var i =0; i < this.objects.length; ++i) {

				var objuid = this.objectMap[i];
				if (objuid == uid) {
					return this.objects[i];
				}
			}
		
			return null;
		},

		addObject: function(obj, uid) {
			var len = this.objects.length;
			this.objects.push(obj);
			this.objectMap[len] = uid;
		},

		onObjectClicked: function(idx) {
	
			this.renderer.onObjectClicked(this, idx);

		},

		onClick: function() {

			this.renderer.onClick(this);
			/*for (s = 0; s < this.series.length; ++s) {
				for (p = 0; p < this.series[s].points.length; ++p) {
					var pt = this.series[s].points[p];
					pt.clearFormatting();
				}
			}*/
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
			for (var s = 0; s < this.series.length; s++)
			{
				yMax = this.series[s].maximumY();
				yMin = this.series[s].minimumY();
				min = Math.min(yMin, min);
				max = Math.max(yMax, max);
			}
			//return new THREE.Vector2(min, max);
			return new AxisRange(min, max);
		},

		defineDimension: function(n, def) {
			this.dimensionMap[n] = def;
		},

		//hard coded for now
		getStaticDimensions: function() {
			if (this.dimensionMap.length == 0) {
				return null;
			}
			return {0:'Texture'};
		},

		//hard coded for now
		getDynamicDimensions: function() {
			if (this.dimensionMap.length < 2) {
				return null;
			}
			return {1:'Rotation'};
		},

		getDimensionDataRange: function(dim) {
			var min = 10000;
			var max = -10000;
			if (this.dimensionMap.length > dim)	 {
				for (var s = 0; s < this.series.length; s++) {
					var dMax = this.series[s].dimensionMax(dim);
					var dMin = this.series[s].dimensionMin(dim);
					min = Math.min(dMin, min);
					max = Math.max(dMax, max);
				}
				return new AxisRange(min, max);
			}
			return null;
		},

		render : function (scene) {

			//we will have multiple series so have to find overall max/min
			var xRng = this._globalDataRangeX(); 
			var yRng = this._globalDataRangeY();

			this.xAxis.setDataRange(xRng);
			this.yAxis.setDataRange(yRng);

			this.renderer.draw(scene, this);
		},

		update: function (scene, time){
		
			this.renderer.update(scene, this, time);
		},

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
	else if (chartType == 'line_evolution_decay') {
		renderClass = new LineEvolutionChartRenderer();	
		renderClass.decay = true;
	}
	else if (chartType == 'line_evolution') {
		renderClass = new LineEvolutionChartRenderer();	
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

			var series = chart.series[s];
			//color needs to be different for each
			var material = new THREE.LineBasicMaterial( { color: series.color, linewidth:2.0, linecap:'bevel', linejoin:'bevel' });
			var geometry = new THREE.Geometry();

			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);
				//pt.color = series.color;

				var screenPt = pt.clone();
				var x = chart.xAxis.convertPointToScreen(xScreenRng, pt.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, pt.val);

				screenPt.set(x, y);
				geometry.vertices.push(screenPt.getVector());

				var circle = screenPt.getDrawable();
				scene.add(circle);
			}

			var line = new THREE.Line(geometry, material);
			scene.add(line);
		}
	},

	onObjectClicked : function(chart, idx) {
	
	},

	onClick : function(chart) {
	
	},

	update : function(scene, chart, time) {
	
	}


}

/***********************************************************
 * LineEvolutionChartRenderer 
 ***********************************************************/
var LineEvolutionChartRenderer = function() {
	this.index = 0;
	this.animOptions = null;
	this.decay = false;
	this.init();
}

LineEvolutionChartRenderer.prototype = {

	init: function() {

		this.animOptions = { duration: 3000
							};
	},

	fadeLoop: function(idx, chartOptions, seriesArr) {


		//draw the first one
		var renderer = this;
		var animOptions = this.animOptions;
		s = idx;
		var len = seriesArr.length;
		var fadeOutOpts = {duration:2000, decay:false, lowbound:0.1};
		if (this.decay == true) {
			fadeOutOpts = {duration:2000, decay:true, idx:s-1, n:len, lambda:0.25, lowbound: 0.1, c:1};
		}
		var last = (len == s+1);

		seriesArr[s-1].fadeOut(chartOptions, fadeOutOpts, function(){ 

				seriesArr[s].fadeIn(chartOptions, animOptions, last, function() {
					s++;
					if (s < seriesArr.length) {
						renderer.fadeLoop(s, chartOptions, seriesArr);
					}
				
				});
		
		});

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

		var options = { 'scene': scene, 
						'xAxis': chart.xAxis,
						'yAxis': chart.yAxis,
						'xRange': xScreenRng, 
						'yRange': yScreenRng};

		if (chart.series.length > 1) {
	
			var series = chart.series[0];	
			series.draw(scene, chart.xAxis, chart.yAxis, xScreenRng, yScreenRng);

			this.index = 1;

			this.fadeLoop(1, options, chart.series);
		}
	},

	onObjectClicked : function(chart, idx) {
	
	},

	onClick : function(chart) {
	
	},

	update : function(scene, chart, time) {
	
	}

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

		wFactor = this._globalWeightFactor(chart);
		var staticdim = chart.getStaticDimensions();
		var dFactor = 1;
		if (staticdim !== null) {
			var drng = chart.getDimensionDataRange(0);
			dFactor = drng.upper - drng.lower;
			//console.log(drng.upper + " " + drng.lower + " " + dFactor);
		}

		var dyndim = chart.getDynamicDimensions();
		var dynRng = null;
		if (dyndim !== null) {
			dynRng = chart.getDimensionDataRange(1);
		}

		for (s = 0; s < chart.series.length; s++) {
			for (p = 0; p < chart.series[s].numPoints(); p++) {
				var pt = chart.series[s].getPoint(p);

				var screenPt = pt.clone();
				screenPt.scale(wFactor);

				var x = chart.xAxis.convertPointToScreen(xScreenRng, pt.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, pt.val);

				screenPt.set(x, y);

				if (staticdim !== null) {
					pt.applyDimension(0, staticdim[0], dFactor);
					screenPt.applyDimension(0, staticdim[0], dFactor);
					screenPt.applyDimension(1, dyndim[1], dynRng);
					pt.applyDimension(1, dyndim[1], dynRng);
				}

				var mesh = screenPt.getDrawable();
				scene.add(mesh);

				chart.addObject(mesh, screenPt.guid);
			}
		}
	},

	onObjectClicked : function(chart, idx) {

		var scene = chart.sceneRef;

		if (idx < chart.objects.length) {
		var uid = chart.objectMap[idx];
			//console.log(uid);
			for (s = 0; s < chart.series.length; ++s) {

				for (var p = 0; p < chart.series[s].points.length; ++p) {
					
					var pt = chart.series[s].points[p];
					var on = (pt.guid == uid);
					pt.onSelected(on, chart);
				}
			}
		}
	},

	onClick: function(chart) {

		for (s = 0; s < chart.series.length; ++s) {
			for (p = 0; p < chart.series[s].points.length; ++p) {
				var pt = chart.series[s].points[p];
				pt.clearFormatting();
			}
		}

		var scene = chart.sceneRef;		
		var toRemove = [];
		for (var c=0; c < scene.children.length; ++c) { 
			var name = scene.children[c].name;
			if (name == 'temporary') {
				var obj = scene.children[c];
				toRemove.push(obj);
			}
		}
		for (var i=0; i < toRemove.length; ++i) {
			scene.remove(toRemove[i]);
		}
	},

	update : function(scene, chart, time) {

		var dyndim = chart.getDynamicDimensions();
		var dFactor = 1;
		if (dyndim !== null) {
			var drng = chart.getDimensionDataRange(1);
			dFactor = drng.upper - drng.lower;

			for (var s = 0; s < chart.series.length; ++s) {
				for (var p = 0; p < chart.series[s].points.length; ++p) {
					var pt = chart.series[s].points[p];
					var uid = pt.guid;

					var object = chart.getObject(uid);
					if (object !== null) {
						object.rotation.y += pt.speed;	
					}
				}
			}

			/*
			var objects = chart.getObjects();
			for (var i = 0; i < objects.length; ++i) {
				var object = objects[i];	
				object.rotation.y += 0.005;
			}*/

		}

	
	}

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
	this.padding= 0.0;
	this.onlypositive = false;
	this.labels = null;
	this.tickmarks = null;
	this.start = null;
	this.end   = null;
	this.init(type, chart);
}

Axis.prototype = { 

		init : function (type, chart) {
			this.type = type;
			this.tickmarks = new Tickmarks();
			this.labels = [];
			if (chart !== 'undefined') {
				this.chartRef  = chart;
				this.axisRange = chart.getScreenRange(type);
			}
		},

		_create : function() {
			var start, end;
			if (this.type == 'vertical') {
				if (this.onlypositive == true) {
					var screenRng = this.chartRef.getScreenRange('horizontal');
					start = new THREE.Vector3(screenRng.lower, this.axisRange.lower, 0);
					end   = new THREE.Vector3(screenRng.lower, this.axisRange.upper, 0);
				}
				else {
					start = new THREE.Vector3(0, this.axisRange.lower, 0);
					end   = new THREE.Vector3(0, this.axisRange.upper, 0);
				}
			}
			else {
				if (this.onlypositive == true) {
					var screenRng = this.chartRef.getScreenRange('vertical');
					start = new THREE.Vector3(this.axisRange.lower, screenRng.lower, 0);
					end   = new THREE.Vector3(this.axisRange.upper, screenRng.lower, 0);
				}
				else {
					start = new THREE.Vector3(this.axisRange.lower, 0, 0);
					end   = new THREE.Vector3(this.axisRange.upper, 0, 0);
				}
			}
			this.start = start;
			this.end   = end;
			this.material = new THREE.LineBasicMaterial( { color: 0x7e7e7e, linewidth:this.thickness});
			this.geometry = new THREE.Geometry();
			this.geometry.vertices.push( start, end );
			this.line = new THREE.Line( this.geometry, this.material );
		},

		_renderTickmarksAndLabels : function(scene) {
			var width = this.tickmarks.major.thickness;
			var material = new THREE.LineBasicMaterial( { color: 0x7e7e7e, linewidth:width});

			var tickValues = this.tickmarks.compute(this.dataRange);
			//console.log(tickValues);
			for (i = 0; i < tickValues.length; ++i)	{
				var geometry = new THREE.Geometry();
				var tickval  = Number(tickValues[i]).toFixed(2);
				var label = new AxisLabel();
				var labelpos = null;
				this.labels[this.labels.length] = label;
				if (this.type == 'vertical') {
					var screenRng = this.chartRef.getScreenRange('vertical');
					var x   = this.start.x;
					var y   = this.dataRange.convertTo(screenRng, tickval);
					var len = this.tickmarks.major.length;
					geometry.vertices.push(new THREE.Vector3(x-len, y, 0), new THREE.Vector3(x, y, 0));
					labelpos = new THREE.Vector3(x-len*2, y, 0);
				}
				else {
					var screenRng = this.chartRef.getScreenRange('horizontal');
					var y   = this.start.y;
					var x   = this.dataRange.convertTo(screenRng, tickval);
					var len = this.tickmarks.major.length;
					geometry.vertices.push(new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y-len, 0));
					labelpos = new THREE.Vector3(x, y-len*2, 0);
				}

				var text = label.getText(tickval, labelpos);
				var tick = new THREE.Line(geometry, material);
				scene.add(tick);
				scene.add(text);
			}
		},

		setDataRange : function(rng) {
			this.dataRange = rng;
			//console.log('setDataRange');
			if (this.onlypositive === true) {
				if (this.type === 'horizontal') {
					this.dataRange.lower = 0.0;
				}
			}
			this.dataRange.addPadding(this.padding);
			//this.axisRange = rng;
		},

		scalePoint: function(pt) {
			var newpt = pt.clone();
			//var x = this.
		},

		convertPointToScreen: function(screenRng, ptval) {
			var sp = this.dataRange.convertTo(screenRng, ptval);
			return sp;
		},

		//render type, leave blank for whole axis
		//render fit will adjust the display just for the visible range 
		render : function (scene) {
			this._create();
			scene.add(this.line);
			if (this.tickmarks !== null) {
				this._renderTickmarksAndLabels(scene);
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
	this.color = "#0000ff";
	this.cachedDraw = [];
	this.pointMap = {};
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
			if (this.type == 'line') {
				pt.color = this.color;
			}
			var len = this.points.length;	
			this.points[len] = pt;
			this.pointMap[pt.guid] = len;
			this._evaluateMaxMin(pt);
		},

		draw: function(scene, xAxis, yAxis, xRange, yRange, opacity) {
			var opac = 1.0;
			if (opacity !== 'undefined') { opac = opacity; }

			if (this.type.indexOf('line') > -1) {
			
				var material = new THREE.LineBasicMaterial( { color: this.color, linewidth:2.0, linecap:'bevel', linejoin:'bevel' });
				var geometry = new THREE.Geometry();
				var line = new THREE.Line(geometry, material);

				for (p = 0; p < this.numPoints(); p++) {
					var pt = this.getPoint(p);
					pt.color = this.color;

					var screenPt = pt.clone();
					var x = xAxis.convertPointToScreen(xRange, pt.arg);
					var y = yAxis.convertPointToScreen(yRange, pt.val);

					screenPt.set(x, y);
					geometry.vertices.push(screenPt.getVector());

					var circle = screenPt.getDrawable();
					circle.material.opacity = opac;
					scene.add(circle);
					this.cachedDraw[this.cachedDraw.length] = circle;
				}

				line.material.opacity = opac;
				scene.add(line);
				this.cachedDraw[this.cachedDraw.length] = line;
			}
		},

		adjustOpacity: function(opacity) {

			for (i = 0; i < this.cachedDraw.length; ++i) {
				var mesh = this.cachedDraw[i];
				mesh.material.opacity = opacity;
			}
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
		},
		getObjects : function() {
			//returns an array of the point meshes
			var objects = [];

			for (i=0; i < this.points.length; ++i) {
				objects[i] = this.points[i].getMesh();
			}

			return objects;	
		},
		findPoint : function(uid){

			//console.log(this.pointMap);

			var idx = this.pointMap[uid];
			if (idx < this.points.length){
				return this.points[idx];
			}
			return null;
		},

		dimensionMax : function(d) {

			var max = -10000000;
			for (var p = 0; p < this.points.length; ++p) {
				var pt = this.points[p];
				if (pt.hasDimension(d)) {
					var val = pt.getDimension(d);
					max = Math.max(max, val);
				}
			}
			return max;
		},

		dimensionMin : function(d) {
			var min = 10000000;
			for (var p = 0; p < this.points.length; ++p) {
				var pt = this.points[p];
				if (pt.hasDimension(d)) {
					var val = pt.getDimension(d);
					min = Math.min(min, val);
				}
			}
			return min;
		}

};

/***********************************************************
 * AnimatedSeries 
 ***********************************************************/
var AnimatedSeries = function(name, type, options) {
	Series.call(this, name, type);
	this.init(options);
}

AnimatedSeries.prototype = Object.create(Series.prototype);
AnimatedSeries.prototype.constructor = AnimatedSeries;

AnimatedSeries.prototype.init = function(options) {
		//animation options
};

AnimatedSeries.prototype.animate = function(options) {

	var start = new Date;
	var id = setInterval(function() {

				var timePassed = new Date - start;
				var progress = timePassed / options.duration;
				if (progress > 1) {
					progress = 1;
				}
				options.progress = progress;
				var delta = options.delta(progress);
				options.step(delta);
				if (progress == 1) {
					clearInterval(id);	
					options.complete();
				}
			}, options.delay || 10);
};

AnimatedSeries.prototype.fadeIn = function(choptions, animoptions, lastSeries, callback) {

		var scene = choptions['scene'];
		var xAxis = choptions['xAxis'];
		var yAxis = choptions['yAxis'];
		var xRange = choptions['xRange'];
		var yRange = choptions['yRange'];

		var to = 0;
		var first = true;
		this.animate( {
		
				series: this,
				duration: animoptions.duration,
				delta: function(progress){
					progress = this.progress;	
					return progress;
				},
				complete: callback,
				step: function(delta) {
					var opacity = to + delta;
					if (first == true) {
						if (lastSeries == true) { this.series.color = "#ff0000"; }
						this.series.draw(scene, xAxis, yAxis, xRange, yRange, opacity);
						first = false;
					}
					else {
						this.series.adjustOpacity(opacity);
					}
				}
		});
};

AnimatedSeries.prototype.fadeOut = function(choptions, animoptions, callback) {

		var scene = choptions['scene'];
		var xAxis = choptions['xAxis'];
		var yAxis = choptions['yAxis'];
		var xRange = choptions['xRange'];
		var yRange = choptions['yRange'];

		//duration:2000, idx:s-1, n:len, lambda:0.25, lowbound: 0.1, c:1};
		//decay function params
		var c = animoptions.c;
		var idx = animoptions.idx;
		var n = animoptions.n;
		var t = n - idx;
		var lam = 0.25;//animoptions.lambda;
		var lb = animoptions.lowbound;
		var decay = animoptions.decay;

		var finalOpac = (c-lb) * Math.exp(-lam * t) + lb;
		var to = 1;
		var first = true;
		var last = (t == 0);
		this.animate( {
		
				series: this,
				duration: animoptions.duration,
				delta: function(progress){
					progress = this.progress;	
					return progress;
				},
				complete: callback,
				step: function(delta) {
					//delta is a % of time elapsed
					var opacity = 1.0;
					if (decay == true)  { 
						opacity = Math.max(to - delta*(1-finalOpac), lb);
					}
					else {
						opacity = Math.max(to - delta, lb);
					}
					if (first == true) {
						this.series.draw(scene, xAxis, yAxis, xRange, yRange, opacity);
						first = false;
					}
					else {
						this.series.adjustOpacity(opacity);
					}
				}
		});
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
	this.radius = 0.025;
	this.selected = false;
	this.guid = "";
	this.dimensions = [];
	this.init(x, y, type);
}

SeriesPoint.prototype = {

		init : function(x, y, type) {
			this.arg = x;
			this.val = y;
			this.type = type;
			this.color = "#0000ff";
			var id = guid();
			this.guid = id;
		    if (type !== undefined) this.type = type;
		},

		set : function(arg, val) {
			this.arg = arg;
			this.val = val;		
		},

		clone : function() {
			var cln = new SeriesPoint(this.arg, this.val, this.type);
			cln.guid = this.guid;
			cln.color = this.color;
			cln.tag = this.tag;	
			cln.mesh = this.mesh;
			cln.dimensions = this.dimensions;
			return cln;
		},

		getDrawable: function() {
			var geom = new THREE.CircleGeometry(this.radius, 32);
			var mat  = new THREE.MeshBasicMaterial({ color : this.color } );
			this.mesh = new THREE.Mesh(geom, mat);
			this.mesh.position.set(this.arg, this.val, 0);
			return this.mesh;	
		},

		getDrawableAlt: function() {
			return this.mesh;	
		},

		getMesh: function() {
			return this.mesh;	
		},

		getVector: function() {
			return new THREE.Vector3(this.arg, this.val, 0);
		},

		getDrawVector: function() {
			return new THREE.Vector3(this.x, this.y, 0);
		},

		onSelected: function(isOn, chartRef) {
			this.selected = isOn;
		},

		animate : function(scene) {
		
		},

		clearFormatting: function() {
		
		},

		setDimensions: function(arr) {
			this.dimensions = arr;
		},

		nDim: function() {
			return this.dimensions.length;
		},

		hasDimension: function(dim) {
			return (this.nDim() > dim);
		},

		getDimension: function(dim) {
			return this.dimensions[dim];
		},
		applyDimension: function(dnum, name, factor) {
		}
};



/***********************************************************
 * Bubble Point - x, y, w
 ***********************************************************/
var BubblePoint = function(x, y, w) {
	//SeriesPoint.call(this, x, y, w);
	this.baserad = 0.15;
	this.speed   = 0.0;
	this.type   = "bubble";
	this.weight = w;
	this.scaleRef = 1.0;
	this.z = w;		//this is the scaled value
	this.history = [];
	this.histSpline = null;
	this.init(x, y, w);
}

BubblePoint.prototype = Object.create(SeriesPoint.prototype);
BubblePoint.prototype.constructor = BubblePoint;

BubblePoint.prototype.init = function(x, y, w) {
	this.arg = x;
	this.val = y;
	this.weight = w;
	var id = guid();
	this.guid = id;
	var geom = new THREE.SphereGeometry(this.baserad, 32, 32);
	var mat  = new THREE.MeshPhongMaterial({
		ambient  : 0,
		emissive : 0x0000ff/*Math.random() * 0xffffff*/,
		color    : 0x0000ff/*Math.random() * 0xffffff*/,
		specular : 0x101010,
		shininess: 50 });
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.material.shading = THREE.SmoothShading;
	geom.computeFaceNormals();
};

BubblePoint.prototype.set = function(arg, val, wt) {
	this.arg = arg;
	this.val = val;
	if (wt !== 'undefined') {
		this.weight = wt;
	}
};

BubblePoint.prototype.getDrawable =  function() {
	this.mesh.position.set(this.arg, this.val, 0);
	return this.mesh;	
};

BubblePoint.prototype.getDrawableAlt = function() {
	//console.log(this.weight);
	var altmesh = this.mesh;	
	var mat  = new THREE.MeshPhongMaterial({
		ambient  : 0,
		emissive : 0x7777ff,
		color    : 0x7777ff,
		//specular : 0x101010,
		opacity	 : 1.0});
	altmesh.material = mat;
	altmesh.position.set(this.arg, this.val, 0);
	var normW = Math.sqrt(this.weight/this.scaleRef);
	this.z = normW;
	altmesh.scale.set(normW, normW, normW);
	return altmesh;
};

BubblePoint.prototype.scale = function(/*xScale, yScale,*/wScale) {
	var middle = wScale / 2.0;		//the middle is our base radius
	this.scaleRef = middle;
	//var normW = Math.sqrt(this.weight / wScale);
	var normW = Math.sqrt(this.weight / middle);
	this.z = normW;
	this.mesh.scale.set(normW, normW, normW);
};

BubblePoint.prototype.clone = function() {
	var cln = new BubblePoint(this.arg, this.val, this.weight);
	cln.weight = this.weight;
	cln.guid = this.guid;
	cln.type = this.type;
	cln.color = this.color;
	cln.tag = this.tag;	
	cln.mesh = this.mesh;
	cln.z = this.z;
	cln.history = this.history;
	cln.scaleRef = this.scaleRef;
	cln.dimensions = this.dimensions;
	cln.speed = this.speed;
	return cln;
};

BubblePoint.prototype.onSelected = function(isOn, chart) {
	this.selected = isOn;
	if (isOn == true) {
		this.animateHistory(chart);
		//console.log('onselected=true: ' + this.guid);
		//console.log(this.history);
	}
	else {
		console.log('onselected=false');
		this.mesh.material.opacity = 0.5;
	}
};

BubblePoint.prototype.animateHistory = function(chart) {
	if (this.history.length > 0) {

		var scene = chart.sceneRef;
		var xScreenRng = chart.getScreenRange('horizontal');
		var yScreenRng = chart.getScreenRange('vertical');
		var vecarr = [];

		var start = new Date;
		var count = 0;
		var p = 1;
		var duration = 4000;
		var steps = duration/this.history.length;
		var history = this.history;
		var progress = 0;
		var id = setInterval(function() {

				count = count + steps;
				if (count == duration) {
					progress = 1;
				}
				if (p >= history.length-1) {
					progress = 1;
				}

				var spt = history[p-1];
				var ept = history[p];
				var screenStartPt = spt.clone();
				var screenEndPt   = ept.clone();

				var x = chart.xAxis.convertPointToScreen(xScreenRng, spt.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, spt.val);
				screenStartPt.set(x, y, spt.weight);

				var x = chart.xAxis.convertPointToScreen(xScreenRng, ept.arg);
				var y = chart.yAxis.convertPointToScreen(yScreenRng, ept.val);
				screenEndPt.set(x, y, ept.weight);

				var vec1 = screenStartPt.getVector();
				var vec2 = screenEndPt.getVector();

				var arr = [];
				arr[0] = vec1; arr[1] = vec2;

				var	curve = new THREE.SplineCurve(arr);
				var path  = new THREE.Path(curve.getPoints(50));
				var geom  = path.createPointsGeometry(50);
				//this is a hack for some reason it's closing the loop
				geom.vertices.splice(geom.vertices.length-1,1);
				var mater = new THREE.LineBasicMaterial( { color: 0x696969, linewidth:2, opacity:0.75 });
				var spline = new THREE.Line(geom, mater);
				spline.name = 'temporary';
				scene.add(spline);

				var mesh = screenStartPt.getDrawableAlt();
				mesh.name = 'temporary';
				scene.add(mesh);

				if (progress == 1) {
					clearInterval(id);	
				}

				p++;

			}, steps);

	}
};

BubblePoint.prototype.clearFormatting = function() {
	this.mesh.material.opacity = 1.0;
};

BubblePoint.prototype.applyDimension = function(dnum, name, factor) {

	if (name == "Texture") {
		var middle = factor / 2.0;
		var dim = this.dimensions[dnum] ;
		var norm = dim / middle;


		//just as a test use > 1 and < 1
		if (norm > 1.0) { 
			//var img  = THREE.ImageUtils.loadTexture("textures/fire/fire1.jpg");
			var img  = THREE.ImageUtils.loadTexture("textures/lava/lavatile.jpg");
			img.repeat.set(4,2);
			img.wrapS = img.wrapT = THREE.RepeatWrapping;
			img.anisotropy = 16;

			var mat  = new THREE.MeshPhongMaterial({
			ambient  : 0,
			//emissive : 0x0000ff/*Math.random() * 0xffffff*/,
			color    : 0xff0000/*Math.random() * 0xffffff*/,
			specular : 0x101010,
			map		 : img, 
			shininess: 50 });

		}
		else {

			var img  = THREE.ImageUtils.loadTexture("textures/planets/moon_1024.jpg");
			img.repeat.set(4,2);
			img.wrapS = img.wrapT = THREE.RepeatWrapping;
			img.anisotropy = 16;

			var mat  = new THREE.MeshPhongMaterial({
			ambient  : 0,
			//emissive : 0x0000ff/*Math.random() * 0xffffff*/,
			color    : 0xffffff/*Math.random() * 0xffffff*/,
			specular : 0x101010,
			map		 : img, 
			shininess: 50 });
		
		}

		this.mesh.material = mat;
	}
	else if (name == "Rotation") {

		//factor is actually a range here - hack

		var dim = this.dimensions[dnum];
		var norm = (dim - factor.lower) / factor.getRange();

		var speedlower = 0.005;
		var speedRange = 0.095;
		//max speed = 0.1;
		//min speed = 0.005;
	
		this.speed = norm * speedRange + speedlower;
	}
};

BubblePoint.prototype.setHistory = function(arr) {
	this.history = arr;
};

/***********************************************************
 * Tickmarks
 ***********************************************************/
var Tickmarks = function() {
	this.major = null;
	this.minor = null;
	this.values = [];
	this.ignoreFirst = false;
	this.init();
}

Tickmarks.prototype.init = function() {
	this.major = new TickOptions();
	this.minor = new TickOptions();
};

Tickmarks.prototype.compute = function(range) {
	var interval = range.getRange() / this.major.count;		
	var i = 0;
	var start = range.lower;
	if (this.ignoreFirst == true) { start = start + interval; }
	for (var d = start; d <= range.upper; d += interval) {
		this.values[i] = d;
		i += 1;
	}
	return this.values;
};

var TickOptions = function() {
	this.length = 0.075;
	this.thickness = 1.0;
	this.count  = 10;
};


/***********************************************************
 * Axis Labels
 ***********************************************************/
var AxisLabel = function() {
	this.color = 0x7e7e7e;
	//this.font = "helvetiker";
	this.font = "Arial";
	this.size = 0.10;
	this.width  = 0;
	this.height = 11;
	this.style = "normal";
	this.weight = "normal";
	this.material = null;
	this.canvas = null;
	this.context = null;
	this.fillstyle = "#000000";
	this.init();
}

AxisLabel.prototype.init = function() {
	this.canvas  = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.context.fillStyle = this.fillstyle;
	this.context.textAlign = "center";
	this.context.textBaseline = "middle";
	this.context.font = "Bold " + this.height + "px " + this.font;
};

AxisLabel.prototype.getText = function(text, position) {

	var metrics = this.context.measureText(text);
	this.width  = metrics.width*1.2;

	this.canvas.width  = this.width*2;
	this.canvas.height = this.height;
	this.context.fillText(text, this.width/2-1, this.height-1);

	var texture = new THREE.Texture(this.canvas);
	texture.needsUpdate = true;
	
	//var spriteAlign = THREE.SpriteAlignment.topLeft;
	var material = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false});
	var sprite = new THREE.Sprite(material);
	var scale  = this.width/this.height * this.size;
	sprite.scale.set(scale, this.size, 1);
	sprite.position.set(position.x, position.y, position.z);

	var textObject = new THREE.Object3D(); 
	textObject.textHeight = this.size;
	textObject.textWidth  = (this.width/this.height) * this.size;
	textObject.add(sprite);

	return textObject;
};

