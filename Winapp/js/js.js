"use strict";
var $App = {
	initialize: function() {
		this.modSettings = new modSettings('mod-settings');
		//this.settings = this.modSettings.get.bind(this.modSettings);

		//return this.test_modTvplayer();
		
		console.info('$App initialize');
		this._telecast = {};
		this._channels = {};

		cnapi.initialize(this.onready.bind(this),new modLoading('mod-loading'));
		this.sbbuttons();
	},
	test_modTvplayer: function() {
		
		//return;

		this.sbbuttons();
		var tp = this.modTvplayer = new modTvplayer('mod-tvplayer');
		tp._video.setAttribute('controls','');
		//tp._wrppr.classList.add('testmode');
		tp.poster(false);

		//return tp.state('fail');
		//tp.load('http://hls.peers.tv/streaming/1kanal_hd/16/copy/playlist.m3u8?token=fd7dd8de64e65b43f2107d011c851a71');
		//tp.load('http://hls.novotelecom.ru/streaming/russian_roman/16/tvrec/playlist.m3u8');
		//tp.load('http://hls.peers.tv/streaming/cam_krylova-krasny/16/variable.m3u8');
		//tp.load('http://archive2.peers.tv/archive/101354016/101354016.m3u8');
		tp.load('http://www.cn.ru/data/files/test/countdown.mp4');
		//tp.squeeze(.75);
		return;
	},
	settings: function(name, value) {
		if(undefined===value) {
			value = this.modSettings.get(name);
			//console.log('settings get', name, value);
			return value;
		} else {
			//console.log('settings set', name, value);
			return this.modSettings.set(name, value);
		}
	},
	toggleSection: function(section,bttn) {
		var section = document.getElementById(section),
			st = !section.classList.contains('hidden');
		//console.log(section, st, bttn);
		section.classList[st?'add':'remove']('hidden');
		if(bttn) bttn.classList[!st?'add':'remove']('active');
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

		console.log('READY', playlist);
		
		this.informers();
		this.sbbuttons();
		//return cnapi.request.current(10338200);
		//return cnapi.request.idbytitle(['ЛДПР','Jasmin']);
		//return cnapi.request.schedule(10338262);
		//return cnapi.request.sauce(101613384);
		
		this.modChannels = new modChannels('mod-channels');
		this.modTvplayer = new modTvplayer('mod-tvplayer');
		this.modTitlebar = new modTitlebar('mod-titlebar');
		this.modSchedule = new modSchedule('mod-schedule');

		this._playlist = playlist;
		this.modChannels.update(playlist.channels);

		//cid = 10338227;
		var cid = this.settings('currentChannel') || playlist.cids[0];
		this.modSettings.fire('channelView',{channelId:cid});

		return;		
	},
	sbbuttons: function() {
		var bttn = document.getElementById('stopit');
		bttn.onclick = this.stopit.bind(this,bttn);
		
		bttn = document.getElementById('chlist');
		bttn.onclick = this.toggleSection.bind(this,'mod-channels',bttn);

		bttn = document.getElementById('apinfo');
		bttn.onclick = this.apinfo.bind(this,bttn);
		
		bttn = document.getElementById('reload');
		bttn.onclick = this.reload.bind(this,bttn);
		
		bttn = document.getElementById('config');
		bttn.onclick = this.toggleSection.bind(this,'mod-settings',bttn);
		//bttn.onclick();

		bttn = document.getElementById('schdle');
		bttn.onclick = this.toggleSection.bind(this,'mod-schedule',bttn);
		//bttn.onclick();
	},
	reload: function() {
		document.location.reload(true);
	},
	informers: function() {
		var provlogo = document.getElementById('inf-provlogo'),
			acstoken = document.getElementById('inf-acstoken'),
			location = document.getElementById('inf-location');

		acstoken.innerText = cnapi.getAuthToken();
		location.innerText = cnapi.location;
		if(cnapi.provider) {
			provlogo.style.backgroundImage = cnapi.provider.logo ? 'url("'+cnapi.provider.logo+'")' : null;
			provlogo.innerText = cnapi.provider.name ? cnapi.provider.name[0] : '?';
			provlogo.title = cnapi.provider.name || 'Unknown';
		}
		else provlogo.innerText = '?';
	},
	getChannelById: function(id) {
		return this._playlist.channels[id];
	},
	getTelecastById: function(id) {
		return this._telecast[id];
	},
	registerTelecast: function(json) {
		if (!this._telecast[json.id]) this._telecast[json.id] = new TvShow(json);
		return this._telecast[json.id];
	},
	pushChannel: function(json) {
		if (this._channels[json.id]) return;
		else this._channels[json.id] = new TvChannel(json);
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