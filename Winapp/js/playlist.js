"use strict";
var ChannelsPlaylist = function(data) {
	this.channels = {};
	this.cids = [];
	this.list = {};
	this.cnt = 0;
};
ChannelsPlaylist.prototype = {
	push: function(pid, data) {
		
		var list = [], indx = this.channels;
		if (typeof data!=='string') list = null;
		else if(data.indexOf('<?xml')==0) {try{list = this.parseXspf(data)}catch(e){}}
		else if(data.indexOf('#EXTM3U')==0) {try{list = this.parseM3U8(data)}catch(e){}}
		else {}
		
		this.list[pid] = [];
		
		if(list) for(var i=0;i<list.length;i++) {

			//if(i>=16) break;
			
			var cha = list[i],
				cid = (cha.cid || undefined),
				chn = Object.assign({cid:cid,pid:pid},cha);

			this.list[pid].push(chn);
			this.cnt++;

			if(!cid) continue;
			if(!indx[cid]) {
				indx[cid] = chn;
				this.cids.push(cid);
				continue;
			}
			else {
				var cur = indx[chn.cid];
				//console.log('[merge]', cur, chn);
				if(chn.pid!=2) cur.src = chn.src; // bypass inetra data
			}
		}
		//console.log(pid, this.list[pid].length, this.cnt);
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
	}
};