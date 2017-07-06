var cnapi = {
	//token: '00954bafe0c6182bb730d240f5147dd8',
	apiurl: 'http://api.peers.tv',
	token: null,
	location: null,
	provider: null,
	initialize: function() {

		this.data = {};
		this.apis = {};
		this._iptv_sources = [];

		var apiurl = this.apiurl+'/registry/2/whereami.json';
		$Ajax(apiurl,this._handler_whereami.bind(this),null,false);

		var token = this.getAuthToken();
		if(token) this.setAuthToken(token);
		else {
			var apiurl = this.apis.auth+'token',
				params = {'grant_type':'inetra:anonymous','client_id':'demoapp','client_secret':'demoapp'};
			$Ajax(apiurl, this._handler_acstoken.bind(this),params,false);
		};
		console.log(this.location, this.provider, this.token);
		document.getElementById('inf-provider').innerText = this.provider;
		document.getElementById('inf-acstoken').innerText = this.token;

		this._iptv_channels = {};
		var iptv = this._iptv_sources;
		if(iptv.length)
		for(var k=0;k<iptv.length;k++)
			$Ajax(iptv[k], this._handler_channels.bind(this));
		
		console.log('CC',this._iptv_channels);
		delete this._iptv_sources;
	},
	_handler_whereami: function(data) {
		console.log('whereami',data);

		var apis = {};
		var iptv = [];
		data.apis.forEach(function(v){
			var at = v.apiType,
				av = v.apiVersions.pop();
			if(at=='auth') apis[at] = av.location;
			if(at=='iptv') iptv.push(av.location);
		});

		console.log('apis',apis);
		console.log('iptv',iptv);

		this.apis = apis;
		this._iptv_sources = iptv;
		this.data.whereami = data;
		this.location = data.territories[0].territoryId;
		this.provider = '['+data.contractor.contractorId+']'+data.contractor.name;
	},
	_handler_acstoken: function(data) {
		this.setAuthToken(data.access_token, data.expires_in);
	},
	request_channels: function(onComplete) {
		console.log(this.iptv);
		//var url = this.apiurl+'/tvguide/2/channels.json?t=16&fields=channelId,title,logoURL,hasSchedule,alias,ageRestriction,type';
		//$Ajax(url,onComplete);
		//if(data.location) url_params.push('t='+data.location);
		//if(data.fields) url_params.push('fields=' + data.fields);
		//if(data.channel) url_params.push('channel='+data.channel);
		//url += url_params.join('&');

		//this.api.queryAPI(url, params.success, params.error, params.create, params.complete);
	},
	_handler_channels: function(data){
		console.log('_handler_channels', typeof(data)!='string' ? data : data.length);
		var channels = Utils.readPlaylist(data);
		console.log(channels.length);
		
		for(var cha, xst, i=0;i<channels.length;i++) {
			cha = channels[i];
			xst = this._iptv_channels[cha.id];
			if(xst) {//duplicate
				//console.log('duplicate');
				continue;
				console.log('duplicate', xst.title, cha.title);
				console.log(xst.sauce+'\n'+cha.sauce);
			}
			else this._iptv_channels[cha.id] = cha;
		}
	},
	setAuthToken: function(token, expires) {
		console.log('setAuthToken', token);
		localStorage.setItem('access_token', this.token = token);
		return this.getAuthToken();
	},
	getAuthToken: function() {
		var token = this.token || localStorage.getItem('access_token');
		return token;
	}
}