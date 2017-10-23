"use strict";
window.DEBUG = false;
//window.CHANNELS_LIMIT = 24;
var $App = {
	initialize: function() {
		this.sbbuttons();
		this.modSettings = new modSettings('mod-settings');
		this.modTvplayer = new modTvplayer('mod-tvplayer');
		this.modSchedule = new modSchedule('mod-schedule');
		this._telecast = {};
		this._channels = {};
		
		//return this.TEST();
		//return cnapi.initialize(this.TEST.bind(this),new modLoading('mod-loading'),true);
		console.info('$App initialize');
		cnapi.initialize(this.onready.bind(this),new modLoading('mod-loading'));
	},
	TEST: function() {
		var tp = this.modTvplayer;
		//tp._video.setAttribute('controls','');
		tp.poster(false);
		tp.hover(true,false);
		tp.load('http://hls.peers.tv/variant_playlist/program/106339044.m3u8?t=16&rnd=136');
		return;

		if(0) cnapi.request.schedule(10338232,null,function(data){
			console.log(data);
			this.modSchedule.setSchedule(data, new Date);
		}.bind(this));
		//return

		//$Ajax('/data/channels.json',function(json,xhr) {json.channels.forEach(this.pushChannel.bind(this))}.bind(this),true);
		$Ajax('/data/telecast.json',function(json,xhr) {//console.log(json);
			json.duration = 10.45;
			json.date.day = (new Date).getDate();
			json.date.hour = (new Date).getHours();
			json.date.minute = (new Date).getMinutes();
			json.date.second = (new Date).getSeconds() - 10;
			var tvs = this.registerTelecast(json);
			tvs.source = 'http://www.cn.ru/data/files/test/countdown.mp4';
			this.modTvplayer.loadTelecast(json.id);
		}.bind(this));

		//return tp.state('fail');
		//tp.load('http://hls.peers.tv/streaming/1kanal_hd/16/copy/playlist.m3u8?token=fd7dd8de64e65b43f2107d011c851a71');
		//tp.load('http://hls.novotelecom.ru/streaming/russian_roman/16/tvrec/playlist.m3u8');
		//tp.load('http://hls.peers.tv/streaming/cam_krylova-krasny/16/variable.m3u8');
		//tp.load('http://archive2.peers.tv/archive/101354016/101354016.m3u8');
		//tp.load('http://www.cn.ru/data/files/test/countdown.mp4');
		//tp.load('/data/error.mp4');
		//tp.squeeze(.75);
		return;
	},
	settings: function(name, value) {
		if(undefined===value) {
			value = this.modSettings.get(name);
			//console.log('settings get',name,value);
			return value;
		} else {
			//console.log('settings set',name,value);
			return this.modSettings.set(name, value);
		}
	},
	toggleSection: function(secid) {

		var sec = this._sections[secid], st = false;
		if(sec) {
			st = sec.node.classList.contains('hidden');
			sec.node.classList[!st?'add':'remove']('hidden');
			sec.bttn.classList[st?'add':'remove']('active');
		}
		
		if(this._curr_sec && this._curr_sec!=secid) {
			sec = this._sections[this._curr_sec]
			sec.node.classList.add('hidden');
			sec.bttn.classList.remove('active');
		}

		this._curr_sec = st ? secid : false;
		//console.log('toggleSection',secid,st,csc);
	},
	apinfo: function(brun) {
		//alert('INFO');
		console.log(cnapi);
	},
	stopit: function(brun) {
		//this.initialize();
		//brun.onclick = function(){};
		this.modTvplayer.stop();
	},
	onready: function(playlist) {
		//console.log('READY', playlist);
		
		this.sbbuttons();
		//return cnapi.request.nowonair(10338200);
		//return cnapi.request.current(10338200);
		//return cnapi.request.idbytitle(['ЛДПР','Jasmin']);
		//return cnapi.request.schedule(10338262);
		//return cnapi.request.sauce(101613384);
		
		this.modChannels = new modChannels('mod-channels');
		this.modNowonair = new modNowonair('mod-nowonair');

		this._playlist = playlist;
		this.modChannels.update(playlist.channels);
		this.modNowonair.update(playlist.channels);
		this.modSettings.updateAbout();

		var cid = this.settings('currentChannel');//cid = 10338227;
		if(!playlist.channels[cid]) cid = playlist.cids[0];
		this.modSettings.fire('channelView',{cid:cid});

		return;		
	},
	sbbuttons: function() {
		this._sections = {};
		this._curr_sec = null;

		var bttn = document.getElementById('stopit');
		bttn.onclick = this.stopit.bind(this,bttn);
		
		bttn = document.getElementById('apinfo');
		bttn.onclick = this.apinfo.bind(this,bttn);
		
		bttn = document.getElementById('reload');
		bttn.onclick = this.reload.bind(this,bttn);
		
		bttn = document.getElementById('chlist');
		bttn.onclick = this.toggleSection.bind(this,'channels');
		this._sections['channels'] = {bttn:bttn,node:document.getElementById('mod-channels')}

		bttn = document.getElementById('nowair');
		bttn.onclick = this.toggleSection.bind(this,'nowonair');
		this._sections['nowonair'] = {bttn:bttn,node:document.getElementById('mod-nowonair')}

		bttn = document.getElementById('config');
		bttn.onclick = this.toggleSection.bind(this,'settings');
		this._sections['settings'] = {bttn:bttn,node:document.getElementById('mod-settings')}

		bttn = document.getElementById('schdle');
		bttn.onclick = this.toggleSection.bind(this,'schedule');
		this._sections['schedule'] = {bttn:bttn,node:document.getElementById('mod-schedule')}
	},
	reload: function() {
		document.location.reload(true);
	},
	informers: function() {
	},
	pushChannel: function(json) {
		if (this._channels[json.id]) return;
		else this._channels[json.id] = new TvChannel(json);
	},
	getChannelById: function(id) {
		if(!this._playlist) return null;
		return this._playlist.channels[id];
	},
	registerTelecast: function(json) {
		if(this._telecast[json.id]) return this._telecast[json.id];
		else var tvs = this._telecast[json.id] = new TvShow(json);

		if(tvs.onair) {
			var cha = this.getChannelById(tvs.channel);
			if(cha) cha.currentTelecast = tvs.id;
		}
		
		return tvs;
	},
	getTelecastById: function(id) {
		var tvs = this._telecast[id];
		return tvs ? tvs.update() : undefined;
	},
	clickChannel: function(tile, event) {
		event.preventDefault();
		var href = tile.getAttribute('href'),
			cid = tile.getAttribute('data-cid'),
			src = href;
		
		if (!href) console.log('NOHREF');
		else if(href.indexOf('?sid=')>0) src = href.split('?sid=')[0];
		
		src = 'http://www.cn.ru/data/files/test/adv/banner0.mp4';
		//this._sauce.setAttribute('src',src);
		//this._video.setAttribute('src',src);
		//this._video.play();
		this.currentChannel = cid;
		//this.modTvplayer.play(src);
	}
};