﻿"use strict";
var modTvplayer = extendModule({
	STATE_IDLE: 'idle',
	STATE_LOAD: 'load',
	STATE_FAIL: 'fail',
	STATE_VIEW: 'view',
	PLAYSTATE_PLAYING: 'playing',
	PLAYSTATE_ONPAUSE: 'onpause',
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		//this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		//this.listen('settingsChange',this.onSettingsChange.bind(this));
		this.listen('settings:stretch',this.onSetStretch.bind(this));
		this.listen('settings:autoplay',this.onSetAutoplay.bind(this));

		this._wrppr = this.node.querySelector('div');
		this._posta = this.node.querySelector('p');
		this._video = this.node.querySelector('video');
		this._sauce = this.node.querySelector('video > source[type="application/x-mpegURL"]');
		this._inf_u = this.node.querySelector('div.tvcntrls > u');

		this._hlsPlayType = this.hlsPlayType(this._video);
		
		this.state(this.STATE_IDLE);
		this._button = this.node.querySelector('button#playbttn');
		this._button.onclick = this.click.bind(this);

		//this.fitinWidth();
		//this.fitinHeight(4/3);
		this.initVideo(this._video);
		this.initControls(this.node.querySelector('div.tvcntrls'));
		this.resize(4/3);

		this._hlsjs = this.attachHlsjs(this._video);
		var ntype = this.node.querySelector('div.tvcntrls > i');
		ntype.innerText = this._hlsjs ? 'hlsjs' : (this._hlsPlayType || 'video');
		
		this.poster('/img/poster.jpg');
		this._state_observe(this._video);

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
	_state_observe: function(video) {
		var u = this.node.querySelector('div.tvcntrls > s')
		//this._wrppr.querySelector('u');
		//console.log(u);
		var ea = [
			//'readystatechange',
			//'durationchange',
			'emptied','loadstart','loadedmetadata',
			'loadeddata','canplay',//'canplaythrough',
			'playing','ended',
			'play','pause',
			//'progress','stalled',
			'suspend',
			'waiting',
			'error'];
		
		var	prestate = 'standby',
			oldstate = 'emptied',
			callback = function(event) {
				//console.log(event.type, event);
				u.innerText = prestate+' > '+oldstate+' > '+event.type;
				prestate = oldstate;
				oldstate = event.type;
				video.setAttribute('data-playstate',u.innerText);
			};

		while(ea.length) video.addEventListener(ea.shift(),callback,false);
	},
	initVideo: function(video) {
		video.removeAttribute('controls');

		video.addEventListener('playing',this._event_playstart.bind(this,false));
		video.addEventListener('loadstart',this._event_playstart.bind(this,true));
		//video.addEventListener('error',this.error.bind(this));

		var event_ended = function(e){console.log('ENDS',e)};
		video.addEventListener('ended',event_ended.bind(this));

		// poster autohide
		//video.addEventListener('canplay',this.poster.bind(this,false));
		this._resize_observe();
		this._hover_observe();

		// observe loading state
		var loading_callback = this.statechange.bind(this),
			loading_state = this.STATE_IDLE,
			loading_sauce = this._sauce,
			event_loading = function(state, e) {return function(e){
				var empty = loading_sauce.getAttribute('src')===null;
				if('loadstart'===event.type && empty) return e.preventDefault() && e.stopImmediatePropagation();
				if(loading_state === state) return;
				var oldstate = loading_state,
					newstate = loading_state = state;
				loading_callback(newstate, oldstate, e);
			}};
		video.addEventListener('loadstart',event_loading(this.STATE_LOAD));
		video.addEventListener('emptied',event_loading(this.STATE_IDLE));
		video.addEventListener('canplay',event_loading(this.STATE_VIEW));
		video.addEventListener('error',event_loading(this.STATE_FAIL));
		
		// observe buffering state
		var waiting_state = false,
			event_waiting = function(st,e){
				if(!this._sauce.src) st=false;
				if(waiting_state===st) return;
				//console.log('BUFF',st,(e?e.type:''));
				this._wrppr.classList[st?'add':'remove']('ls-waiting');
				waiting_state = st;
			};
		video.addEventListener('waiting',event_waiting.bind(this,true));
		var buffering_done = event_waiting.bind(this,false),
			bufdone_events = ['canplay','playing','suspend','emptied','seeked','error'];
		bufdone_events.forEach(function(en){video.addEventListener(en,buffering_done)});

		// observe paused state
		var paused_state = true,
			event_paused = function(st, e) {
				var paused = this._video.paused,
					stoped = (this._video.readyState<2);
				//console.log('PAUSED',this._video.readyState,'st:'+st,'paused:'+paused,'stoped:'+stoped);
				if(!stoped) this.pausechange(paused, e);
			};
		video.addEventListener('play',event_paused.bind(this,false),false);
		video.addEventListener('pause',event_paused.bind(this,true),false);
		video.addEventListener('emptied',event_paused.bind(this,true),false);
		video.addEventListener('loadstart',this.pausechange.bind(this,true),false);

		// observe muted state
		var muted_state = this.mute(!!$App.settings('muted')),
			event_muted = (function(video, e) {
				if(muted_state===video.muted) return;
				else this.mutedchange(muted_state = video.muted);
			}).bind(this,video);
		video.addEventListener('volumechange',event_muted,false);
		this.mutedchange();
	},
	_resize_observe: function() {
		var wsize_timer = false,
			onresizeend = this.resize.bind(this);
		window.addEventListener('resize',function(e) {
			if(wsize_timer) clearTimeout(wsize_timer);
			wsize_timer = setTimeout(onresizeend,250);
		});
	},
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
	poster: function(src) {
		this._posta.style.display = src===false?'none':'block';
		if(src) this._posta.style.backgroundImage = 'url("'+src+'")';
	},
	initControls: function(cwrp) {
		var batons = cwrp.getElementsByTagName('button');
		this._button_play = batons[0];
		this._button_mute = batons[1];
		this._button_play.addEventListener('click',this.pause.bind(this,null));
		this._button_mute.addEventListener('click',this.mute.bind(this,null));
		//console.log(cwrp);
	},
	mutedchange: function(muted) {
		var muted = this._video.muted;
		this._wrppr.classList[muted?'add':'remove']('volmuted');
	},
	pausechange: function(paused, event) {
		this._wrppr.classList[paused?'add':'remove']('ps-'+this.PLAYSTATE_ONPAUSE);
		this._wrppr.classList[paused?'remove':'add']('ps-'+this.PLAYSTATE_PLAYING);
	},
	statechange: function(newstate, oldstate, event) {
		//console.log('STATE',oldstate+' > '+newstate+' ('+event.type+')');
		this._wrppr.classList.remove('st-'+oldstate);
		this._wrppr.classList.add('st-'+newstate);
	},
	_event_playready: function(reset, e) {
		var vw = this._video.videoWidth || 600,
			vh = this._video.videoHeight || 450;
		console.log('playready', e.type, vw+'x'+vh, this._sauce.src);
	},
	_event_playstart: function(reset, e) {
		if(reset===true) return this._playstart = false;
		else if(this._playstart) return null;
		else this._playstart = true;
		
		var vw = this._video.videoWidth || 600,
			vh = this._video.videoHeight || 450;
		console.log('playstart', e.type, vw+'x'+vh, this._sauce.src);
		this._video.setAttribute('width',vw);
		this._video.setAttribute('height',vh);

		this.resize(vw/vh);
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

		video.classList.add('hlsjs');
		return hlsjs;
	},
	onSetStretch: function(event) {
		var data = event.detail;
		this.resize();
		console.log('stretch', data.newvalue);
	},
	onSetAutoplay: function(event) {
		var data = event.detail;
		this._autoplay = (data.newvalue === true);
		if(this._video.paused) this.pause(false);
		console.log('autoplay',this._autoplay);
	},
	onChannelView: function(event) {
		var id = event.detail.channelId,
			cha = $App.getChannelById(id);

		//console.log('onChannelView', cha);
		
		this.load(cha.stream);
		if(cha.squeeze) this.squeeze(.75);
	},
	squeeze: function(sy) {
		var style = window.getComputedStyle(this._video),
			trans = !style ? false : style.getPropertyValue('transform'),
			trans = !trans ? false : trans.replace('matrix(','').replace(')','').split(', '),
			scaleX = !trans ? 1 : parseFloat(trans[2]), scaleX = (scaleX>0 ? scaleX : 1),
			scaleY = !trans ? 1 : parseFloat(trans[3]), scaleY = (scaleY>0 ? scaleY : 1);

		if(!sy) return scaleY;

		var sx = 1, sy = parseFloat(sy);
		sy = isNaN(sy) ? 1 : sy;
		this._video.style.transform = 'scale('+sx+', '+sy+')';
		return sy;
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
		if(!stoped) this._video[st ? 'pause' : 'play']();		
	},
	stop: function() {

		this._video.pause();
		this._video.currentTime = 0;
		this._video.removeAttribute('style');
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._video.removeAttribute('autoplay');
		this._sauce.removeAttribute('type');
		this._sauce.removeAttribute('src');

		if(!this._hlsjs) this._video.load();
		else {
			this._hlsjs.stopLoad();
			this._hlsjs.detachMedia(this._video);
		}
		//this.poster(false);
		//var so = Array.prototype.slice.call(this._video.querySelectorAll('source'));
		//while(so.length) this._video.removeChild(so.pop());
	},
	play: function(src) {

		this.load(src, true);

	},
	load: function(src, autoplay) {

		this.stop();
		
		var avp = (true===autoplay || true===$App.settings('autoplay')),
			hls = /\.(m3u8|m3u)($|\?|#)/.test(src),
			hpt = this._hlsPlayType;

		if(avp) this._video.setAttribute('autoplay','');
		else this._video.removeAttribute('autoplay');

		this._sauce.setAttribute('src',src);
		if(hls && hpt) this._sauce.setAttribute('type', hpt);
		else this._sauce.removeAttribute('type');

		//console.log(avp?'PLAY':'LOAD', src);
		this._inf_u.innerText = src;
		
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
	mute: function(st) {
		var muted = this._video.muted,
			mute = typeof(st)=='boolean' ? st : !muted;
		
		if(mute) this._video.setAttribute('muted','');
		else this._video.removeAttribute('muted');
		
		$App.settings('muted',mute);
		return this._video.muted = mute;
	},
	getVideoSize: function() {
		var vw = parseInt(this._video.videoWidth),
			vh = parseInt(this._video.videoHeight),
			vp = parseFloat(vw/vh);
		return !isNaN(vp) ? vp : undefined;
	},
	resize: function() {
		var	cw = this._wrppr.offsetWidth,
			ch = this._wrppr.offsetHeight,
			vw = this._video.videoWidth,
			vh = this._video.videoHeight;
		if(isNaN(vw) || vw<=0) vw = 720;
		if(isNaN(vh) || vh<=0) vh = Math.round(3*vw/4);
		
		var cp = ch/cw,
			vp = vh/vw,
			stretch = (true===$App.settings('stretch'));
		
		console.log('stretch:'+stretch, 'video:'+vw+'x'+vh, 'cont:'+cw+'x'+ch);
		
		if(stretch) {
			if(cp>vp) this.fitinHeight(); else this.fitinWidth();
		} else {
			if(cp<vp) this.fitinHeight(); else this.fitinWidth();
		}
	},
	fitinWidth: function(pp) {

		var cont = this._wrppr,
			cw = cont.offsetWidth,
			ch = cont.offsetHeight,
			vw = this._video.videoWidth,
			vh = this._video.videoHeight,
			prop = pp || this.getVideoSize() || (4/3);
		
		var sw = cw,
			sh = Math.ceil(sw/prop),
			m_top = (ch - sh)/2,
			m_lft = 0;
		
		//console.log(pp, 'video:'+vw+'x'+vh, 'cont:'+cw+'x'+ch, sw+'x'+sh, m_top, m_lft);
		this._video.style.width = sw+'px';
		this._video.style.height = sh+'px';
		this._video.style.marginTop = m_top+'px';
		this._video.style.marginLeft = m_lft+'px';		
	},
	fitinHeight: function(pp) {
		var scaleY = this.squeeze();

		var cont = this._wrppr,
			cw = cont.offsetWidth,
			ch = cont.offsetHeight,
			vw = this._video.videoWidth,
			vh = this._video.videoHeight,
			sy = (scaleY || 1),
			prop = pp || (vw/(vh*scaleY)) || (4/3);
		
		var sh = Math.floor(ch * 1/scaleY),
			sw = Math.ceil(sh*prop),
			m_top = (ch - sh)/2,
			m_lft = (cw - sw)/2;

		//console.log(pp, 'video:'+vw+'x'+vh, 'cont:'+cw+'x'+ch, sw+'x'+sh, m_top, m_lft);
		this._video.style.width = sw+'px';
		this._video.style.height = sh+'px';
		this._video.style.marginTop = m_top+'px';
		this._video.style.marginLeft = m_lft+'px';		
	}
});