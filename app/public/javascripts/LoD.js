if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//PARAMETERS
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
//STARS
var starCount = 500;
var starSize = 50;
var starSpread = 3000;

var DEBUG = false;
//var container;
var camera, scene, renderer;
var geometry,color, colors = [],particles,skyBox;
var controls, clock = new THREE.Clock();
var material, mesh, lod;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED = null;
var keyboard = new THREEx.KeyboardState();

//array for nodes ForceLoop
var sourceNodes = {};
var arcs = {};
var expandedSources={};

//Data
var rawData;

/*******************************************************************************************
										MAIN
*******************************************************************************************/
init();
//loadData();
//simulateScene();
simulateSceneNew();
animate();

/*******************************************************************************************
								INITIALIZATION FUNCTIONS
*******************************************************************************************/
function init() {
	//DOCUMENT
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
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	
	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	
	// when the mouse moves, call the given function
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );	
	document.addEventListener( 'click', onDocumentMouseClick, false );	
	window.addEventListener( 'resize', onWindowResize, false );	
	
	//SKY
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
	scene.add(skyBox);	
	
	//STARS	
	initStars();

	//GUI	
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

//CREATION OF THE STARS PARTICLES
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
	}
	geometry.colors = colors;
	material = new THREE.PointCloudMaterial( { size: starSize, map: sprite, vertexColors: THREE.VertexColors, transparent: true } );
	particles = new THREE.PointCloud( geometry, material );
	particles.sortParticles = true;
	scene.add( particles );
}

function loadData()
{
	var socket = io();

		socket.on('graph', function (graph) {
			//console.log(JSON.parse(graph))
			rawData = JSON.parse(graph)
			createScene();
		});

		socket.on('source', function (graph) {
			
		});            
}

/*******************************************************************************************
								ELEMENTS CREATION
*******************************************************************************************/

function createScene(){
	for(i in rawData.sources){
		makeSourceNode(i,rawData.sources[i].name);
	}
	for(i in rawData.types){
		if(rawData.types[i].sources.length>1)//Voir 3
			makeArc(i,sourceNodes[rawData.types[i].sources[0]],sourceNodes[rawData.types[i].sources[1]]);
	}
}

function simulateScene(){
	var s1 = createSphere("DB Pedia");	
	var s2 = createSphere("Drugbank");
	var s3 = createSphere("TNpedia");
	createLink(s1,s2,6);
	createLink(s1,s3,3);
	createLink(s3,s2,10);
}
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

function createLink(s1,s2,n){
	//si n est nul on le met a 1 pour créer un seul lien
	if(n==null)
		n=1;
	//on va créer n liens
	for(i=0;i<n;i++){
		//création d'une forme
		var link = new THREE.Shape();
		geometry = new THREE.Geometry();
		curve = new THREE.QuadraticBezierCurve3();
		curve.v0 = new THREE.Vector3(s1.x, s1.y, s1.z);//pt1
		curve.v1 = new THREE.Vector3((s1.x+s2.x)/2+linkSpread*Math.random(), 
									(s1.y+s2.y)/2+linkSpread*Math.random(), 
									(s1.z+s2.z)/2+linkSpread*Math.random());//pt2
		curve.v2 = new THREE.Vector3(s2.x, s2.y, s2.z);//pt3
		for (j = 0; j < linkSubSegments; j++) {
			geometry.vertices.push( curve.getPoint(j / linkSubSegments) )
		}
		material = new THREE.LineBasicMaterial( { color: linkColor, linewidth: 2 } );
		line = new THREE.Line(geometry, material);
		scene.add(line);	
	}
}

function createSphere(name,x,y,z){
	if(sphereCount < sphereLimit){
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
		sphere.tag = "source";
		sphere.radius = radius;
		sphere.position.copy(new THREE.Vector3(x,y,z));
		sphere.updateMatrix();
		sphere.matrixAutoUpdate = false;
		
		var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: color, side: THREE.BackSide } );
		var outlineMesh1 = new THREE.Mesh( geometry, outlineMaterial1 );
		outlineMesh1.position.copy(sphere.position);
		outlineMesh1.scale.multiplyScalar(1.05);
		outlineMesh1.visible = false;
		scene.add( outlineMesh1 );	
		sphere.outline = outlineMesh1;
		
		var label = makeTextSprite( " "+name+" ", { fontsize: 40, backgroundColor: {r:255, g:255, b:255, a:1} } );
		label.position.x = x+50;
		label.position.y = y+50;
		label.position.z = z+50;
		scene.add( label );	
			
		var source = {x:x,y:y,z:z,sphere:sphere,radius:radius,label:label,outline:outlineMesh1};
		sphereDict.push(source);
		scene.add( sphere );
		sphereCount++;
		return source;
	}
}

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
/*******************************************************************************************
								RENDERING FUNCTIONS
*******************************************************************************************/
function animate() {
	time = Date.now();

	uniformSourceNodes();
	uniformTypeNodes();
	uniformArcs();
	requestAnimationFrame( animate );
	labelsUpdate();
	raycastUpdate();

	controls.update();

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

function labelsUpdate(){	
	/*// pour chaque sphere
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
	}*/
	
	// pour chaque sphere
	for(node in sourceNodes){
		//position de la caméra
		var sPos3 = sourceNodes[node].position;
		//position de la sphere
		var cPos3 = camera.position;
		//distance entre la sphere et la camera
		var dist = sPos3.distanceTo(cPos3);
		//échelle de distance entre sphere-label et sphere-camera
		var percentDistLabel = (sourceNodes[node].geometry.boundingSphere.radius+0)/dist;
		//vecteur différence entre position label et position sphere
		var dist3 = cPos3.clone().sub(sPos3).multiplyScalar(percentDistLabel);
		//position du label
		var lPos = sPos3.clone().add(dist3);
		sourceNodes[node].label.position.copy(lPos);
	}
}

function raycastUpdate(){
	// find intersections

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	vector.unproject(camera);
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( scene.children );

	// INTERSECTED = the object in the scene currently closest to the camera 
	//		and intersected by the Ray projected from the mouse position 	
	
	// if there is one (or more) intersections
	if ( intersects.length > 0 )
	{	
		for(i=0;i<intersects.length;i++){				
			//if(intersects[i].object.tag=="source"){
			if(intersects[i].object.type=="Mesh" && intersects[i].object instanceof BalancedNode){
			
				// if the closest object intersected is not the currently stored intersection object
				if (intersects[ i ].object != INTERSECTED ) 
				{
					//on supprime le contour de l'ancien object choisi
					if ( INTERSECTED ) 
						scene.remove(INTERSECTED.outline);
					// on sauvegarde l'object choisi
					INTERSECTED = intersects[ i ].object;
					//On créer un coutour pour l'object choisi
					var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: INTERSECTED.material.color, side: THREE.BackSide } );
					var outlineMesh1 = new THREE.Mesh( INTERSECTED.geometry, outlineMaterial1 );
					outlineMesh1.position.copy(INTERSECTED.position);
					outlineMesh1.scale.multiplyScalar(sphereOutileScale);
					INTERSECTED.outline = outlineMesh1;
					scene.add( outlineMesh1 );
		
					//on affiche le contour de l'objet choisi
					//INTERSECTED.outline.visible = true;
				}
				else{ //we update the position of it outline object
					INTERSECTED.outline.position.copy(INTERSECTED.position);				
				}
				break;
			}
			else // there are no intersections
			{
				//on supprime le contour de l'ancien object choisi
				if ( INTERSECTED ) 
					scene.remove(INTERSECTED.outline);
				// remove previous intersection object reference
				//     by setting current intersection object to "nothing"
				INTERSECTED = null;
			}
		}
	} 	
}

/*******************************************************************************************
								UNIFORMISATION FUNCTIONS
*******************************************************************************************/
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
}

function uniformTypeNodes(){
	for(expandedSource in expandedSources){
		//Uniform type particles
		var repelforce = new THREE.Vector3(0,0,0),
			mag, 
			repelstrength; 
		var particles = expandedSources[expandedSource].particles;

		for (i=0; i<particles.length; i++){
			var p1 = particles[i]; 

			repelforce.copy(p1.position);

			mag = repelforce.length(); 

			repelstrength = (mag - 100) *-1; 

			if(mag>0){
				repelforce.multiplyScalar(repelstrength/mag);
				p1.position.add(repelforce); 
			}

			if(i>=particles.length-1) continue; 

			for(j=i+1; j<particles.length; j++) {
				var p2 = particles[j];

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
		for (i=0; i<particles.length; i++){
			var particle = particles[i]; 
			particle.update();
		}
	}
}

function uniformArcs(){
	// iteratate through each arc
	for (i in arcs){
		var arc = arcs[i]; 
		arc.update();
	}
}

/*******************************************************************************************
										ON EVENTS
*******************************************************************************************/
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) 
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function onDocumentMouseClick(){
	//TWEEN CAMERA
	/*if(INTERSECTED){
		controls.target.set(INTERSECTED.position.x,INTERSECTED.position.y,INTERSECTED.position.z);
		//position de la camera
		var cPos3 = camera.position;
		//position de la sphere
		var sPos3 = INTERSECTED.position;
		//distance entre la sphere et la camera
		var dist = sPos3.distanceTo(cPos3);
		var movingDistance = dist - INTERSECTED.radius - 100;
		camera.translateZ( -movingDistance );
	}*/
}
/*******************************************************************************************
										HELPER FUNCTIONS
*******************************************************************************************/
function getRandomColor(){
	return Math.random() * 0x808080 + 0x808080;
}

function getRandom(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

