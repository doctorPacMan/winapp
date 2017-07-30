var ChannelsPlaylist = function(data) {
	this.channels = {};
	this.cids = [];
};
ChannelsPlaylist.prototype = {
	//list: [],
	//indx: {},
	push: function(pid, data) {
		
		var list = [], indx = this.channels;
		if (typeof data!=='string') list = null;
		else if(data.indexOf('<?xml')==0) {try{list = this.parseXspf(data)}catch(e){}}
		else if(data.indexOf('#EXTM3U')==0) {try{list = this.parseM3U8(data)}catch(e){}}
		else {}
		
		if(list) for(var i=0;i<list.length;i++) {

			var cha = list[i];
			if(!indx[cha.cid]) {
				indx[cha.cid] = cha;
				indx[cha.cid].pid = pid;
				this.cids.push(cha.cid);
				delete cha.cid;
				continue;
			}

			var cur = indx[cha.cid], src = cur.src;
			if(src.indexOf('peers.tv')<0) continue;
			
			indx[cha.cid].pid = pid;
			indx[cha.cid].src = cha.src;
			console.log('[merge]'+ cha.title+'\n\tfrom '+src+'\n\t  to '+cha.src);
		}

		//console.log(this.indx);
		//this.list = this.list.concat(list);
	},
	parseXspf: function(xmldata) {
		var xml = (new DOMParser).parseFromString(xmldata.trim(), "text/xml"),
			lines = xml ? xml.querySelectorAll('trackList > track') : [];
		//console.log(xml.querySelector('playlist > title'), lines.length);

		var cha, ele, val, ext, cids = {}, list = [];
		for(var j=0;j<lines.length;j++) {
			cha = {data:ele = lines[j]};

			val = ele.querySelector('location');
			val = !val ? undefined : val.innerHTML;
			cha.src = val;
			
			val = ele.querySelector('title');
			val = !val ? undefined : val.innerHTML;
			cha.title = val;
			
			ext = ele.querySelector('extension[application="http://www.inetra.ru"]');
			if(ext) for(var i=0;i<ext.childNodes.length;i++) {
				var chn = ext.childNodes[i];
				if(ext.childNodes[i].nodeType!=1) continue;
				if(ext.childNodes[i].tagName=='inetra:channel-inf') {
					val = ext.childNodes[i].querySelector('channel-id');
					cha.cid = !val ? undefined : val.innerHTML;
				}
			}

			//console.log(cha);

			if(!cha.cid || !cha.src || !cha.title) continue;
			else if(cha.src.indexOf('http')!=0) continue;

			delete cha.data;
			cids[cha.cid] = cha;
			list.push(cha);
		}

		console.log('parseXSPF result '+list.length+' of '+lines.length);
		return list;
	},
	parseM3U8: function(playlist) {

		var data = playlist.replace('#EXTM3U\n',''),
			data = data.trim(),
			lines = data.split(new RegExp('\n{2,3}'));

		var	re_cid = new RegExp('channel-id=([\\d]+)(?: |$)'),
			//re_grp = new RegExp('group-title="(.+)"'),
			re_tid = new RegExp('territory-id=([\\d]+)(?: |$)'),
			re_ttl = new RegExp('#EXTINF:(?:.+), (.+)(?:\n|$)'),
			re_src = new RegExp('(?:\n)((?:http|https)://(?:[\\w\\-./]+).m3u8(?:.*))');

		var cha, str, rez, list = [], cids = {};
		for(var j=0;j<lines.length;j++) {
			
			if(list.length>=12) break;
			
			cha = {data:str = lines[j].trim()};
			
			rez = re_cid.exec(str);
			cha.cid = rez ? rez[1].trim() : null;
			
			rez = re_src.exec(str);
			cha.src = rez ? rez[1].trim() : null;
			
			rez = re_ttl.exec(str);
			cha.title = rez ? rez[1].trim() : null;

			//rez = re_grp.exec(str);
			//cha.group = rez ? rez[1].trim() : null;

			//rez = re_tid.exec(str);
			//cha.territory = rez ? rez[1].trim() : null;

			if(!cha.cid || !cha.src || !cha.title) continue;

			delete cha.data;
			cids[cha.cid] = cha;
			list.push(cha);
		}
		console.log('parseM3U8 result '+list.length+' of '+lines.length);
		return list;
	},
	channelExtend: function(cid, data) {
		var pcd = this.channels[cid];
		pcd.title = data.title;
		pcd.alias = data.alias;
		pcd.logo = data.logoURL;
		pcd.id = data.channelId;
		pcd.hasSchedule = !!data.hasSchedule;
		if(cid==24646020) console.log(data);//HD
		if(cid==58456826) console.log(data);//cam
	}
};