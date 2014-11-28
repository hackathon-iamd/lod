BalancedParticle=function(name,parent,i,geometry,material){
    THREE.PointCloud.call(this,geometry,material);
    this.name = name;
    this.parentSource = parent;
    this.particleNumber=i;
};

BalancedParticle.prototype=new THREE.PointCloud();

BalancedParticle.prototype.constructor=BalancedParticle;

BalancedParticle.prototype.update=function(){
    //console.log(this.parentSource.sphereType[this.particleNumber]);
 this.position.addVectors(this.parentSource.position,this.parentSource.sphereType[this.particleNumber].clone().multiplyScalar(this.parentSource.particleScale)) ;
}