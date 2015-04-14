/*
 * Cloth Simulation using a relaxed constrains solver
 */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

//var DAMPING = 0.00000000003;
//var DAMPING = 0.003;
var DAMPING = 0;
//var DRAG = 1 - DAMPING;
var DRAG = 1;
var MASS = .000000000000001;
//var MASS = 0.1;
var restDistance = 0.0000000001;


var xSegs = 10; //
var ySegs = 10; //

//var clothFunction = plane(restDistance * xSegs, restDistance * ySegs);
var clothFunction = plane(0.27,0.18);

var cloth = new Cloth(xSegs, ySegs);

//var GRAVITY = 981 * 1.4; // 
//var GRAVITY = 0.0000000981 * 0.14;
var GRAVITY = 0;
var gravity = new THREE.Vector3( 0, -GRAVITY, 0 ).multiplyScalar(MASS);


var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

var pins = [];


var wind = true;
var windStrength = 2;
var windForce = new THREE.Vector3(0,0,0);

var tmpForce = new THREE.Vector3();

var lastTime;


function plane(width, height) {

	return function(u, v) {
		var x = (u - 0.5) * width;
		var y = (v + 0.5) * height;
		var z = 0;
		return new THREE.Vector3(x, y, z);
	};
}

function Particle(x, y, z, mass) {
	this.position = clothFunction(x, y); // position
	this.previous = clothFunction(x, y); // previous
	this.original = clothFunction(x, y); 
	this.a = new THREE.Vector3(0, 0, 0); // acceleration
	this.mass = mass;
	this.invMass = 1 / mass;
	this.tmp = new THREE.Vector3();
	this.tmp2 = new THREE.Vector3();
}

// Force -> Acceleration
Particle.prototype.addForce = function(force) {
	this.a.add(
		this.tmp2.copy(force).multiplyScalar(this.invMass)
	);
};


// Performs verlet integration
Particle.prototype.integrate = function(timesq) {
	var newPos = this.tmp.subVectors(this.position, this.previous);
	newPos.multiplyScalar(DRAG).add(this.position);
	newPos.add(this.a.multiplyScalar(timesq));

	this.tmp = this.previous;
	this.previous = this.position;
	this.position = newPos;

	this.a.set(0, 0, 0);
}


var diff = new THREE.Vector3();

function satisifyConstrains(p1, p2, distance) {
	diff.subVectors(p2.position, p1.position);
	var currentDist = diff.length();
	if (currentDist == 0) return; // prevents division by 0
	var correction = diff.multiplyScalar(1 - distance / currentDist);
	var correctionHalf = correction.multiplyScalar(0.5);
	p1.position.add(correctionHalf);
	p2.position.sub(correctionHalf);
}


function Cloth(w, h) {
	w = w || 10;
	h = h || 10;
	this.w = w;
	this.h = h;

	var particles = [];
	var constrains = [];

	var u, v;

	// Create particles
	for (v = 0; v <= h; v ++) {
		for (u = 0; u <= w; u ++) {
			particles.push(
				new Particle(u / w, v / h, 0, MASS)
			);
		}
	}

	// Structural

	for (v = 0; v < h; v ++) {
		for (u = 0; u < w; u ++) {

			constrains.push([
				particles[index(u, v)],
				particles[index(u, v + 1)],
				restDistance
			]);

			constrains.push([
				particles[index(u, v)],
				particles[index(u + 1, v)],
				restDistance
			]);

		}
	}

	for (u = w, v = 0; v < h; v ++) {
		constrains.push([
			particles[index(u, v)],
			particles[index(u, v + 1)],
			restDistance

		]);
	}

	for (v = h, u = 0; u < w; u ++) {
		constrains.push([
			particles[index(u, v)],
			particles[index(u + 1, v)],
			restDistance
		]);
	}

	this.particles = particles;
	this.constrains = constrains;

	function index(u, v) {
		return u + v * (w + 1);
	}

	this.index = index;

}

function simulate(time) {
	if (!lastTime) {
		lastTime = time;
		return;
	}
	
	var i, il, particles, particle, pt, constrains, constrain;

	// Aerodynamics forces
	if (wind) {
		var face, faces = clothGeometry.faces, normal;

		particles = cloth.particles;

		for (i = 0,il = faces.length; i < il; i ++) {
			face = faces[i];
			normal = face.normal;

			tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
			particles[face.a].addForce(tmpForce);
			particles[face.b].addForce(tmpForce);
			particles[face.c].addForce(tmpForce);
		}
	}
	
	for (particles = cloth.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		particle.addForce(gravity);

		particle.integrate(TIMESTEP_SQ);
	}

	// Start Constrains

	constrains = cloth.constrains,
	il = constrains.length;
	for (i = 0; i < il; i ++) {
		constrain = constrains[i];
		satisifyConstrains(constrain[0], constrain[1], constrain[2]);
		//satisifyConstrains(constrain[0], constrain[1], constrain[2]);
	}

	// Ball Constrains

	// Floor Constains
	for (particles = cloth.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		pos = particle.position;
		if (pos.y < -250) {
			pos.y = -250;
		}
	}

	// Pin Constrains
	for (i = 0, il = pins.length; i < il; i ++) {
		var xy = pins[i];
		var p = particles[xy];
		p.position.copy(p.original);
		p.previous.copy(p.original);
	}


}


function SkyDome(i, j) {
	i -= 0.5;
	j -= 0.5;
	var r2 = i * i * 4 + j * j * 4;
	return new THREE.Vector3(i*20000,(1-r2)*5000,j*20000).multiplyScalar(0.05);
}