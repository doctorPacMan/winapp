"use strict";
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
		//console.log('Listen',ename,callback);
		document.addEventListener(ename,callback,false);
	},
	fire: function(ename,detail) {
		//var args = Array.prototype.slice.call(arguments);
		//ename = args.shift();
		if(undefined===detail) detail = {};
		var ce = new CustomEvent(ename,{'detail':detail});
		//console.log('dispatchEvent',ename);
		document.dispatchEvent(ce);
	}
};