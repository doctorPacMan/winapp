﻿"use strict";
var modTvplayer = extendModule({
	STATE_IDLE: 'idle',
	STATE_LOAD: 'load',
	STATE_FAIL: 'fail',
	STATE_VIEW: 'view',
	PLAYSTATE_PLAYING: 'playing',
	PLAYSTATE_ONPAUSE: 'onpause',
	PLAYSTATE_STANDBY: 'standby',
	_hover_observe: function() {
		
		var hover_delay = 3500,
			hover_timer = false,
			hover_state = false,
			hover_handler = (function(st) {
				this._wrppr.classList[st ? 'add' : 'remove']('hover');
			}).bind(this),
			onmousestop = function(e) {
				if(hover_timer) clearTimeout(hover_timer);
				hover_handler(hover_state = false);
			},
			onmousemove = function(e) {
				if(hover_state!=true) hover_handler(hover_state = true);
				if(hover_timer) clearTimeout(hover_timer);
				hover_timer = setTimeout(onmousestop,hover_delay);
			};
		this.node.addEventListener('mousemove',onmousemove);
		this.node.addEventListener('mouseleave',onmousestop);
		hover_handler(true);
	},
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		//this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		this._wrppr = this.node.querySelector('div');
		this._posta = this.node.querySelector('p');
		this._ntype = this.node.querySelector('i');
		this._video = this.node.querySelector('video');
		this._sauce = this.node.querySelector('video > source[type="application/x-mpegURL"]');
		this._hlsPlayType = this.hlsPlayType(this._video);
		
		this.state(this.STATE_IDLE);
		this._button = this.node.querySelector('button#playbttn');
		this._button.onclick = this.click.bind(this);

		//this.fitinWidth();
		this.fitinHeight(4/3);
		this.initVideo(this._video);
		this.initControls(this.node.querySelector('div.tvcntrls'));
		
		console.log('modTvplayer initialize');
		this._hlsjs = this.attachHlsjs(this._video);
		this._ntype.innerText = this._hlsjs ? 'hlsjs' : (this._hlsPlayType || 'video');
		
		this.mute(true);
		this.poster('/img/poster.jpg');

		//this.onTelecastView({detail:{id:100435894}});
		//this._video.setAttribute('autoplay','');
		var view_movie = this.play.bind(this,'http://www.cn.ru/data/files/test/countdown.mp4');
		var view_stream = this.play.bind(this,'http://hls.peers.tv/streaming/cam_lunintsev_sq/16/variable.m3u8');
		var view_record = this.play.bind(this,'http://hls.peers.tv/playlist/program/101354016.m3u8');
		//setTimeout(view_movie,0);
		//setTimeout(view_record,4000);
		//setTimeout(view_stream,8000);
		//this._wrppr.classList.add('load');
	},
	poster: function(src) {
		this._posta.style.display = src===false?'none':'block';
		if(src) this._posta.style.backgroundImage = 'url("'+src+'")';
	},
	size: function(st) {

		var vw = this._video.videoWidth || 0,
			vh = this._video.videoHeight || 0,
			pp = (vw>0 && vh>0) ? (vw/vh) : (4/3);
		
		console.log(vw+'x'+vh, pp);
		if('height'==this._fitin) this.fitinWidth(pp);
		else this.fitinHeight(pp);
	},
	mute: function(st) {
		var muted = this._video.getAttribute('muted'),
			muted = (!!muted || muted==''),
			mute = !muted;
		
		if(typeof(st)=='boolean') mute = st;
		
		if(mute)this._video.setAttribute('muted','');
		else this._video.removeAttribute('muted','');
		
		return this._video.muted = mute;
		//console.log(this._video.muted, mute);
	},
	initControls: function(cwrp) {
		var batons = cwrp.getElementsByTagName('button');
		this._button_play = batons[0];
		this._button_mute = batons[1];
		this._button_size = batons[2];
		this._button_play.addEventListener('click',this.pause.bind(this,null));
		this._button_mute.addEventListener('click',this.mute.bind(this,null));
		this._button_size.addEventListener('click',this.size.bind(this,null));
		console.log(cwrp);
	},
	pausechange: function(paused, event) {
		this._wrppr.classList[paused?'add':'remove']('ps-onpause');
		this._wrppr.classList[paused?'remove':'add']('ps-playing');
		//this._wrppr.classList[paused?'remove':'add']('ps-played');
		//console.log('PAUSED',paused+' ('+event.type+')');
	},
	statechange: function(newstate, oldstate, event) {
		console.log('STATE',oldstate+' > '+newstate+' ('+event.type+')');
		this._wrppr.classList.remove('st-'+oldstate);
		this._wrppr.classList.add('st-'+newstate);
		//this._wrppr.className = 'st-'+newstate;
	},
	initVideo: function(video) {
		video.removeAttribute('controls');
		video.setAttribute('muted','yes');

		//video.addEventListener('canplay',this._event_metadata.bind(this));
		//video.addEventListener('playing',this._event_playstart.bind(this,false));
		//video.addEventListener('ended',this._event_complete.bind(this));

		video.addEventListener('playing',this._event_playstart.bind(this,false));
		video.addEventListener('loadstart',this._event_playstart.bind(this,true));
		//video.addEventListener('error',this.error.bind(this));

		var event_ended = function(e){console.log('ENDS',e)};
		video.addEventListener('ended',event_ended.bind(this));

this._hover_observe();

		// observe loading state
		var loading_callback = this.statechange.bind(this),
			loading_state = this.STATE_IDLE,
			event_loading = function(state, e) {return function(e){
				if(loading_state === state) return;
				var oldstate = loading_state,
					newstate = loading_state = state;
				loading_callback(newstate, oldstate, e);
			}};
		video.addEventListener('loadstart',event_loading(this.STATE_LOAD));
		video.addEventListener('canplay',event_loading(this.STATE_VIEW));
		video.addEventListener('error',event_loading(this.STATE_FAIL));

		// observe buffering state
		var waiting_state = false,
			event_waiting = function(st,e){
				if(!this._sauce.src) st=false;
				if(waiting_state===st) return;
				console.log('BUFF',st,(e?e.type:''));
				this._wrppr.classList[st?'add':'remove']('ls-waiting');
				waiting_state = st;
			};
		video.addEventListener('waiting',event_waiting.bind(this,true));
		var buffering_done = event_waiting.bind(this,false),
			bufdone_events = ['canplay','playing','suspend','emptied','seeked','error'];
		bufdone_events.forEach(function(en){video.addEventListener(en,buffering_done)});

		// observe paused state
		var paused_state = false,
			event_paused = function(st,e) {
				var paused = this._video.paused,
					stoped = (this._video.readyState<2);
				console.log('PAUSED','stoped:'+stoped,'paused:'+paused,'st:'+st);
				this.pausechange(paused, e);
			};
		video.addEventListener('play',event_paused.bind(this,false),false);
		video.addEventListener('pause',event_paused.bind(this,true),false);

	},
	_event_playstart: function(reset, e) {
		if(reset===true) return this._playstart = false;
		else if(this._playstart) return null;
		else this._playstart = true;
		
		var vw = this._video.videoWidth || 600,
			vh = this._video.videoHeight || 450;
		console.log('playstart', e.type, vw+'x'+vh,this._sauce.src);
		this._video.setAttribute('width',vw);
		this._video.setAttribute('height',vh);
		//this.fitinWidth(vw/vh);
		this.fitinWidth(vw/vh);
		this.poster(false);
	},
	attachHlsjs: function(video) {

		if(this._hlsPlayType) return null;
		else if(!window.Hls || !Hls.isSupported()) return null;

		var hlsjs = new Hls({});
		hlsjs.on(Hls.Events.MEDIA_ATTACHED,function(event,data){
			var src = this._sauce.getAttribute('src');
				video = data.media;
			//console.log('attach', src);
		}.bind(this));
		hlsjs.on(Hls.Events.MEDIA_DETACHED,function(event,data){
			//console.log('detach');this._video.load();
		}.bind(this));

		//hlsjs.on(Hls.Events.ERROR, this.error.bind(this));
		hlsjs.on(Hls.Events.ERROR,(function(){
			video.dispatchEvent(new CustomEvent('hlserror',{'detail':0}));
		}).bind(this));

		video.className = 'hlsjs';
		return hlsjs;
	},
	onChannelView: function(event) {
		var id = event.detail.channelId,
			cha = $App.getChannelById(id),
			scale = false;
		

		console.log('onChannelView', scale, cha);

		this.play(cha.stream);
		
		scale = ([22301705,22615442,10338208,10338227,26424387].indexOf(cha.cid)>=0);
		if(scale) this.scale();
	},
	scale: function() {
		//this._video.style.transform = 'scale(1.25, 1)';
		this._video.style.transform = 'scale(1, 0.75)';
	},
	onTelecastView: function(event) {
		var id = event.detail.id,
			tvs = $App.getTelecastById(id);
		
		console.log('onTelecastView', id, tvs.files);
		//console.log('onTelecastView', tvs);
		if(tvs.files) this.loadTelecast(id);
		else cnapi.request.sauce(id,this.loadTelecast.bind(this,id));
	},
	loadTelecast: function(id) {
		var tvs = $App.getTelecastById(id),
			cha = $App.getChannelById(tvs.channel),
			live = (typeof(tvs.getProgress())!='boolean');
		
		console.log('loadTelecast',live,tvs.files);
		
		if(live) {
			this._video.setAttribute('poster', tvs.poster);
			this._video.setAttribute('controls','');
			this.play(cha.stream);
		}
		else if(tvs.files) {
			this._video.setAttribute('poster', tvs.poster);
			this._video.setAttribute('controls','');
			this.play(tvs.files[0].uri);
		} else {
			this.stop();
			this.poster(tvs.poster);
			//this._video.removeAttribute('controls');
		}
		//else console.log(tvs);
	},
	hlsPlayType: function(video) {
		var cp = false,
			tp = ['application/vnd.apple.mpegurl','application/vnd.apple.mpegURL','application/x-mpegURL'];

		while(tp.length) {
			var type = tp.shift();
			if(video.canPlayType(type)=='') continue;
			//else console.log('hlsPlayType', type, video.canPlayType(type));
			cp = type;
			break;
		};
		return cp;
	},
	click: function() {
		//console.log(this._video.readyState);
		this.pause();
	},
	pause: function(st) {
		var paused = this._video.paused,
			stoped = (this._video.readyState<2);
		var st = (typeof st == 'boolean') ? st : !paused;
		//console.log('PAUSE','paused:'+paused, 'stoped:'+stoped, 'st:'+st);
		this._video[st ? 'pause' : 'play']();		
	},
	stop: function() {

		if(this._hlsjs) {
			this._hlsjs.stopLoad();
			this._hlsjs.detachMedia(this._video);
		}

		//this._video.pause();
		//this._video.currentTime = 0;
		this._video.removeAttribute('style');
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._video.removeAttribute('autoplay');
		this._sauce.removeAttribute('type');
		this._sauce.removeAttribute('src');
		this._video.load();
		//this.poster(false);
		//var so = Array.prototype.slice.call(this._video.querySelectorAll('source'));
		//while(so.length) this._video.removeChild(so.pop());

	},
	play: function(src) {

		this.load(src, true);

	},
	load: function(src, autoplay) {

		this.stop();
		if(autoplay===true) this._video.setAttribute('autoplay','');
		else this._video.removeAttribute('autoplay');

		var hls = /\.(m3u8|m3u)($|\?|#)/.test(src),
			hpt = this._hlsPlayType;

		this._sauce.setAttribute('src',src);
		if(hls && hpt) this._sauce.setAttribute('type', hpt);
		else this._sauce.removeAttribute('type');

		console.log('LOAD', src);
		if(!hls || !this._hlsjs) this._video.load();
		else setTimeout(function(){
			this._hlsjs.loadSource(src);
			this._hlsjs.attachMedia(this._video);
		}.bind(this),250);
	},
	error: function(error) {
		this.stop();
		this.state(this.STATE_FAIL);
		console.log(error);
	},
	state: function(state) {
		if(!this._state) this._state = this.STATE_IDLE;
		this._wrppr.classList.remove('st-'+this._state);
		this._wrppr.classList.add('st-'+state);
		this._state = state;
	},
	fitinWidth: function(pp) {
		var prop = pp || (4/3),
			cont = this._wrppr,
			cw = cont.offsetWidth,
			ch = cont.offsetHeight,
			vw = cw, vh = Math.ceil(vw/prop);

		//console.log('video', vw+'x'+vh, this._video.videoWidth+'x'+this._video.videoHeight);
		this._video.style.width = vw+'px';
		this._video.style.height = vh+'px';
		this._video.style.marginTop = (ch - vh)/2 + 'px';
		this._video.style.marginLeft = '0px';
		this._fitin = 'width';
	},
	fitinHeight: function(pp) {
		var prop = pp || (4/3),
			cont = this._wrppr,
			cw = cont.offsetWidth,
			ch = cont.offsetHeight,
			vh = ch, vw = Math.ceil(vh*prop);

		//console.log('video', vw+'x'+vh, this._video.videoWidth+'x'+this._video.videoHeight);
		this._video.style.width = vw+'px';
		this._video.style.height = vh+'px';
		this._video.style.marginTop = '0px';
		this._video.style.marginLeft = (cw - vw)/2 + 'px';
		this._fitin = 'height';
	}
});