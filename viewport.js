var container, stats;

var camera, scene, renderer;

var geo, geoOkay;
var obj;
var geoMain = [];

init("http://localhost:8000/","tree.obj","tree.mtl");
animate();

function init(path,objpath,mtlpath) {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 20;

	// scene

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x444444 );
	scene.add( ambient );

	var ambient = new THREE.AmbientLight( 0x61618F );
	var directionalLight = new THREE.DirectionalLight( 0xFFF9F3);
	var backLight = new THREE.DirectionalLight( 0xF0F9F3);
	var hemiLight = new THREE.HemisphereLight( 0x8c9fa3, 0x604e87, .5);

	scene.add( ambient );
	directionalLight.position.set( 0, 0, 1 );
	scene.add(directionalLight);
	console.log(camera)
	backLight.position.set( 0, 0, -1 );
	backLight.intensity = .5;
	scene.add( backLight );
	scene.add( hemiLight );


	// model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) { };

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( 'http://localhost:8000/' );
	mtlLoader.crossOrigin = "anonymous";
	mtlLoader.load( 'tree.mtl', function( materials ) {

		materials.preload();
		materials.materials.stem.transparent = false;
		materials.materials.leaves.shininess = 10;

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( 'http://localhost:8000/' );
		objLoader.load( 'tree.obj', function ( object ) {
			object.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					obj = child;
					geo = child.geometry;
					geo.center();
					camera.lookAt(child.position);
					geo = new THREE.Geometry().fromBufferGeometry(geo);
					geoMain = geo.clone().vertices;
					geoOkay = true;

				}
			});
			scene.add( object );

		}, onProgress, onError );

	});

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );
	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {
	if (geoOkay && micOkay && breath!=0) {
		analyse(breathDelta);
		// console.log(breath);
		// geoOkay = false;
	}

	renderer.render( scene, camera );

}