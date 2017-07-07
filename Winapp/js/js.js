var myApp = {
	load: function() {

		//console.log('myAppLoad');
		cnapi.initialize(this.onready.bind(this));
	},
	onready: function(channels) {

		document.getElementById('inf-provider').innerText = cnapi.location+' '+cnapi.provider;
		document.getElementById('inf-acstoken').innerText = cnapi.getAuthToken();
		console.log('READY', channels.length);
		this._channels = {};
		this._channels_list = document.getElementById('channels-list');
		while(channels.length) this.pushChannel(channels.shift());
		
		this._video = document.getElementById('vplayah');
		var cb = this._channels_list.querySelectorAll('a.chatile');
		for(var i=0;i<cb.length;i++) cb[i].onclick = this.clickChannel.bind(this);
		return;

		var resp = document.getElementById('resp'),
			prov = json.contractor,
			terr = json.territories[0];

		resp.innerText = '['+prov.contractorId+']'+prov.name;
		resp.innerText+=' ['+terr.territoryId+']'+terr.name;
		//cnapi.channels(this.onloadChannels.bind(this));

		var iptvs = [];
		for(var i=0,s;i<json.services.length;i++) {
			s = json.services[i];
			if(s.type=='iptv') iptvs = iptvs.concat(s.apiVersions.map(function(j){return j.location}));
		}
		console.log(iptvs);

		//this._channels = {};
		//$Ajax(iptvs[0],this.readPlaylist.bind(this));
		//$Ajax(iptvs[1],this.readPlaylist.bind(this));
	},
	pushChannel: function(json) {
		var ext = this._channels[json.id];
		if(ext) return;
		else this._channels[json.id] = json;
		//console.log(json);
		var li = document.createElement('li'),
			tile = document.createElement('a'),
			name = document.createElement('u'),
			logo = document.createElement('i'),
			cimg = document.createElement('img');
		
		name.innerText = json.title;
		if(json.logo) cimg.setAttribute('src',json.logo);
		logo.appendChild(cimg);

		tile.className = 'chatile';
		tile.setAttribute('data-cid',json.id);
		tile.setAttribute('href', json.src);
		tile.appendChild(logo);
		tile.appendChild(name);
		li.appendChild(tile);
		this._channels_list.appendChild(li);
	},
	clickChannel: function(event) {
		event.preventDefault();
		var cid = event.target.getAttribute('data-cid'),
			src = event.target.getAttribute('href');
		
		this._video.setAttribute('src',src);
		this._video.play();
		
		console.log(src);
	}
};