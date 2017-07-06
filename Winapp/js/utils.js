Utils = {};
Utils.readPlaylist = function(playlist) {

		if(playlist===null) return [];

		var data = playlist.replace('#EXTM3U\n',''),
			lines = data.split(new RegExp('\n{2,3}'));

		console.log('readPlaylist lines:',lines.length);

		var	re_cid = new RegExp('channel-id=([\\d]+)(?: |$)'),
			re_grp = new RegExp('group-title="(.+)"'),
			re_tid = new RegExp('territory-id=([\\d]+)(?: |$)'),
			re_ttl = new RegExp('#EXTINF:(?:.+), (.+)(?:\n|$)'),
			re_src = new RegExp('(?:\n)((?:http|https|udp)://(?:[\\w\\-./]+).m3u8(?:.*))');

		var ttx, cha, str, rez, src, ttl, list = [], channels = {};
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

			rez = re_tid.exec(str);
			cha.territory = rez ? rez[1].trim() : null;

			if(!cha.sauce) continue;
			//if(cha.territory!=16) continue;
			//if(channels[cha.id]) continue;
			
			channels[cha.id] = cha;
			list.push(cha);
			//console.log(re_ttl, rez, lines[j]);
		}
		console.log('readPlaylist items:',list.length);
		//console.log(channels);
		return list;
};