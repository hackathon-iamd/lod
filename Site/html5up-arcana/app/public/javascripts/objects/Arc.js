Arc = function(startN,endN,name,material){
    THREE.Line.call(this,new THREE.Geometry(),material);
    this.startPoint = startN;
    this.endPoint = endN;
    this.name = name;
    this.linkSpreadFactor = 10;
    this.linkSpread = new THREE.Vector3(this.linkSpreadFactor * Math.random(),
                                        this.linkSpreadFactor * Math.random(),
                                        this.linkSpreadFactor * Math.random());
    this.subdivision = 40;
    
    this.startPoint.pushArc(this,true);
    this.endPoint.pushArc(this,false);
};

Arc.prototype=new THREE.Line();

Arc.prototype.constructor=Arc;

Arc.prototype.update = function(){
    
    var startP = this.startPoint.position.clone();
    var endP = this.endPoint.position.clone();
    var curve = new THREE.SplineCurve3([
        startP,
        new THREE.Vector3((startP.x+endP.x)/2+this.linkSpread.x, 
                                (startP.y+endP.y)/2+this.linkSpread.y, 
                                (startP.z+endP.z)/2+this.linkSpread.z),
        endP
    ]);
    this.geometry.vertices = [];
    var splinePoints = curve.getPoints(this.subdivision);
    
    for (j = 0; j < splinePoints.length; j++) {
        this.geometry.vertices.push( splinePoints[j] );
    }
    this.geometry.verticesNeedUpdate = true;
};

Arc.prototype.needsUpdate = function(bo){
    this.geometry.verticesNeedUpdate = bo;
};