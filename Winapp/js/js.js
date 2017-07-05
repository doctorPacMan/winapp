var myApp = {
	load: function() {

		console.log('myAppLoad');
		cnapi.whereami(this.onload.bind(this));

	},
	onload: function(json) {

		console.log(localStorage, sessionStorage);
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
	},
	readPlaylist: function(playlist) {

		if(!playlist) return console.log('readPlaylist failure',playlist);
		
		var data = playlist.replace('#EXTM3U\n',''),
			lines = data.split(new RegExp('\n{2,3}'));

		console.log('readPlaylist',lines.length);

		var re_nl = new RegExp('\n{2,3}'),
			re_cid = new RegExp('channel-id=([\\d]+)(?: |$)'),
			re_grp = new RegExp('group-title="(.+)"'),
			re_tid = new RegExp('territory-id=([\\d]+)(?: |$)'),
			re_ttl = new RegExp('#EXTINF:(?:.+), (.+)(?:\n|$)'),
			re_src = new RegExp('(?:\n)((?:http|https|udp)://(?:[\\w\\-./]+).m3u8(?:.*))');
		
		var ttx, cha, str, rez, src, ttl, list = [], cnt = 0;
		for(var j=0;j<lines.length;j++) {
			//if(j>5) break;
			//else 
			cha = {};
			str = lines[j].trim();
			ttx = '----- line '+j+'\n'+str;
			cha.data = str;
			
			rez = re_cid.exec(str);
			cha.id = rez ? rez[1].trim() : null;
			
			rez = re_src.exec(str);
			cha.sauce = rez ? rez[1].trim() : null;
			
			rez = re_ttl.exec(str);
			cha.title = rez ? rez[1].trim() : null;

			if(!cha.sauce) continue;
			//if(!cha.sauce) console.log('!sauce\n'+str);
			
			if(this._channels[cha.id]) console.log('duplicate',this._channels[cha.id],cha);
			else {
				cnt++;
				this._channels[cha.id] = cha;
			}
			//console.log(re_ttl, rez, lines[j]);
		}
		console.log(cnt);
		console.log(this._channels);
		return list;
	}
};