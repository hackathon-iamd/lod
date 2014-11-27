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
    var curve = new THREE.QuadraticBezierCurve3();
    curve.v0 = this.startPoint.position.clone();
    curve.v2 = this.endPoint.position.clone();
    curve.v1 = new THREE.Vector3((curve.v0.x+curve.v2.x)/2+this.linkSpread.x, 
                                (curve.v0.y+curve.v2.y)/2+this.linkSpread.y, 
                                (curve.v0.z+curve.v2.z)/2+this.linkSpread.z);
    this.geometry.vertices = [];
    for (j = 0; j < this.subdivision; j++) {
        this.geometry.vertices.push( curve.getPoint(j / this.subdivision) );
    }
    this.geometry.verticesNeedUpdate = true;
};

Arc.prototype.needsUpdate = function(bo){
    this.geometry.verticesNeedUpdate = bo;
};