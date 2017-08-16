var modTvplayer = extendModule({
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
		
		this._button = this.node.querySelector('button');
		this._button.onclick = this.click.bind(this);

		//this.fitinWidth();
		this.fitinHeight(4/3);
		this.initVideo(this._video);

		this._hlsjs = this.attachHlsjs(this._video);
		
		console.log('modTvplayer initialize');
		this._ntype.innerText = this._hlsjs ? 'hlsjs' : (this._hlsPlayType || 'video');
		
		//this.onTelecastView({detail:{id:100435894}});
		//this._video.setAttribute('autoplay','');
		var view_movie = this.play.bind(this,'http://www.cn.ru/data/files/test/countdown.mp4');
		var view_stream = this.play.bind(this,'http://hls.peers.tv/streaming/cam_lunintsev_sq/16/variable.m3u8');
		var view_record = this.play.bind(this,'http://hls.peers.tv/playlist/program/101354016.m3u8');
		//setTimeout(view_movie,0);
		//setTimeout(view_record,4000);
		//setTimeout(view_stream,8000);
		this._wrppr.classList.add('load');
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

		video.addEventListener('playing',this._event_playstart.bind(this,false));
		video.addEventListener('loadstart',this._event_playstart.bind(this,true));

		var event_ended = function(e){console.log('ENDS',e)};
		video.addEventListener('ended',event_ended.bind(this));

		var event_cnplay = function(e){console.log('CNPL',e)};
		//video.addEventListener('canplay',event_cnplay.bind(this));

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
	_event_playstart:function(reset, e) {
		if(reset===true) return this._playstart = false;
		else if(this._playstart) return null;
		else this._playstart = true;
		
		var vw = this._video.videoWidth || 600,
			vh = this._video.videoHeight || 450;
		console.log('playstart', e.type, vw+'x'+vh,this._sauce.src);
		this._video.setAttribute('width',vw);
		this._video.setAttribute('height',vh);
		this.fitinWidth(vw/vh);
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
		console.log('onChannelView',cha);
		this.play(cha.stream);
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

			console.log('LOAD', src, (!hls||!this._hlsjs), this._video)

this._video.setAttribute('autoplay','')
		if(!hls || !this._hlsjs) this._video.load();
		else setTimeout(function(){
			this._hlsjs.loadSource(src);
			this._hlsjs.attachMedia(this._video);
		}.bind(this),250);
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
	}
});