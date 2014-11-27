BalancedParticle=function(material){
    THREE.Particle.call(this,material);
    this.velocity=new THREE.Vector3(0,0,0);
    this.force=new THREE.Vector3(0,0,0);
    this.drag=1;
};

BalancedParticle.prototype=new THREE.Particle();

BalancedParticle.prototype.constructor=BalancedParticle;

BalancedParticle.prototype.update=function(){
    this.velocity.addSelf(this.force);
    this.velocity.multiplyScalar(this.drag);
    this.position.addSelf(this.velocity);
    this.force.set(0,0,0);
}