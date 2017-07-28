var cnapi = {
	//token: '00954bafe0c6182bb730d240f5147dd8',
	//apiurl: 'http://api.peers.tv',
	apiurl: 'http://a.trunk.ptv.bender.inetra.ru',
	token: null,
	location: null,
	provider: null,
	initialize: function(callback) {
		var apiurl = this.apiurl+'/registry/2/whereami.json',
			colbek = this._handler_whereami.bind(this);
		$Ajax(apiurl,colbek,null,true);
	},
	_handler_whereami: function(data, xhr) {

		// Access-Control-Expose-Headers

		console.log('Whereami',data);
		if(data===false) return alert('Whereami failure');

		var terr = data.territories[0];
		this.location = terr.territoryId;
		this.timezone = terr.timezone;

		var hdt = xhr.getResponseHeader('Date'),
			sdt = hdt ? new Date(hdt) : new Date(),
			wtz = (data.territories[0].timezone/60),
			dtz = wtz + sdt.getTimezoneOffset();
		if(hdt) {
			sdt.setMinutes(sdt.getMinutes() + dtz);
			console.log('Whereami datetime', sdt);
		}
		console.log('Whereami timezone', dtz==0 ? 'OK' : ('incorrect: '+dtz));

		var provider = {
			id: data.contractor.contractorId,
			name: data.contractor.name
		};
		if(data.contractor.images) data.contractor.images.forEach(function(v){if(v.profile==2)provider.logo=v.URL});
		this.provider = provider;

		var playlist = {}, mlocator = {}, apislist = {};
		data.services.forEach(function(v){
			var uri = !v.apiVersions.length ? null : v.apiVersions[v.apiVersions.length-1].location,
				pid = !v.contractor ? 0 : v.contractor.contractorId;
			if(v.type=='auth') apislist.auth = uri;
			if(v.type=='tv_guide') apislist.tvguide = uri;
			if(v.type=='media_locator') mlocator[pid] = uri;
			if(v.type=='iptv') playlist[pid] = uri;
		});
		console.log('Whereami provider', provider);
		console.log('Whereami apislist', apislist);
		console.log('Whereami playlist', playlist);
		console.log('Whereami mlocator', mlocator);

		var token = this.getAuthToken();token = 'ef345db0e7385252d2ec7590ad601446';
		if(!token) {
			var apiurl = apislist.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl,this._handler_acstoken.bind(this),params);
		}
		else {
			console.log('Auth token',token);
			this.token = token;
		}
	},
	_handler_acstoken: function(data) {
		console.log('acstoken',data);
		var token = data.access_token,
			renew = data.refresh_token,
			expin = parseInt(data.expires_in, 10),
			expat = new Date().getTime() + expin*1000;
		cookie.set('token', token, expat);
		cookie.set('renew', renew, new Date().getTime() + 86400*3*1000);// 3 days
		return this.getAuthToken();

		//this.token = this.setAuthToken(data.access_token, data.expires_in);
	},
	initializeOLD: function(callback) {

		this.data = {};
		this.apis = {};
		this._onready = callback;
		this._tmp_iptvsrc = [];
		this._tmp_iptvcha = {};

		var apiurl = this.apiurl+'/registry/2/whereami.json';
		$Ajax(apiurl,this._handler_whereami.bind(this),null,false);

		var token = this.getAuthToken();
		token = false;
		//token = 'ecf362092aae55ab06e0fa027aba006a';
		console.log('TOKEN ' + (token ? token : 'get new'));

		this._handler_acstoken({access_token: "399496038430131e864753c7ea0a5569", token_type: "bearer", expires_in: 86400, refresh_token: "1839cdecb887d6fc933009efd5615015"});
/*
		if (token) this.setAuthToken(token);
		else {
			var apiurl = this.apis.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl, this._handler_acstoken.bind(this),params,false);
		};
*/		
		//console.log(this.location, this.provider, this.token);
		//this._tmp_iptvsrc = ["/data/playlist.m3u"];
		//this._tmp_iptvsrc = ["http://tv.novotelecom.ru/playlist", "http://api.peers.tv/iptv/2/playlist.m3u"];
		var iptv = this._tmp_iptvsrc;
		if(!iptv.length) this._handler_channels([]);
		//else for(var k=0;k<iptv.length;k++) $Ajax(iptv[k],this._onload_channels.bind(this,iptv[k]));
	},
	_handler_whereamiOLD: function(data) {
		console.log('whereami',data);

		var apis = {};
		var iptv = [];
		data.apis.forEach(function(v){
			var at = v.apiType,
				av = v.apiVersions.pop();
			if(at=='tv_guide') apis[at] = av.location;
			else if(at=='auth') apis[at] = av.location;
			else if(at=='iptv') iptv.push(av.location);
			//console.log(at, av);
		});

		data.services.forEach(function(v){
			var at = v.type,
				an = v.name,
				av = v.apiVersions.pop();
			if(at=='media_locator') apis[at] = av.location;
			else if(at=='iptv' && iptv.indexOf(av.location)<0) iptv.push(av.location);
			//console.log(at, an, av.location);
		});
		//console.log(apis);

		var terr = data.territories[0];

		this.apis = apis;
		this._tmp_iptvsrc = iptv;
		this.data.whereami = data;
		this.timezone = terr.timezone;
		this.location = terr.territoryId;
		this.provider = '['+data.contractor.contractorId+']'+data.contractor.name;

		// user timezone check
		var ldt = new Date(), wtz = (terr.timezone/60),
			dtz = wtz + ldt.getTimezoneOffset();
		if(dtz!=0) {
			var fxd = new Date(ldt);
			fxd.setMinutes(fxd.getMinutes() + dtz);
			console.warn('incorrect timezone', ldt.getTimezoneOffset(), wtz,'\n\t'+ldt+'\n\t'+fxd);
		}
	},
	_onload_channels: function(url, data){
		
		var channels = Utils.parseM3UPlaylist(data);
		//console.log('_onload_channels', typeof(data)!='string' ? data : data.length, url, channels.length);
		//this._tmp_iptvcha = this._tmp_iptvcha.concat(channels);

		for(var cha, i=0;i<channels.length;i++) {
			cha = channels[i];
			this._tmp_iptvcha[cha.id] = cha;
		}

		var n = this._tmp_iptvsrc.indexOf(url);
		this._tmp_iptvsrc.splice(n,1);
		if(this._tmp_iptvsrc.length) return;
		
		// COMPLETE
		
		var channelsData = {}, cids = [];
		for(var cid in this._tmp_iptvcha) cids.push(cid);
		
		var apiurl = this.apis.tv_guide+'channels.json?t='+this.location;
		apiurl += '&fields=channelId,title,alias,logoURL,hasSchedule';
		apiurl += '&channel='+cids.join(',');
		$Ajax(apiurl, function(d){channelsData = d.channels},null,false);
		this._handler_channels(this._tmp_iptvcha, channelsData);
		delete this._tmp_iptvcha;
		delete this._tmp_iptvsrc;
	},
	_handler_channels: function(channelsList, channelsData) {
		//console.log('channelsList',channelsList);
		//console.log('channelsData',channelsData);
		for(var j in channelsData) {
			var chd = channelsData[j];
			chd.src = channelsList[chd.channelId].sauce;
			chd.id = chd.channelId;delete chd.channelId;
			chd.logo = chd.logoURL;delete chd.logoURL;
		}
		this._onready(channelsData);
	},
/*
	setAuthToken: function(token, expires) {
		if(typeof localStorage == 'undefined') return this.token = token;
		if(localStorage) localStorage.setItem('access_token', token);
		return this.getAuthToken();
	},
	getAuthToken: function() {
		if(typeof localStorage == 'undefined') return (this.token || null);
		var token = localStorage ? localStorage.getItem('access_token') : this.token;
		return token || null;
	},
*/
	setAuthToken: function(token, exp) {
		var expires = parseInt(exp, 10),
			expires = new Date().getTime() + expires*1000;
		// console.log(token, exp, expires);
		cookie.set('token', token, expires);
		return this.getAuthToken();
	},
	getAuthToken: function() {
		return cookie.get('token');
	}
}