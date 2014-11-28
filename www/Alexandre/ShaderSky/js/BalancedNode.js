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