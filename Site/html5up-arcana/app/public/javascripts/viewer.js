if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//PARAMETERS
//STARS
var starCount = 500;
var starSize = 50;
var starSpread = 3000;
//SPHERE
var sphereSpread = 1000, sphereDetail=20, sphereMinRadius = 7, sphereMaxRadius = 20;
var sphereLimit = 30,sphereCount = 0;
var sphereOutileScale = 1.1;
//LINKS
var linkSpread = 100;
//var linkColor =0x29B6F6; //old color
var linkColor =0x0088ff;
var linkOpacity = 0.4;
var linkSubSegments = 60;
var color, colors = [];
//SKY
var skyBox;
var skyType = 1;

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

var simIncr = 0;

//tab for nodes ForceLoop
var sourceNodes = {},sourceNodesTab = [];
var arcs = {};
var expandedSources={};
var particleSprite = THREE.ImageUtils.loadTexture( "../public/images/electric.png" );

//Data
var rawData;

/*******************************************************************************************
										MAIN
*******************************************************************************************/
init();
//loadData();
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
	/*var light = new THREE.AmbientLight( 0x333333 );
	scene.add( light );
	var light2 = new THREE.DirectionalLight( 0xFFFFFF );
	light2.position.set( 0, 0, 1 ).normalize();
	scene.add( light2 );*/
	
	//RENDERER
	renderer = new THREE.WebGLRenderer( /*{ antialias: false }*/ );
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.sortObjects = false;
	container.appendChild( renderer.domElement );
	
	// CONTROLS
	controls = new THREE.TrackballControls( camera, renderer.domElement );

	//EVENTS
	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	window.addEventListener( 'resize', onWindowResize, false );
	
	//RAYCASTER PLANE
	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
		new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
	);
	plane.visible = false;
	scene.add( plane );
	
	//SKY
	initBetterSky()
	initSky();
	
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

	//sun parameters
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
	
	camera.lookAt(sunSphere.position)
}

function initBetterSky(){
	var geometry = new THREE.SphereGeometry(3000, 60, 40);
	var uniforms = {
	  texture: { type: 't', value: THREE.ImageUtils.loadTexture( "../public/images/sky.jpg" ) }
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
	skyBox.visible = false;
	scene.add(skyBox);
}

function initGUI(){
	//var gui = new dat.GUI();	
	var parameters={
		a: function(){simulateSceneNew()},
		b: function(){ 
			if(skyType == 0){//sky weiler
				skyBox.visible = false;
				particles.visible = false;
				skyType = 1;
			}else if(skyType == 1){ //sky buchette
				skyBox.visible = true;		
				particles.visible = false;	
				skyType = 2;
			}else if(skyType == 2){ //sky buchette + stars
				skyBox.visible = true;	
				particles.visible = true;	
				skyType = 0;
			}			
		},
		d: function(){clearScene();}
	};
    //gui.domElement.id = 'gui';
	
	//Notice this belongs to the DAT.GUI class (uppercase)
	// and not an instance thereof.
	//DAT.GUI.autoPlace = false;

	gui = new dat.GUI( { autoPlace: false } );	
	gui.add( parameters,'b').name("Change sky");
	gui.add( parameters,'a').name("Simulate data");
	gui.add( parameters,'d').name("Clear scene");
	gui.close();	

	// Do some custom styles ...
	gui.domElement.style.position = 'absolute';
	gui.domElement.style.top = '20px';
	gui.domElement.style.left = '20px';

	var el = document.getElementById('my-gui-container')
	if(el!=null)
		el.appendChild( gui.domElement );
}

function initStars(){
	//loading of the image
	sprite = THREE.ImageUtils.loadTexture("../public/images/whitePart.png");
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

function simulateSceneNew(){	
	var s1 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s2 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s3 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s4 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s5 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s6 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	var s7 = makeSourceNode("S"+simIncr,"S"+simIncr);simIncr++;
	makeArc(""+simIncr,s1,s2,5);simIncr++;
	makeArc(""+simIncr,s1,s3,2);simIncr++;
	makeArc(""+simIncr,s2,s3,30);simIncr++;
	makeArc(""+simIncr,s4,s3,15);simIncr++;
	makeArc(""+simIncr,s4,s1,30);simIncr++;
	makeArc(""+simIncr,s2,s5,3);simIncr++;
	makeArc(""+simIncr,s4,s5,11);simIncr++;
	makeArc(""+simIncr,s6,s2,5);simIncr++;
	makeArc(""+simIncr,s7,s6,10);simIncr++;
	makeArc(""+simIncr,s7,s2,12);simIncr++;
}
/********************************************************************************************************************************
	MAKE ELEMENTS
*********************************************************************************************************************************/

function loadData()
{
	window.socket = io();
	socket.on('graph', function (graph) {
		clearScene();
		rawData = JSON.parse(graph)
		createScene();
	});    
}


function createScene(){
	for(type in rawData.sources){
		makeSourceNode(type,rawData.sources[type].name);
	}
	///TODO
	for(type in rawData.types){
		if(rawData.types[type].sources.length>1){
			for(j=0;j<rawData.types[type].sources.length-1;j++){
				for(k=j+1;k<rawData.types[type].sources.length;k++)
					makeArc(""+type+k,sourceNodes[rawData.types[type].sources[j]],sourceNodes[rawData.types[type].sources[k]]);
			}
		}
	}
}


function clearScene(){
	for(i in expandedSources){		
		for(j=0;j<expandedSources[i].particles.length;j++)
			scene.remove(expandedSources[i].particles[j]);
		scene.remove(expandedSources[i]);
	}
	expandedSources={};
	for(i in sourceNodes){
		scene.remove(sourceNodes[i].getLabel());
		scene.remove(sourceNodes[i]);
	}
	sourceNodes = {};	
	sourceNodesTab = [];
	for(i in arcs){		
		scene.remove(arcs[i]);
	}
	arcs = {};
}

function makeArc(id,s1,s2,n){
	if(n==null)
		n=1;
	var dif="";
	for(i=0;i<n;i++){
		if(i>0)
			dif=i;
		//material = new THREE.LineBasicMaterial( { color: linkColor, transparent: true, opacity: linkOpacity} );
		material = new THREE.MeshBasicMaterial({
                        transparent: true,
                        opacity: 0.2,
                        depthTest: true,
                        color: 0x0088ff,
                        blending: THREE.AdditiveBlending
                    });
		var line = new Arc(s1,s2,id+dif,material);
		arcs[id+dif] = line;
		scene.add(line);	
	}
}

function makeSourceNode(id,name){
	radius = getRandom(sphereMinRadius,sphereMaxRadius);
	geometry = new THREE.SphereGeometry( radius, sphereDetail, sphereDetail );
	//material = new THREE.MeshLambertMaterial( { color: getRandomColor() } );
	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var material = new THREE.ShaderMaterial( 
		{
			uniforms: 
			{ 
				"c":   { type: "f", value: 1.0 },
				"p":   { type: "f", value: 2.5 },
				glowColor: { type: "c", value: new THREE.Color(/*0x00f0ff*/getRandomColor()) },
				viewVector: { type: "v3", value: camera.position }
			},
			vertexShader:  document.getElementById( 'vertexShader'   ).textContent,
			fragmentShader:document.getElementById( 'fragmentShader' ).textContent,
			side: THREE.FrontSide,
			blending: THREE.AdditiveBlending,
			transparent: false
		}   ); 
	
	var node = new BalancedNode(name, geometry, material );

	node.position.set(0,1,100); 
	node.velocity.set(1,0,0);
	node.velocity.rotateZ(Math.random()*90);			
	node.velocity.rotateY(Math.random()*360);
	node.position.rotateZ(Math.random()*360); 

	node.drag = 0.96;

	sourceNodes[id] = node;
	sourceNodesTab.push(node);
	scene.add( node );
	scene.add(node.label);
	return node;
}

///TODO
function makeTypeNode(type,parent,i){
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
	uniformSourceNodes();
	uniformTypeNodes();
	uniformArcs();
	requestAnimationFrame( animate );
	labelsUpdate();
	TWEEN.update(time);
	controls.update();

	render();
}

function render() {
	renderer.render( scene, camera );
}


function labelsUpdate(){
	// pour chaque sphere
	for(node in sourceNodes){
		//position de la cam�ra
		var sPos3 = sourceNodes[node].position;
		//position de la sphere
		var cPos3 = camera.position;
		//distance entre la sphere et la camera
		var dist = sPos3.distanceTo(cPos3);
		//�chelle de distance entre sphere-label et sphere-camera
		var percentDistLabel = (sourceNodes[node].geometry.boundingSphere.radius+0)/dist;
		//vecteur diff�rence entre position label et position sphere
		var dist3 = cPos3.clone().sub(sPos3).multiplyScalar(percentDistLabel);
		//position du label
		var lPos = sPos3.clone().add(dist3);
		sourceNodes[node].label.position.copy(lPos);
	}
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

	var intersects = raycaster.intersectObjects( sourceNodesTab );
	///TODO add outline
	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			//if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			//INTERSECTED.currentHex = INTERSECTED.material.color.getHex();


			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		//if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
	mouseDown.set(mouse.x,mouse.y);

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( sourceNodesTab );

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