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
initStars();
animate();

function getRandomColor(){
	return Math.random() * 0x808080 + 0x808080;
}

function getRandom(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function init() {
	//DOC
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	//CAMERA
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 15000 );
	camera.position.z = 1000;
	//SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 15000 );
	scene.autoUpdate = false;
	//LIGHT
	var light = new THREE.AmbientLight( 0x333333 );
	scene.add( light );
	var light2 = new THREE.DirectionalLight( 0xFFFFFF );
	light2.position.set( 0, 0, 1 ).normalize();
	scene.add( light2 );

	//RENDERER
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );
	
	// CONTROLS
	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	
	window.addEventListener( 'resize', onWindowResize, false );	
	
	//SKY
	var geometry = new THREE.SphereGeometry(3000, 60, 40);
	var uniforms = {
	  texture: { type: 't', value: THREE.ImageUtils.loadTexture( "sky.jpg" ) }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent
	});

	skyBox = new THREE.Mesh(geometry, material);
	skyBox.scale.set(-1, 1, 1);
	skyBox.eulerOrder = 'XZY';
	skyBox.renderDepth = 1000.0;
	scene.add(skyBox);
	
}

function createScene(){
	var s1 = addSphere2("DB Pedia");	
	var s2 = addSphere2("Drugbank");
	createLink(s1,s2);
}

function initStars(){
	sprite = THREE.ImageUtils.loadTexture("whitePart.png");
	geometry = new THREE.Geometry();
	for ( i = 0; i < 500; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = 2000 * Math.random() - 1000;
		vertex.y = 2000 * Math.random() - 1000;
		vertex.z = 2000 * Math.random() - 1000;
		geometry.vertices.push( vertex );
		colors[ i ] = new THREE.Color( 0xFFFFFF );
		//colors[ i ].setHSL( ( vertex.x + 1000 ) / 2000, 1, 0.5 );
		colors[ i ].setHSL( 1, 1, 1 );
	}
	geometry.colors = colors;
	material = new THREE.PointCloudMaterial( { size: 50, map: sprite, vertexColors: THREE.VertexColors, transparent: true } );
	//material.color.setHSL( 0.8, 1, 0.5 );
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

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	//var spriteAlignment = parameters.hasOwnProperty("alignment") ?
	//	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

	//var spriteAlignment = THREE.SpriteAlignment.topLeft;
		

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: false/*, alignment: spriteAlignment */} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	return sprite;	
}


// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
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
		color = getRandomColor();
		geometry = new THREE.SphereGeometry( radius, sphereDetail, sphereDetail );
		material = new THREE.MeshLambertMaterial( { color: color } );
		//material = new THREE.MeshBasicMaterial( { color: getRandomColor() } );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.copy(new THREE.Vector3(x,y,z));
		sphere.updateMatrix();
		sphere.matrixAutoUpdate = false;
		
		var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: color, side: THREE.BackSide } );
		var outlineMesh1 = new THREE.Mesh( geometry, outlineMaterial1 );
		outlineMesh1.position.copy(sphere.position);
		outlineMesh1.scale.multiplyScalar(1.05);
		scene.add( outlineMesh1 );		
		
		var label = makeTextSprite( " "+name+" ", { fontsize: 40, backgroundColor: {r:255, g:255, b:255, a:1} } );
		label.position.x = x+50;
		label.position.y = y+50;
		label.position.z = z+50;
		scene.add( label );	
			
		var source = {x:x,y:y,z:z,sphere:sphere,radius:radius,label:label,outline:outlineMesh1};
		sphereDict.push(source);
		scene.add( sphere );
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
	update();
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

function update(){
	// pour chaque sphere
	for(i=0;i<sphereDict.length;i++){
		//position de la caméra
		var sPos3 = sphereDict[i].sphere.position;
		//position de la sphere
		var cPos3 = camera.position;
		//distance entre la sphere et la camera
		var dist = sPos3.distanceTo(cPos3);
		//échelle de distance entre sphere-label et sphere-camera
		var percentDistLabel = (sphereDict[i].radius+30)/dist;
		//vecteur différence entre position label et position sphere
		var dist3 = cPos3.clone().sub(sPos3).multiplyScalar(percentDistLabel);
		//position du label
		var lPos = sPos3.clone().add(dist3);
		sphereDict[i].label.position.copy(lPos);
	}
}