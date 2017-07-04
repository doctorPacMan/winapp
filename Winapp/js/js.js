var myApp = {
	load: function() {

		console.log('myAppLoad');
		cnapi.whereami(this.onload.bind(this));

	},
	onload: function(json) {

		console.log(json);

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
		console.log(iptvs)

		$Ajax(iptvs[1],this.readPlaylist.bind(this));
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
	},
	readPlaylist: function(playlist) {
		console.log('readPlaylist');
		
		var re_nl = new RegExp('\n{2,3}'),
			//re_src = new RegExp('((?:\n)(?:http|https)://(?:[\w\/-.]+)\.m3u8$)');
			re_cid = new RegExp('channel-id=([\\d]+)(?: |$)'),
			re_grp = new RegExp('group-title="(.+)"'),
			re_tid = new RegExp('territory-id=([\\d]+)(?: |$)'),
			//re_ttl = new RegExp('(?:\n)#EXTINF:(?:.+), (.+)$'),
			re_ttl = new RegExp('#EXTINF:(?:.+), (.+)(?:\n|$)'),
			re_src = new RegExp('(?:\n)((?:http|https)://(?:[\\w.-/]+).m3u8(?:.+))');
		
		var lines = playlist.split(re_nl);
		//return console.log(lines.length);
		
		var ttx, rez, src, ttl, cha, list = [];
		for(var j=0;j<lines.length;j++) {
			if(j>5) break;
			else cha = {};
			ttx = '----- line '+j+'\n'+lines[j];
			cha.data = lines[j];
			
			rez = re_cid.exec(lines[j]);
			cha.id = rez ? rez[1].trim() : null;
			
			rez = re_src.exec(lines[j]);
			cha.sauce = rez ? rez[1].trim() : null;
			
			rez = re_ttl.exec(lines[j]);
			cha.title = rez ? rez[1].trim() : null;

			list.push(cha);
			console.log(cha);
			//console.log(re_ttl, rez, lines[j]);
		}
		return list;
	}
};