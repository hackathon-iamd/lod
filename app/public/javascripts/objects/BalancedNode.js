BalancedNode = function(name,geometry, material) {
    THREE.Mesh.call(this,geometry,material);
    this.velocity=new THREE.Vector3(0,0,0);
    this.force=new THREE.Vector3(0,0,0); 
    this.drag=1;
    this.arcs=[];
    this.types={};
    this.particles=[];
    this.siblings={};
    this.sourceName=name;
    this.expanded = false;
	//Label
	var label = makeTextSprite( " "+name+" ");
	label.position.set(0,0,0);
	this.label = label;
    this.sphereType =[];
    this.particleScale=0;
};

//BalancedNode.prototype = Object.create(THREE.Mesh.prototype);

BalancedNode.prototype=new THREE.Mesh();

BalancedNode.prototype.constructor=BalancedNode;

BalancedNode.prototype.update=function(){
    this.velocity.add(this.force);
    this.velocity.multiplyScalar(this.drag);
    this.position.add(this.velocity);
    this.force.set(0,0,0);
};

BalancedNode.prototype.pushArc = function(arc,depart){//depart is a boolean
    //add to types
    if(this.types[arc.name] == null){
        this.types[arc.name]={
            name:arc.name,
            arcs:[{arc:arc,depart:depart}]
        };
    }else{
        this.types[arc.name].arcs.push({arc:arc,depart:depart});
    }
    
    //add to siblings
    var sibling = depart?arc.startPoint:arc.endPoint;
    if(this.siblings[sibling.name] == null){
       this.siblings[sibling.name]=[]; 
    }
    this.siblings[sibling.name].push({arc:arc,depart:!depart});
};

BalancedNode.prototype.expand = function(){
    
};

var TO_RADIANS=Math.PI/180;

THREE.Vector3.prototype.rotateY=function(angle){cosRY=Math.cos(angle*TO_RADIANS);sinRY=Math.sin(angle*TO_RADIANS);var tempz=this.z;;var tempx=this.x;this.x=(tempx*cosRY)+(tempz*sinRY);this.z=(tempx*-sinRY)+(tempz*cosRY);}
THREE.Vector3.prototype.rotateX=function(angle){cosRY=Math.cos(angle*TO_RADIANS);sinRY=Math.sin(angle*TO_RADIANS);var tempz=this.z;;var tempy=this.y;this.y=(tempy*cosRY)+(tempz*sinRY);this.z=(tempy*-sinRY)+(tempz*cosRY);}
THREE.Vector3.prototype.rotateZ=function(angle){cosRY=Math.cos(angle*TO_RADIANS);sinRY=Math.sin(angle*TO_RADIANS);var tempx=this.x;;var tempy=this.y;this.y=(tempy*cosRY)+(tempx*sinRY);this.x=(tempy*-sinRY)+(tempx*cosRY);}
function randomRange(min,max)
{return((Math.random()*(max-min))+ min);}

function makeTextSprite( message, parameters )
{
	var parameters = {};
	
	var fontface = "Arial";
	var fontsize = 12;
	var borderThickness = 1;
	var borderColor = { r:0, g:0, b:0, a:1.0 };
	var backgroundColor = { r:255, g:255, b:255, a:1.0 };

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
	sprite.scale.set(100,50,1);
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