Utils = {};
Utils.parseM3UPlaylist = function(playlist) {

		if(typeof(playlist)!='string') {
			console.warn('parseM3UPlaylist fail', playlist);
			return [];
		}

		var data = playlist.replace('#EXTM3U\n',''),
			lines = data.split(new RegExp('\n{2,3}'));

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
		console.log('readPlaylist success '+list.length+' of '+lines.length);
		return list;
};
document.addEventListener('DOMContentLoaded',function(){
	var scb = document.querySelectorAll('.chalist');
	for(var i=0;i<scb.length;i++) {
		var nn = scb[i],
			fc = nn.firstElementChild,
			sw = nn.clientWidth-fc.clientWidth;
		fc.classList.add('scrollhide'+sw);
		//fc.style.width = 'calc(100% + '+sw+'px)';
		//fc.style.marginRight = '-'+sw+'px';
	}
});

if(typeof(window.localStorage)=='undefined'){
console.log('LLLLLLLLLLL')
window.localStorage = {
	getItem:function(){return null},
	setItem:function(){}
};	
}
