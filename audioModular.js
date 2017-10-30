if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var camera, controls, scene, renderer;
var light;
var spheres = [];
var materials = [];
var analysers = [];
var clock = new THREE.Clock();
var listener;
var ground, groundGeo;
init();
animate();
function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 25, 0 );
	listener = new THREE.AudioListener();
	camera.add( listener );
	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 0.5, 1 ).normalize();
	// scene.add( light );

	createSource('http://localhost:8000/birdsandme.ogg',0,0,0);
	
	// ground
	loadGround('g.mtl','g.obj');
	var helper = new THREE.GridHelper( 1000, 10, 0x444444, 0x444444 );
	helper.position.y = 0.1;
	scene.add( helper );
	//
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.innerHTML = "";
	container.appendChild( renderer.domElement );
	controls = new THREE.FirstPersonControls( camera, renderer.domElement );
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
		sound.play();
	});
	mesh.add( sound );
	analysers.push(new THREE.AudioAnalyser( sound, 32 ));
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
					console.log(child.scale,new THREE.Vector3(10,10,10));

					groundGeo = child.geometry;
					groundGeo.center();
					groundGeo = new THREE.Geometry().fromBufferGeometry(groundGeo);

					vnh = new THREE.VertexNormalsHelper( ground, 5 );
					scene.add( vnh );

				}
			});
			scene.add( object );

		}, onProgress, onError );

	});
}