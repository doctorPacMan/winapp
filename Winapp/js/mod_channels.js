"use strict";
var modChannels = extendModule({
	initialize: function(node_id, channels) {
		
//console.log('modChannels initialize');
		
		this.name = 'modChannels';
		this.node = document.getElementById(node_id);
		this.list = this.node.getElementsByTagName('ol')[0];
		this._tiles = {};
		this._current = false;

		this.listen('channelView',this.onChannelView.bind(this));
//		console.log('MC init', this.node);

		if(true) this.list.innerHTML = '';
		else {
			var cb = this.node.querySelectorAll('a.chatile');
			for(var i=0;i<cb.length;i++) {}
		}
	},
	update: function(channels) {

		var df = document.createDocumentFragment(),
			fs = document.createDocumentFragment(),
			li = document.createElement('li'),
			ch, ct;

		var top = ['51074087','40307207','26957011','10338194'],
			df_top = document.createDocumentFragment();// just for top
		
		var scl = ['10338227','22615442'],
			df_scl = document.createDocumentFragment();// wrong scale channels

		for(var id in channels) {

			ct = this.getTile(channels[id]);
			li = li.cloneNode(false);
			li.appendChild(ct);

			if(top.indexOf(id)>=0) df_top.appendChild(li);
			else if(scl.indexOf(id)>=0) df_scl.appendChild(li);
			else df.appendChild(li);
			
			ct.addEventListener('click',this.onChannelClick.bind(this,id),false);
			this._tiles[id] = li;
		}
		this.list.appendChild(df_top);
		this.list.appendChild(df_scl);
		this.list.appendChild(df);
//		console.log('MCupdate',channels[34498202]);
	},
	getTile: function(cha) {
		
		var tile = document.createElement('a'),
			name = document.createElement('u'),
			logo = document.createElement('i'),
			cimg = document.createElement('img');

		name.innerText = cha.title;
		cimg.setAttribute('src',cha.logo||'./img/logo150x150.png');
		logo.appendChild(cimg);

		tile.className = 'chatile';
		tile.setAttribute('data-cid',cha.cid||'');
		//tile.setAttribute('href',cha.src);
		tile.appendChild(logo);
		tile.appendChild(name);
		return tile;		
	},
	onChannelClick: function(id, event) {
		if(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		this.fire('channelView',{channelId:id});
	},
	onChannelView: function(event) {

		var cur = this._current ? this._tiles[this._current] : null;
		if(cur) cur.classList.remove('st-view');

		var id = event.detail.channelId;
		this._tiles[id].classList.add('st-view');
		this._current = id;

		//var cha = $App.getChannelById(id);
		//console.log('onChannelView',cha);
	}
});