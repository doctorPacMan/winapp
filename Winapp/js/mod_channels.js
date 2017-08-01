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

		var cb = this.node.querySelectorAll('a.chatile');
		for(var i=0;i<cb.length;i++) {
			//cb[i].onclick = this.clickChannel.bind(this,cb[i]);
			cb[i].onclick = function(e){console.log(e)};
		}

	},
	update: function(channels) {

		var df = document.createDocumentFragment(),
			li = document.createElement('li'),
			ch, ct;

		for(var id in channels) {
			ct = this.getTile(channels[id]);
			li = li.cloneNode(false);
			li.appendChild(ct);
			df.appendChild(li);
			ct.onclick = this.onChannelClick.bind(this,id);
			this._tiles[id] = li;
		}
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
		tile.setAttribute('href',cha.src);
		tile.appendChild(logo);
		tile.appendChild(name);
		return tile;		
	},
	onChannelClick: function(id, event) {
		if(event) event.preventDefault();
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