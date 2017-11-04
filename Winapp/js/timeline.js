"use strict";
var TimelineBar = function(){return this.initialize.apply(this,arguments)};
TimelineBar.prototype = {
	initialize: function(bgn, end) {

		var node = document.createElement('u'),
			line = document.createElement('s');
		
		this.node = node;
		this.line = line;
		
		node.setAttribute('class','timeline');
		node.appendChild(line);

		return this;
	},
	onclick: function(e) {
		if(e){e.preventDefault();e.stopImmediatePropagation()}
		var lft = this.xpire - Date.server();
		console.log('click', Math.round(lft/1000));
	},
	renew: function() {
		this.node.removeChild(this.line);
		this.positionTime(Date.server());
		this.node.appendChild(this.line);
	},
	delayTime: function(t) {
		var dtime = new Date(t),
			delay = Math.round((this.start-dtime)/1000);
		return this.delay(delay);
	},
	delay: function(delay) {
		var dly = parseInt(delay,10),
			dpv = (!isNaN(dly) && dly>0) ? dly+'s' : null;
		this.line.style.animationDelay = dpv;
		this.node.style.animationDelay = dpv;
		return this;
	},
	positionTime: function(t) {
		
		var bgn = this.start,
			end = this.xpire,
			ttl = (end - bgn),
			pss = (t - bgn),
			lft = ttl - pss,
			p = pss/ttl;
		
		if(false) {
			var log = Math.round(pss/1000)+'/'+Math.round(ttl/1000)+'s';
			log +=' '+Math.round(p*100)+'%; left '+Math.round(lft/1000)+'s';
			console.log(log);
		}
		
		return this.position(p);
	},
	duration: function(duration, position) {
		//console.log('TimelineBar.duration', duration, position);
		var position = (position || 0),
			dr = Math.round(duration),
			ps = position/duration;

		dr = Math.round(duration - position);

		this.line.style.animation = null;
		this.node.removeChild(this.line);

		var animation = 'timeline-s '+dr+'s linear 0s 1';
		animation+= ' normal forwards';
		this.line.style.animation = animation;
		this.line.style.width = Math.round(ps * 100)+'%';
		setTimeout(this.node.appendChild.bind(this.node,this.line),50);
		
		return this;
	},
	xposition: function(v, anime) {
		var line = this.line,
			stop = anime===false;

		this.node.removeChild(this.line);
		if(v>=1) {
			line.style.width = '100%';
			line.style.animation = 'none';
		}
		else if(v<0) {
			line.style.width = '0%';
			line.style.animation = 'none';
		}
		else {
			var	dr = Math.floor((1-v)*(this.xpire - this.start)/1000),
				//sp = Math.round(dr / (dr>1500 ? 5 : 3)),
				//tf = 'steps('+sp+', end)',
				tf = 'steps('+dr+', end)',
				tf = 'linear',
				lw = Math.ceil(v*100);
			//line.style.animationDuration = dr+'s';
			//line.style.animationTimingFunction = 'linear';
			//line.style.animationTimingFunction = 'steps('+sp+', end)';
			//line.style.animationTimingFunction = 'steps('+dr+', end)';
			line.style.width = lw+'%';
			if(stop) line.style.animation = 'none';
			else line.style.animation = 'timeline-s '+dr+'s 0s 1 '+tf;
			console.log('TimelineBar.position', stop, line.style.width, dr+'s', v);
		}
		
		this.node.appendChild(this.line);
		return this;
	},
	pause: function(st) {
		var st = typeof(st)=='boolean' ? st : !this._paused;
		this.line.style.animationPlayState = st ? 'paused' : 'running';
		this._paused = st;
		return this;
	},
	visibile: function(st) {
		var st = typeof(st)=='boolean' ? st : this._hidden;
		this.node.style.display = st ? 'block' : 'none';
		this._hidden = !st;
		return this;
	}
}