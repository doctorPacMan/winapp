var cnapi = {
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

		var whrmdate = false;
		//var whrmdate = xhr.getResponseHeader('Date');
		if(whrmdate) Date.server(whrmdate);
		else if(terr.timezone) {
			var dt = new Date(),
				dtz = dt.getTimezoneOffset() + terr.timezone/60;
			Date.server(dt.setMinutes(dt.getMinutes() + dtz));
		}
		console.log('Whereami datetime', new Date.server());
		//var dc = new Date(), ds = new Date.server();
		//console.log('client '+dc.getTime()+' '+dc+'\nserver '+ds.getTime()+' '+ds);

		var provider = null;
		if(data.contractor) {
			var provider = {
				id: data.contractor.contractorId,
				name: data.contractor.name
			};
			if(data.contractor.images) data.contractor.images.forEach(function(v){if(v.profile==1)provider.logo=v.URL});
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
		//playlists = {'x':'/data/playlist.xspf'};
		playlists['x'] = '/data/playlist.xspf';
		this._temp_playlists = playlists;
		this.apis = apislist;

		console.log('Whereami apislist', apislist);
		console.log('Whereami playlist', playlists);
		console.log('Whereami mlocator', mlocators);

		//this.setAuthToken('cd4e5a6bee96fec8b50e9831cdac2572');
		if(this.token = this.getAuthToken()) {
			console.log('Authtoken restore', this.token);
			this._request_playlists();
		}
		else {
			var apiurl = this.apis.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl,this._handler_acstoken.bind(this),params);
		}
	},
	_handler_acstoken: function(data) {
		//console.log('TOKEN',data);
		var token = data.access_token,
			renew = data.refresh_token,
			expin = parseInt(data.expires_in, 10),
			expdt = Date.now() + expin*1e3,
			expdt = new Date(expdt).format('yyyy/mm/dd h:nn:ss');
		
		this.setAuthToken(token, expdt, renew);
		console.log('Authtoken set new', this.token);
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

		var missed = [].concat(playlist.cids);
		for(var j=0; j<channels.length; j++) {
			var data = channels[j],
				cid = data.channelId.toString();
			playlist.channelExtend(cid, data);

			var n = missed.indexOf(cid);
			if(n>-1) missed.splice(n,1);
		}
	
		for(var j=0, titles = []; j<missed.length; j++) titles.push(playlist.channels[missed[j]].title);
		if(titles.length) console.log('Missed channels: ', titles);
		//cnapi.request.idbytitle(titles, this._handler_idbytitle.bind(this,playlist));
		this._onready(playlist);
	},
	_handler_idbytitle: function(playlist, data) {
		console.log(data);
	},
	setAuthToken: function(token, expdt, refresh) {

		//console.log('setAuthToken', token, expdt, refresh);

		if(!expdt) {
			expdt = Date.now() + 86400*1e3,// 24h
			expdt = new Date(expdt).format('yyyy/mm/dd h:nn:ss');
		}

		cookie.set('token', token, expdt);
		localStorage.setItem('token',token);
		localStorage.setItem('token_expires',expdt);

		if(refresh && false) {
			var expre = Date.now() + 86400*7*1e3;// 7 days
				expre = new Date(expre).format('yyyy/mm/dd h:nn:ss');
			cookie.set('refresh', refresh, expre);
			localStorage.setItem('token_refresh',refresh);
		}
		
		return this.token = this.getAuthToken();
	},
	getAuthToken: function() {
		
		if(this.token) return this.token;
		
		var val = localStorage.getItem('token'),
			exp = localStorage.getItem('token_expires');
		if(!val || !exp) return null;
		
		var old = new Date(exp) - Date.now(),
			lifetime = Math.round(old/1000/60),
			obsolete = old<0,
			token = obsolete ? null : val;

		if(obsolete) {
			localStorage.removeItem('token');
			localStorage.removeItem('token_expires');
		}
		//console.log('getAuthToken', val, exp, obsolete, lifetime+'m');
		return token;
	}
}