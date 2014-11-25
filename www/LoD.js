if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var sphereSpread = 1000, sphereDetail=100, sphereMinRadius = 40, sphereMaxRadius = 150;
var sphereDict = [];

var linkSpread = 100;
var linkColor =0x29B6F6;

var container;
var camera, scene, renderer;
var geometry,color, colors = [],particles;
var controls, clock = new THREE.Clock();
var material, mesh, lod;
var max = 100,count = 0;

init();
createScene();
initParticle();
animate();

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
	
	window.addEventListener( 'resize', onWindowResize, false );	
}

function createScene(){
	var s1 = addSphere2("S1");
	var s2 = addSphere2("S2");
	createLink(s1,s2);
}

function initParticle(){
	//THREE.ImageUtils.crossOrigin = 'anonymous';
	sprite = THREE.ImageUtils.loadTexture("spark.jpg");
	geometry = new THREE.Geometry();
	for ( i = 0; i < 500; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = 2000 * Math.random() - 1000;
		vertex.y = 2000 * Math.random() - 1000;
		vertex.z = 2000 * Math.random() - 1000;
		geometry.vertices.push( vertex );
		colors[ i ] = new THREE.Color( 0xffffff );
		colors[ i ].setHSL( ( vertex.x + 1000 ) / 2000, 1, 0.5 );
	}
	geometry.colors = colors;
	material = new THREE.PointCloudMaterial( { size: 85, map: sprite, vertexColors: THREE.VertexColors, transparent: true } );
	material.color.setHSL( 1.0, 0.2, 0.7 );
	particles = new THREE.PointCloud( geometry, material );
	particles.sortParticles = true;
	scene.add( particles );
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

function addSphere2(name,x,y,z){
	if(count < max){
		if(x==null&&y==null&&z==null){			
			x = sphereSpread * ( 0.5 - Math.random() );
			y = sphereSpread * ( 0.5 - Math.random() );
			z = sphereSpread * ( 0.5 - Math.random() );
		}
	
		//Géométrie des sources de données
		radius = getRandom(sphereMinRadius,sphereMaxRadius);
		geometry = new THREE.SphereGeometry( radius, sphereDetail, sphereDetail );
		material = new THREE.MeshBasicMaterial( { color: getRandomColor() } );
		var cube = new THREE.Mesh( geometry, material );
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
	update();
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

function update(){
	// add some rotation to the system
	  particles.rotation.y += 0.0001;

	// draw
	renderer.render(scene, camera);

	/*var t0 = clock.getElapsedTime();
	uniforms.time.value = 0.125 * t0;
	
	for( var v = 0; v < particleGeometry.vertices.length; v++ ) 
	{
		var timeOffset = uniforms.time.value + attributes.customOffset.value[ v ];
		particleGeometry.vertices[v] = position(timeOffset);		
	}*/
}