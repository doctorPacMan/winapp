var modTvplayer = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		this._wrppr = this.node.querySelector('div');
		this._posta = this.node.querySelector('p');
		this._ntype = this.node.querySelector('i');
		this._video = this.node.querySelector('video');
		this._sauce = this.node.querySelector('video > source[type="application/x-mpegURL"]');
		this._hlsPlayType = this.hlsPlayType(this._video);
		
		this._button = this.node.querySelector('button');
		this._button.onclick = this.click.bind(this);

		this.initVideo(this._video);


		this._hlsjs = this.attachHlsjs(this._video);
		
		//console.log('modTvplayer initialize');
		this._ntype.innerText = this._hlsjs ? 'hlsjs' : (this._hlsPlayType || 'video');
		
		//this.onTelecastView({detail:{id:100435894}});
		//this._video.setAttribute('autoplay','');
		var load_mov = this.load.bind(this,'http://www.cn.ru/data/files/test/countdown.mp4');
		var load_stream = this.load.bind(this,'http://hls.peers.tv/streaming/cam_lunintsev_sq/16/variable.m3u8');
		var load_record = this.load.bind(this,'http://hls.peers.tv/variant_playlist/program/101704626.m3u8?rnd=881&t=16');
		//setTimeout(load_mov,0);
		//setTimeout(load_stream,3000);
		//setTimeout(load_record,1000);
	},
	poster: function(src) {
		this._posta.style.display = src===false?'none':'block';
		if(src) this._posta.style.backgroundImage = 'url("'+src+'")';
	},
	click: function() {
		console.log(this._video.readyState);
	},
	initVideo: function(video) {

		//video.addEventListener('canplay',this._event_metadata.bind(this));
		//video.addEventListener('playing',this._event_playstart.bind(this,false));
		//video.addEventListener('ended',this._event_complete.bind(this));

		var event_playing = function(e){console.log('PLAY',e)};
		video.addEventListener('playing',event_playing.bind(this));

		var event_ended = function(e){console.log('ENDS',e)};
		video.addEventListener('ended',event_ended.bind(this));

		var event_cnplay = function(e){console.log('CNPL',e)};
		video.addEventListener('canplay',event_cnplay.bind(this));

		var event_error = function(e){console.log('EROR',e)};
		video.addEventListener('error',event_error.bind(this));

		// observe buffering state
		var waiting_state = false,
			event_waiting = function(st){
				if(!this._sauce.src) st=false;
				if(waiting_state===st) return;
				this._wrppr.classList[st?'add':'remove']('load');
				waiting_state = st;//console.log('BUFF',st);
			};
		video.addEventListener('waiting',event_waiting.bind(this,true));
		video.addEventListener('loadstart',event_waiting.bind(this,true));
		var buffering_done = event_waiting.bind(this,false),
			bufdone_events = ['playing','suspend','emptied','seeked','error'];
		bufdone_events.forEach(function(en){video.addEventListener(en,buffering_done)});

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
		video.className = 'hlsjs';
		return hlsjs;
	},
	onChannelView: function(event) {
		var id = event.detail.channelId,
			cha = $App.getChannelById(id);

		this.play(cha.stream);
		//console.log('onChannelView',cha);
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
			tp = ['application/x-mpegURL','application/vnd.apple.mpegURL','application/vnd.apple.mpegurl'];

		while(tp.length) {
			var type = tp.shift();
			if(video.canPlayType(type)=='') continue;
			//else console.log('hlsPlayType', type, video.canPlayType(type));
			cp = type;
			break;
		};
		return cp;
	},
	stop: function() {

		if(this._hlsjs) {
			this._hlsjs.stopLoad();
			this._hlsjs.detachMedia(this._video);
		}

		//this._video.pause();
		//this._video.currentTime = 0;
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._video.removeAttribute('autoplay');
		this._sauce.removeAttribute('type');
		this._sauce.removeAttribute('src');
		this._video.load();
		this.poster(false);
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

		if(!hls || !this._hlsjs) this._video.load();
		else setTimeout(function(){
			this._hlsjs.loadSource(src);
			this._hlsjs.attachMedia(this._video);
		}.bind(this),250);
	}	
});