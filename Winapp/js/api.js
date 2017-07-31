var cnapi = {
	//token: '00954bafe0c6182bb730d240f5147dd8',
	apiurl: 'http://api.peers.tv',
	//apiurl: 'http://a.trunk.ptv.bender.inetra.ru',
	token: null,
	location: null,
	provider: null,
	initialize: function(callback) {
		var apiurl = this.apiurl+'/registry/2/whereami.json',
			colbek = this._handler_whereami.bind(this);
		
		this._onready = callback;
		$Ajax(apiurl,colbek,null,true);
	},
	_handler_whereami: function(data, xhr) {

		console.log('Whereami',data);
		if(data===false) return alert('Whereami failure');

		var terr = data.territories[0];
		this.location = terr.territoryId;
		this.timezone = terr.timezone;

		//var hdt = xhr.getResponseHeader('Date');// Access-Control-Expose-Headers: Date
		//var hdt = (new Date('2017/07/29 09:34:00')).formatHeader();
		var hdt = (new Date).formatHeader();
		
		var sdt = hdt ? new Date(hdt) : new Date(),
			wtz = (data.territories[0].timezone/60),
			dtz = wtz + sdt.getTimezoneOffset();
		sdt.setMinutes(sdt.getMinutes() + dtz);
		if(hdt)	console.log('Whereami datetime', sdt, hdt);
		else console.log('Whereami timezone', sdt, dtz==0 ? 'OK' : ('incorrect: '+dtz));

		var provider = null;
		if(data.contractor) {
			var provider = {
				id: data.contractor.contractorId,
				name: data.contractor.name
			};
			if(data.contractor.images) data.contractor.images.forEach(function(v){if(v.profile==2)provider.logo=v.URL});
		}
		console.log('Whereami provider', this.provider = provider);

		var playlists = {}, mlocators = {}, apislist = {};
		data.services.forEach(function(v){
			var uri = !v.apiVersions.length ? null : v.apiVersions[v.apiVersions.length-1].location,
				pid = !v.contractor ? 0 : v.contractor.contractorId;
			if(v.type=='auth') apislist.auth = uri;
			if(v.type=='tv_guide') apislist.tvguide = uri;
			if(v.type=='media_locator') mlocators[pid] = uri;
			if(v.type=='iptv') playlists[pid] = uri;
		});
		//playlists['x'] = 'http://peerstv.io/data/m3u/playlist.xspf';
		this._temp_playlists = playlists;
		this.apis = apislist;

		console.log('Whereami apislist', apislist);
		console.log('Whereami playlist', playlists);
		console.log('Whereami mlocator', mlocators);

		var token = this.getAuthToken();token = 'cd4e5a6bee96fec8b50e9831cdac2572';
		if(!token) {
			var apiurl = this.apis.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl,this._handler_acstoken.bind(this),params);
		}
		else {
			console.log('Auth token',token);
			this.token = token;
			this._request_playlists();
		}
	},
	_handler_acstoken: function(data) {
		console.log('acstoken',data);
		var token = data.access_token,
			renew = data.refresh_token,
			expin = parseInt(data.expires_in, 10),
			expat = new Date().getTime() + expin*1000;
		cookie.set('token', token, expat);
		cookie.set('renew', renew, new Date().getTime() + 86400*30*1000);// 30 days
		this.token = token;
		this._request_playlists();
	},
	_request_playlists: function() {
		var playlists = this._temp_playlists;
		delete this._temp_playlists;

		var progress = {},
			channels = new ChannelsPlaylist(),
			loadinfo = this._request_channels.bind(this),
			complete = function(pl) {
				for(var pid in pl) channels.push(pid, pl[pid]);
				loadinfo(channels);
			},
			callback = function(pid,src){return function(data,xhr){
				var done = true; progress[pid] = data;
				for(var s in progress) if(progress[s]===undefined) done = false;
				if(done) complete(progress);
			}};
		for(var pid in playlists) {
			progress[pid] = undefined;
			$Ajax(playlists[pid], callback(pid,playlists[pid]), null, true);
		}
	},
	_request_channels: function(playlist){
		//console.log(playlist);
		var onload = this._handler_channels.bind(this,playlist);
		this.request.channels(playlist.cids.join(','),onload);
	},
	_handler_channels: function(playlist, channels) {
		//console.log('playlist',playlist);
		//console.log('channels',channels);
		//console.log(playlist.cids.length, channels.length);
		for(var j=0; j<channels.length; j++) {
			var data = channels[j],
				cid = data.channelId;
			playlist.channelExtend(cid, data);
		}
		this._onready(playlist);
	},
	setAuthToken: function(token, exp) {
		var expires = parseInt(exp, 10),
			expires = new Date().getTime() + expires*1000;
		// console.log(token, exp, expires);
		cookie.set('token', token, expires);
		return this.getAuthToken();
	},
	getAuthToken: function() {
		return this.token || cookie.get('token');
	}
}