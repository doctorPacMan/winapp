var extendModule = function(extension) {
	//console.log('extendModule', extension);

	var newmod = function(){return this.initialize.apply(this,arguments)};
	newmod.prototype = Object.assign({}, appModule.prototype, extension);
	//newmod.prototype.constructor = extension.constructor;
	return newmod;
};
var appModule = function() {
	return this.initialize.apply(this,arguments);
	//for(var i in ext) this[i] = ext[i];
};
appModule.prototype = {
	initialize: function() {
		var args = Array.prototype.slice.call(arguments);
		console.log('MOD initialize',args)
	},
	listen: function(ename,callback) {
		document.addEventListener(ename,callback,false);
	},
	fire: function(ename,detail) {
		//var args = Array.prototype.slice.call(arguments);
		//ename = args.shift();
		//console.log('FIRE', ename, args);
		var ce = new CustomEvent(ename,{'detail':(detail||{})});
		document.dispatchEvent(ce);
	}
};