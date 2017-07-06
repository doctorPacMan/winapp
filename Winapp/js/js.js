var myApp = {
	load: function() {

		//console.log('myAppLoad');
		//cnapi.initialize();
	},
	onload: function(json) {

		console.log(json);
		return cnapi.getToken();

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
	onloadChannels: function(data) {
		var re = new RegExp('^cam_'),
			list = data.channels;
		for(var j=0,cha; j<list.length; j++) {
			cha = list[j];
			if(cha.hasSchedule!=1) continue;
			else if(!re.test(cha.alias)) continue;
			else if(cha.ageRestriction===undefined) continue;
			console.log(cha.hasSchedule, cha.ageRestriction, cha.alias);
		}
	}
};