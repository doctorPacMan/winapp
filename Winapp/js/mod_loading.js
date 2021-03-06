﻿"use strict";
var modLoading = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		var span = this.node.querySelectorAll('span');
		this._N = {
			'whereami':span[0],
			'authtoken':span[1],
			'playlist':span[2],
			'channels':span[3]
		};
		//console.log('modLoading initialize',this._N);
		this._bttn = this.node.querySelector('button');
		this._bttn.setAttribute('type','button');
		this.node.style.display = 'block';
		this.complete();
	},
	onfail: function() {
		//this.node.parentNode.removeChild(this.node);
		this._bttn.innerText = 'Reload';
		this._bttn.removeAttribute('disabled');
		this._bttn.onclick = function(){document.location.reload(true)};
	},
	onokay: function() {
		setTimeout(this.complete.bind(this),500);
	},
	progress: function(v, state) {
		var cn = 'idle';
		switch(state) {
			case null: cn = 'load';break;
			case false: cn = 'fail';break;
			case true: cn = 'okay';break;
		}
		this._N[v].className = cn;
		if(typeof(state)=='boolean') this._N[v] = state;

		if(state===false) this.onfail();

		var done = true, success = true;
		for(var i in this._N) {
			var mv = this._N[i];
			if(typeof(mv)!='boolean') {
				done = false;
				break;
			} else if(mv===false) success = false;
		}
		//if(done) console.log(success);
		if(done) this.onokay();
		
		return this;
	},
	complete: function() {

		//this._bttn.onclick = p.removeChild.bind(p,this.node);
		this._bttn.innerText = 'Continue';
		this._bttn.removeAttribute('disabled');

		var nv = this.node;

		var remove = (function(nv){
			return function(){
				if(nv.parentNode) nv.parentNode.removeChild(nv);
			}
		})(this.node);

		//var remove = function(e){console.log('ENDS',e)};

		nv.addEventListener('animationend',remove);
		nv.classList.add('anime-remove');
	}
});