"use strict";
var modSettings = extendModule({
	PRFX:'appcfg',
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('channelView',this.onChannelView.bind(this));
		this._settings = {};

		var boxes = this.node.querySelectorAll('input[type="checkbox"]');
		for(var i=0,box,bn,bv,lv;i<boxes.length;i++) {
			box = boxes[i];
			bn = box.name.replace('cbox_','');
			bv = box.getAttribute('checked')!==null;
			lv = this.load(bn);
			if(lv!==null && lv!=bv) box[(box.checked=lv) ? 'setAttribute' : 'removeAttribute']('checked','');
			box.addEventListener('click',this.changeCheckbox.bind(this,bn,box),false);
			// console.log(bn, bv, lv);
			if(lv===null) this.save(bn, bv);
			else this._settings[bn] = lv;
		}
		console.log('modSettings', this._settings);
	},
	changeCheckbox: function(name, chbox, event) {
		var bv = chbox.checked;
		chbox[bv ? 'setAttribute' : 'removeAttribute']('checked','');
		//console.log('changeCheckbox', name+'#'+chbox.name, bv);
		this.save(name, bv);
	},
	get: function(name) {
		//console.log(name, this._settings, this._settings[name])
		return this._settings[name];
	},
	load: function(name, value) {
		var s_name = this.PRFX+':'+name;
		var sv = localStorage.getItem(s_name);
		
		if(sv===null) sv = null;
		else if(sv==='true') sv = true;
		else if(sv==='false') sv = false;
		else if(sv==='undefined') sv = undefined;
		return sv;
	},
	save: function(name, value) {
		var newval,
			oldval = this.load(name),
			s_name = this.PRFX+':'+name;
		
		if(value===null) {
			localStorage.removeItem(s_name);
			delete this._settings[name];
			newval = this.load(name);
		} else {
			localStorage.setItem(s_name, value);
			this._settings[name] = newval = this.load(name);
		}
		//console.log('SAVE', name, newval);
		//localStorage.removeItem('data_whereami',JSON.stringify(data));
		this.fire('settingsChange',{name:name,oldvalue:oldval,newvalue:newval});
	},
	onChannelView: function(event) {
	}
});