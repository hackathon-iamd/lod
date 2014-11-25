if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var sphereSpread = 1000, sphereDetail=100, sphereMinRadius = 15, sphereMaxRadius = 150;
var sphereDict = [];

var linkSpread = 70;
var linkColor =0xFF0000;

var container;
var camera, scene, renderer;
var geometry;
var controls, clock = new THREE.Clock();
var material, mesh, lod;
var max = 100,count = 0;

init();
createScene();
animate();

var programStroke = function ( context ) {

	context.lineWidth = 0.025;
	context.beginPath();
	context.arc( 0, 0, 0.5, 0, PI2, true );
	context.stroke();

}

function getRandomColor(){
	return Math.random() * 0x808080 + 0x808080;
}

function getRandom(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 15000 );
	camera.position.z = 1000;


	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 15000 );
	scene.autoUpdate = false;
	
	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 0, 1 ).normalize();
	scene.add( light );


	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	/*controls.movementSpeed = 1000000;
	controls.rollSpeed = Math.PI /5;*/
	
	window.addEventListener( 'resize', onWindowResize, false );
}

function createScene(){
	var s1 = addSphere2("S1");
	var s2 = addSphere2("S2");
	var s3 = addSphere2("S3");
	createLink(s1,s2,5);
	createLink(s1,s3,2);
	createLink(s2,s3,30);
}

function createLink(s1,s2,n){
	if(n==null)
		n=1;
	for(i=0;i<n;i++){
		var link = new THREE.Shape();
		SUBDIVISIONS = 20;
		geometry = new THREE.Geometry();
		curve = new THREE.QuadraticBezierCurve3();
		curve.v0 = new THREE.Vector3(s1.x, s1.y, s1.z);//pt1
		curve.v1 = new THREE.Vector3((s1.x+s2.x)/2+linkSpread*Math.random(), 
									(s1.y+s2.y)/2+linkSpread*Math.random(), 
									(s1.z+s2.z)/2+linkSpread*Math.random());//pt2
		curve.v2 = new THREE.Vector3(s2.x, s2.y, s2.z);//pt3
		for (j = 0; j < SUBDIVISIONS; j++) {
			geometry.vertices.push( curve.getPoint(j / SUBDIVISIONS) )
		}
		material = new THREE.LineBasicMaterial( { color: linkColor, linewidth: 2 } );
		line = new THREE.Line(geometry, material);
		scene.add(line);	
	}
}

function addSphere2(name){
	if(count < max){
		//Géométrie des sources de données
		radius = getRandom(sphereMinRadius,sphereMaxRadius);
		geometry = new THREE.SphereGeometry( radius, sphereDetail, sphereDetail );
		material = new THREE.MeshBasicMaterial( { color: getRandomColor() } );
		var cube = new THREE.Mesh( geometry, material );
		var x = sphereSpread * ( 0.5 - Math.random() );
		var y = 0.25*sphereSpread * ( 0.5 - Math.random() );
		var z = sphereSpread * ( 0.5 - Math.random() );
		cube.position.x = x;
		cube.position.y = y;
		cube.position.z = z;
		cube.updateMatrix();
		cube.matrixAutoUpdate = false;
		var source = {x:x,y:y,z:z,value:cube,radius:radius};
		sphereDict[name]= source
		scene.add( cube );
		count++;
		return source;
	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	controls.update( clock.getDelta() );
	scene.updateMatrixWorld();
	scene.traverse( function ( object ) {

		if ( object instanceof THREE.LOD ) {

			object.update( camera );

		}

	} );

	renderer.render( scene, camera );

}