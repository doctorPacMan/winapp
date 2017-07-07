var cnapi = {
	//token: '00954bafe0c6182bb730d240f5147dd8',
	apiurl: 'http://api.peers.tv',
	token: null,
	location: null,
	provider: null,
	initialize: function(callback) {

		this.data = {};
		this.apis = {};
		this._onready = callback;
		this._iptv_sources = [];

		var apiurl = this.apiurl+'/registry/2/whereami.json';
		this.location = 16; this.provider = '[2]Novotelecom';
		$Ajax(apiurl,this._handler_whereami.bind(this),null,false);

		var token = this.getAuthToken();
		if(token) this.setAuthToken(token);
		else {
			var apiurl = this.apis.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl, this._handler_acstoken.bind(this),params,false);
		};
		//console.log(this.location, this.provider, this.token);
		this._iptv_sources = ["http://tv.novotelecom.ru/playlist", "http://api.peers.tv/iptv/2/playlist.m3u"];
		this._iptv_channels = {};
		var iptv = this._iptv_sources;
		if(!iptv.length) this._handler_channels([]);
		else for(var k=0;k<iptv.length;k++) $Ajax(iptv[k],this._onload_channels.bind(this,iptv[k]));
	},
	_handler_whereami: function(data) {
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

		console.log('apis',apis);
		console.log('iptv',iptv);

		this.apis = apis;
		this._iptv_sources = iptv;
		this.data.whereami = data;
		this.location = data.territories[0].territoryId;
		this.provider = '['+data.contractor.contractorId+']'+data.contractor.name;
	},
	_onload_channels: function(url, data){
		
		var channels = Utils.parseM3UPlaylist(data);
		console.log('_onload_channels', typeof(data)!='string' ? data : data.length, url, channels.length);
		//this._iptv_channels = this._iptv_channels.concat(channels);

		for(var cha, xst, i=0;i<channels.length;i++) {
			cha = channels[i];
			this._iptv_channels[cha.id] = cha;
		}

		var n = this._iptv_sources.indexOf(url);
		this._iptv_sources.splice(n,1);
		if(this._iptv_sources.length) return;
		
		// COMPLETE
		var channelsData = {}, cids = [];
		//this._iptv_channels.forEach(function(v){if(cids.indexOf(v.id)<0) cids.push(v.id)});
		for(var cid in this._iptv_channels) cids.push(cid);
		
		var apiurl = this.apis.tv_guide+'channels.json?t='+this.location;
		apiurl += '&fields=channelId,title,alias,logoURL,hasSchedule';
		apiurl += '&channel='+cids.join(',');
		$Ajax(apiurl, function(d){channelsData = d.channels},null,false);
		this._handler_channels(this._iptv_channels, channelsData);
		delete this._iptv_channels;
		delete this._iptv_sources;
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
	_handler_acstoken: function(data) {
		this.setAuthToken(data.access_token, data.expires_in);
	},
	setAuthToken: function(token, expires) {
		console.log('setAuthToken', token);
		//localStorage.setItem('access_token', this.token = token);
		return this.getAuthToken();
	},
	getAuthToken: function() {
		//var token = this.token || localStorage.getItem('access_token');
		//return token;
		return null;
	}
}