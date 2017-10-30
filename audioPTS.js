if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var camera, controls, scene, renderer;
var light;
var spheres = [];
var materials = [];
var analysers = [];
var clock = new THREE.Clock();
var listener;
var ground, groundBox, pts;
var raycaster;
var sources = [];
init();
animate();
var sounds = ['http://localhost:8000/birdsandme.ogg','http://localhost:8000/sunny.ogg','http://localhost:8000/nickels.ogg'];

function init() {
	container = document.createElement( 'div' );
	container.id = "container";
	document.body.appendChild( container );
	document.getElementById("container").innerHTML = "";
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 25, 0 );
	listener = new THREE.AudioListener();
	camera.add( listener );
	scene = new THREE.Scene();
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 0.5, 1 ).normalize();
	scene.add( light );
	raycaster = new THREE.Raycaster(new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,0));
	
	// ground
	loadGround('flagstaff.mtl','flagstaff.obj');
	//
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.innerHTML = "";
	container.appendChild( renderer.domElement );
	controls = new THREE.FPS( camera, renderer.domElement, pts, groundBox, raycaster);
	controls.movementSpeed = 70;
	controls.lookSpeed = 0.05;
	controls.noFly = true;
	controls.lookVertical = false;
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
}
function animate() {
	requestAnimationFrame( animate );
	render();
}
function render() {
	var delta = clock.getDelta();
	controls.update( delta );
	for (i=0;i<materials.length;i++) {
		material[i].emissive.b = analyser[i].getAverageFrequency() / 256;
	}


	renderer.render( scene, camera );
}
function createSource(link,x,y,z) {
	var sphere = new THREE.SphereGeometry( 20, 32, 16 );
	material = new THREE.MeshPhongMaterial( { color: 0, flatShading: true, shininess: 0 } );
	// sound spheres
	var audioLoader = new THREE.AudioLoader();
	var mesh = new THREE.Mesh( sphere, material );
	mesh.position.set( x, y, z);
	scene.add( mesh );
	var sound = new THREE.PositionalAudio( listener );
	audioLoader.load(link, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setRefDistance( 20 );
		sound.setLoop(true);
		sound.play();
	});
	mesh.add( sound );
	analysers.push(new THREE.AudioAnalyser( sound, 32 ));
	sources.push(mesh);
}

function loadGround(mtl,obj) {

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {console.log(xhr); };

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( 'http://localhost:8000/' );
	mtlLoader.crossOrigin = "anonymous";
	mtlLoader.load( mtl, function( materials ) {
		materials.preload();

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( 'http://localhost:8000/' );
		objLoader.load(obj, function ( object ) {
			object.traverse(function(child) {

				if (child instanceof THREE.Mesh) {
					ground = child;
					child.scale.x = 100;
					child.scale.y = 100;
					child.scale.z = 100;
					child.geometry.center();
					child.geometry.scale(100,100,100);
					child.geometry.computeBoundingBox();
					groundBox = child.geometry.boundingBox;
					controls.box = groundBox;
					var geo = new THREE.Geometry().fromBufferGeometry(child.geometry);
					var material = new THREE.PointsMaterial({size:1, color:0xFFF});
					pts = new THREE.Points( geo, material );
					controls.pts = pts;
					scene.add (pts);
					console.log(pts);
					
				}
			});

			scapeIt(sounds,pts);
		}, onProgress, onError );

	});
}

function scapeIt (sounds,pts) {
	for (i=0;i<sounds.length;i++) {
		var rand = Math.floor((Math.random() * pts.geometry.vertices.length));
		var vec = pts.geometry.vertices[rand];
		createSource(sounds[i],vec.x,vec.y,vec.z);
	}
}
