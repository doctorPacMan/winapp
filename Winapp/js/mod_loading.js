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
	},
	onfail: function() {
		//this.node.parentNode.removeChild(this.node);
		this._bttn.innerText = 'Retry';
		this._bttn.removeAttribute('disabled');
		this._bttn.onclick = function(){};
	},
	onokay: function() {
		//this.node.parentNode.removeChild(this.node);
		this._bttn.innerText = 'Continue';
		this._bttn.removeAttribute('disabled');
		var n = this.node;
		this._bttn.onclick = function(){n.parentNode.removeChild(n)};
		setTimeout(this._bttn.onclick.bind(this._bttn),1500);
	},
	progress: function(v, state) {
		var cn = 'idle';
		switch(state) {
			case 0: cn = 'load';
			break;
			case false: cn = 'fail';
			break;
			case true: cn = 'okay';
			break;
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
		if(done) console.log(success);
		if(done) this.onokay();
		
		return this;
	}
});