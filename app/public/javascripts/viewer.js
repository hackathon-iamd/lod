if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//PARAMETERS
//STARS
var starCount = 500;
var starSize = 50;
var starSpread = 3000;
//SPHERE
var sphereSpread = 1000, sphereDetail=20, sphereMinRadius = 7, sphereMaxRadius = 20;
var sphereDict = [];
var sphereLimit = 30,sphereCount = 0;
var sphereOutileScale = 1.1;
//LINKS
var linkSpread = 100;
//var linkColor =0x29B6F6; //old color
var linkColor =0x0088ff;
var linkOpacity = 0.4;
var linkSubSegments = 60;
var color, colors = [];

var container, stats;

var camera, controls, scene, renderer;
var time = 0;
var sky, sunSphere;

var plane;

var mouse = new THREE.Vector2(),
	offset = new THREE.Vector3(),
	offsetDownUp = new THREE.Vector2(),
	mouseDown = new THREE.Vector2(),
	mouseUp = new THREE.Vector2(),
	INTERSECTED, SELECTED;
var sphereDict = [];

var linkSpread = 70;
var linkColor =0x0099ff;

var geometry;
var material, mesh, lod;

//tab for nodes ForceLoop
var sourceNodes = {};
var arcs = {};
var expandedSources={};
var particleSprite = THREE.ImageUtils.loadTexture( "images/electric.png" );

//Data
var rawData;

/*******************************************************************************************
										MAIN
*******************************************************************************************/
init();
//loadData();
//simulateScene();
//simulateSceneNew();
//createScene();
//createSceneOLD();
simulateSceneNew()
animate();


/********************************************************************************************************************************
	INITIALIZATION FUNCTIONS
*********************************************************************************************************************************/

function init() {
	//DOCUMENT
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	//CAMERA
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.001, 2000000 );
	camera.position.z = 200;
	camera.position.y = 100;
	camera.setLens(20);

	//SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 15000 );
	//scene.autoUpdate = false;

	//LIGHT
	var light = new THREE.AmbientLight( 0x333333 );
	scene.add( light );
	var light2 = new THREE.DirectionalLight( 0xFFFFFF );
	light2.position.set( 0, 0, 1 ).normalize();
	scene.add( light2 );
	
	//var size = 500;

	//RENDERER
	renderer = new THREE.WebGLRenderer( /*{ antialias: false }*/ );
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.sortObjects = false;
	container.appendChild( renderer.domElement );
	
	// CONTROLS
	controls = new THREE.TrackballControls( camera, renderer.domElement );

	//STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	//EVENTS
	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	window.addEventListener( 'resize', onWindowResize, false );
	
	
	//SKY
	initBetterSky()
	//initSky();
	
	//STARS	
	initStars();
		
	//GUI	
	initGUI();	
}

function initSky(){

	// Add Sky Mesh
	sky = new THREE.Sky();
	scene.add( sky.mesh );


	// Add Sun Helper
	sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
							   new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
	sunSphere.position.y = -700000;
	sunSphere.visible = true;
	scene.add( sunSphere );

	// GUI

	var effectController  = {
		turbidity: 10,
		reileigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		inclination: 0.49, // elevation / inclination
		azimuth: 0.25, // Facing front,					
		sun: !true
	}

	var distance = 400000;

	function guiChanged() {
		var uniforms = sky.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.reileigh.value = effectController.reileigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

		var theta = Math.PI * (effectController.inclination - 0.5);
		var phi = 2 * Math.PI * (effectController.azimuth - 0.5);

		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 

		sunSphere.visible = effectController.sun;

		sky.uniforms.sunPosition.value.copy(sunSphere.position);

	}

	var gui = new dat.GUI();
	gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
	gui.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "luminance", 0.0, 2).onChange( guiChanged );;
	gui.add( effectController, "inclination", 0, 1, 0.0001).onChange( guiChanged );
	gui.add( effectController, "azimuth", 0, 1, 0.0001).onChange( guiChanged );
	gui.add( effectController, "sun").onChange( guiChanged );

	guiChanged();

	camera.lookAt(sunSphere.position)
}

function initBetterSky(){
	var geometry = new THREE.SphereGeometry(3000, 60, 40);
	var uniforms = {
	  texture: { type: 't', value: THREE.ImageUtils.loadTexture( "images/sky.jpg" ) }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent
	});

	skyBox = new THREE.Mesh(geometry, material);
	skyBox.scale.set(-1, 1, 1);
	skyBox.rotation.order = 'XZY';
	skyBox.renderDepth = 1000.0;
	//skyBox.visible = false;
	scene.add(skyBox);
}

function initGUI(){
	var gui = new dat.GUI();		
	var parameters={
		a: function(){ 
			for(node in sourceNodes){
				sourceNodes[node].position.copy(new THREE.Vector3(0,0,0));
			}
		},
		b: function(){ particles.visible = !particles.visible},
		c: function(){ skyBox.visible = !skyBox.visible}
	};
	//gui.add( parameters,'a').name("WIGGLE WIGGLE WIGGLE");
	gui.add( parameters,'b').name("Show/Hide stars");
	gui.add( parameters,'c').name("Show/Hide sky");
	//gui.close();
}

function initStars(){
	//loading of the image
	sprite = THREE.ImageUtils.loadTexture("images/whitePart.png");
	//creation of a global geometry object
	geometry = new THREE.Geometry();
	//creation of randoms point on the scene
	for ( i = 0; i < starCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = starSpread * Math.random() - starSpread/2;
		vertex.y = starSpread * Math.random() - starSpread/2;
		vertex.z = starSpread * Math.random() - starSpread/2;
		geometry.vertices.push( vertex );
		colors[ i ] = new THREE.Color( 0xFFFFFF );
		colors[ i ].setHSL( 1, 1, 1 );
		//a changer
	}
	geometry.colors = colors;
	material = new THREE.PointCloudMaterial( { size: starSize, map: sprite, vertexColors: THREE.VertexColors, transparent: true } );
	particles = new THREE.PointCloud( geometry, material );
	//particles.sortParticles = true;
	particles.visible = false;
	scene.add( particles );
}



function createSceneOLD(){
	var s1 = makeSourceNode("S1");
	var s2 = makeSourceNode("S2");
	var s3 = makeSourceNode("S3");
	var s4 = makeSourceNode("S4");
	var s5 = makeSourceNode("S5");
	var s6 = makeSourceNode("S6");
	var s7 = makeSourceNode("S7");
	makeArc(s1,s2,1);
	makeArc(s1,s3,5);
	makeArc(s2,s3,1);
	makeArc(s4,s3,1);
	makeArc(s4,s1,100);
	makeArc(s4,s5,1);
	makeArc(s6,s2,1);
	makeArc(s7,s6,1);

	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
		new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
	);
	plane.visible = false;
	scene.add( plane );
}

///DEBUG
function simulateSceneNew(){	
	var s1 = makeSourceNode("S1","S1");
	var s2 = makeSourceNode("S2","S2");
	var s3 = makeSourceNode("S3","S3");
	var s4 = makeSourceNode("S4","S4");
	var s5 = makeSourceNode("S5","S5");
	var s6 = makeSourceNode("S6","S6");
	var s7 = makeSourceNode("S7","S7");
	makeArc("1",s1,s2,5);
	makeArc("2",s1,s3,2);
	makeArc("3",s2,s3,30);
	makeArc("4",s4,s3,15);
	makeArc("5",s4,s1,30);
	makeArc("6",s2,s5,3);
	makeArc("7",s4,s5,11);
	makeArc("8",s6,s2,5);
	makeArc("9",s7,s6,10);
	makeArc("10",s7,s2,12);
}
/********************************************************************************************************************************
	MAKE ELEMENTS
*********************************************************************************************************************************/

function createScene(){
	for(i in rawData.sources){
		makeSourceNode(i,rawData.sources[i].name);
	}
	for(i in rawData.types){
		if(rawData.types[i].sources.length>1)//Voir 3
			makeArc(i,sourceNodes[rawData.types[i].sources[0]],sourceNodes[rawData.types[i].sources[1]]);
	}
}

/*function makeArc(s1,s2,n){
	if(n==null)
		n=1;
	for(i=0;i<n;i++){
		material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.2,
			depthTest: false,
			color: 0x0088ff,
			blending: THREE.AdditiveBlending
		});
		var line = new Arc(s1,s2,"Type"+i,material);
		//line.needsUpdate(true);
		arcs.push(line);
		scene.add(line);	
	}
}*/

function makeArc(id,s1,s2,n){
	if(n==null)
		n=1;
	var dif="";
	for(i=0;i<n;i++){
		if(i>0)
			dif=i;
		material = new THREE.LineBasicMaterial( { color: linkColor, transparent: true, opacity: linkOpacity} );
		var line = new Arc(s1,s2,id+dif,material);
		arcs[id+dif] = line;
		scene.add(line);	
	}
}

/*function makeSourceNode(name){

	radius = getRandom(sphereMinRadius,sphereMaxRadius);
	geometry = new THREE.SphereGeometry( 10, sphereDetail, sphereDetail );
	material = new THREE.MeshBasicMaterial( { color: getRandomColor() } );
	var node = new BalancedNode(name, geometry, material );

	node.position.set(0,1,100); 
	node.velocity.set(1,0,0);
	node.velocity.rotateZ(Math.random()*90);			
	node.velocity.rotateY(Math.random()*360);

	node.position.rotateZ(Math.random()*360); 

	node.drag = 0.96;

	sourceNodes.push(node);

	scene.add( node );
	return node;
}*/

function makeSourceNode(id,name){
	radius = getRandom(sphereMinRadius,sphereMaxRadius);
	geometry = new THREE.SphereGeometry( radius, sphereDetail, sphereDetail );
	material = new THREE.MeshLambertMaterial( { color: getRandomColor() } );
	var node = new BalancedNode(name, geometry, material );

	node.position.set(0,1,100); 
	node.velocity.set(1,0,0);
	node.velocity.rotateZ(Math.random()*90);			
	node.velocity.rotateY(Math.random()*360);
	node.position.rotateZ(Math.random()*360); 

	node.drag = 0.96;

	sourceNodes[id] = node;

	scene.add( node );
	scene.add(node.label);
	return node;
}

///TODO
function makeTypeNode(type,parent,i){

	/* var pColor = 0xff4400;
	var pSize = 0.6;*/


	// inner particle
	var pMat = new THREE.PointCloudMaterial( { size: 1, map: particleSprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );

	var geom = new THREE.Geometry();
	geom.vertices.push(new THREE.Vector3());
	var particle = new BalancedParticle(type.name,parent,i,geom,pMat);

	parent.particles.push(particle);

	for(arc in type.arcs){
		var arcObject = type.arcs[arc];

		if(arcObject.depart){
			arcObject.arc.startPoint = particle;
		}else{
			arcObject.arc.endPoint = particle;
		}
	}
	scene.add(particle);
}

///TODO
function removeTypeNode(sourceNode){
	//We reset all arcs start or end point to sourceNode
	for(j in sourceNode.types){
		var type = sourceNode.types[j]
		for(arc in type.arcs){
			var arcObject = type.arcs[arc];

			if(arcObject.depart){
				arcObject.arc.startPoint = sourceNode;
			}else{
				arcObject.arc.endPoint = sourceNode;
			}
		}
	}

	//we remove the particles from the scene
	for(i in sourceNode.particles){
		console.log(i);
		scene.remove(sourceNode.particles[i]);
	}
	sourceNode.particles=[];
}

///TODO
/*function generateSprite() {

	var canvas = document.createElement( 'canvas' );
	canvas.width = 16;
	canvas.height = 16;
	canvas.loaded = true;

	var context = canvas.getContext( '2d' );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
	gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
	gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
	gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height );

	return canvas;

}*/

/********************************************************************************************************************************
	EXPAND AND UNIFORM
*********************************************************************************************************************************/
///TODO
function expand(sourceNode){
	//sourceNode.scale.set(0.1,0.1,0.1);

	var tweenSourceStart,tweenSourceEnd,tweenTypeStart,tweenTypeEnd;

	if(sourceNode.expanded){
		tweenSourceStart=0.1;
		tweenSourceEnd=1;
		tweenTypeStart=1;
		tweenTypeEnd=0;
	}else{
		tweenSourceStart=1;
		tweenSourceEnd=0.1;
		tweenTypeStart=0;
		tweenTypeEnd=1;
	}

	var tweenSource = new TWEEN.Tween( { scaleSource: tweenSourceStart } )
	.to( { scaleSource: tweenSourceEnd }, 500 )
	.easing( TWEEN.Easing.Quintic.Out)
	.onUpdate( function () {
		sourceNode.scale.set(this.scaleSource,this.scaleSource,this.scaleSource);
	} );



	var tweenType= new TWEEN.Tween( { scaleType: tweenTypeStart } )
	.to( { scaleType: tweenTypeEnd }, 500 )
	.easing( TWEEN.Easing.Quintic.Out)
	.onUpdate( function () {
		sourceNode.particleScale=this.scaleType;
		//console.log(this.scaleType);
	} ).onComplete( function () {
		if(!sourceNode.expanded){
			//alert("fin!");
			removeTypeNode(sourceNode);
			delete expandedSources[sourceNode.sourceName];

		}
	} );





	var typeCount = Object.keys(sourceNode.types).length;


	if(sourceNode.expanded){
		tweenType.chain(tweenSource);
		tweenType.start();
		sourceNode.expanded = false;
	}else{
		if(sourceNode.sphereType.length == 0){
			sourceNode.sphereType = makeSphere(typeCount);
			//console.log(sourceNode.sphereType);
		}

		var i=0;
		for(type in sourceNode.types){
			//console.log(sourceNode.types[type]);
			makeTypeNode(sourceNode.types[type],sourceNode,i);
			i++;
		}
		expandedSources[sourceNode.sourceName]=sourceNode;
		sourceNode.expanded = true;
		tweenSource.chain(tweenType);
		tweenSource.start();
	}

}




function uniformSourceNodes(){
	//Uniform nodes
	var repelforce = new THREE.Vector3(0,0,0),
		mag, 
		repelstrength; 

	for (i in sourceNodes){
		var p1 = sourceNodes[i]; 

		repelforce.copy(p1.position);

		mag = repelforce.length(); 

		repelstrength = (mag - 100) *-1; 

		if(mag>0){
			repelforce.multiplyScalar(repelstrength/mag);
			p1.position.add(repelforce); 
		}

		if(i>=Object.keys(sourceNodes).length-1) continue; 

		for (j in sourceNodes){
			var p2 = sourceNodes[j];

			repelforce.copy(p2.position); 
			repelforce.sub(p1.position); 
			mag = repelforce.length(); 
			//repelstrength = 50-mag; 
			repelstrength = 150-mag; 

			if((repelstrength>0)&&(mag>0))	{
				repelforce.multiplyScalar(repelstrength*0.0035 / mag); 

				p1.force.sub(repelforce); 
				p2.force.add(repelforce); 
			}
		}
	}

	// iteratate through each particle
	for (i in sourceNodes){
		var sourceNode = sourceNodes[i]; 
		sourceNode.update();
	}
	//end uniform nodes
}

///TODO
function uniformTypeNodes(){

	for(expandedSource in expandedSources){

		var particles = expandedSources[expandedSource].particles;

		for (i=0; i<particles.length; i++){
			particles[i].update(); 
		}


		// iteratate through each particle
		for (i=0; i<particles.length; i++){
			var particle = particles[i]; 
			particle.update();
		}

	}

	//end uniform nodes
}

function uniformArcs(){
	// iteratate through each arc
	for (i in arcs){
		arcs[i].update();
	}
}

/********************************************************************************************************************************
   RENDERING FUNCTIONS
*********************************************************************************************************************************/

function animate(time) {

	//time = Date.now();

	uniformSourceNodes();
	uniformTypeNodes();
	uniformArcs();
	requestAnimationFrame( animate );
	TWEEN.update(time);

	controls.update();

	render();

}

function render() {

	renderer.render( scene, camera );
	stats.update();

}


/********************************************************************************************************************************
	ON EVENTS
*********************************************************************************************************************************/

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	if ( SELECTED ) {

		var intersects = raycaster.intersectObject( plane );
		SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
		return;

	}

	var intersects = raycaster.intersectObjects( sourceNodes );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();


			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
	mouseDown.set(mouse.x,mouse.y);

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( sourceNodes );

	if ( intersects.length > 0 ) {

		controls.enabled = false;

		SELECTED = intersects[ 0 ].object;



		var intersects = raycaster.intersectObject( plane );
		offset.copy( intersects[ 0 ].point ).sub( plane.position );

		container.style.cursor = 'move';

	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();
	mouseUp.set(mouse.x,mouse.y);

	if(mouseDown.equals(mouseUp)){
		if(SELECTED!=null){
			expand(SELECTED);
		}
	}

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}


/********************************************************************************************************************************
	HELPER FUNCTIONS
*********************************************************************************************************************************/

function getRandomColor(){
	return Math.random() * 0x808080 + 0x808080;
}

function getRandom(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}

function makeSphere(n){
	var golden_angle = Math.PI * (3 - Math.sqrt(5));
	var zs = linspace(1 - 1.0 / n, 1.0 / n - 1, n);
	var points=[];

	for(i=0;i<n;i++){
		var theta = golden_angle * i;
		var radius = Math.sqrt(1 - z * z);
		var x = radius * Math.cos(theta);
		var y = radius * Math.sin(theta);
		var z = zs[i];
		var point = new THREE.Vector3(x,y,z);
		point.multiplyScalar(10);
		points.push(point);
	}
	return points;
}

function linspace(d1,d2,n) {

	j=0;
	var L = new Array();

	while (j<=(n-1)) {

		var tmp1 = j*(d2-d1)/(Math.floor(n)-1);
		var tmp2 = Math.ceil((d1+tmp1)*10000)/10000;
		L.push(tmp2);
		j=j+1;
	}

	return L;
}