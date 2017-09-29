"use strict";
var TimelineBar = function(){return this.initialize.apply(this,arguments)};
TimelineBar.prototype = {
	initialize: function(bgn, end) {

		var node = document.createElement('u'),
			line = document.createElement('s'),
			now = Date.server(),
			bgn = new Date(bgn),
			end = new Date(end);
		
		//this.dura = (end - bgn);
		this.node = node;
		this.line = line;
		this.start = bgn;
		this.xpire = end;

		node.setAttribute('class','timeline');
		//node.setAttribute('data-start',this.start.format('dd mmmm h:nn:ss'));
		//node.setAttribute('data-xpire',this.xpire.format('dd mmmm h:nn:ss'));
		//node.setAttribute('data-total',Math.round((end - bgn)/1000)+'s');
		node.appendChild(line);

		if(end<now) this.position(1);
		else if(bgn<now) this.positionTime(now);
		else this.delayTime(now).position(0);
		//else this.position(0);

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
	duration: function(duration, start) {
		this.start = new Date();
		this.xpire = new Date(this.start.getTime() + duration);
		this.position(start || 0);
		return this;
	},
	position: function(v) {
		var line = this.line;

		if(v>=1) {
			line.style.width = '100%';
			line.style.animation = 'none';
		}
		else if(v<0) {
			line.style.width = '0%';
			line.style.animation = 'none';
		}
		else {
			line.style.width = Math.ceil(v*100)+'%';
			var	dr = Math.floor((1-v)*(this.xpire - this.start)/1000),
				sp = Math.round(dr / (dr>1500 ? 5 : 3));
			line.style.animationDuration = dr+'s';
			line.style.animationTimingFunction = 'linear';
			//line.style.animationTimingFunction = 'steps('+sp+', end)';
			//line.style.animationTimingFunction = 'steps('+dr+', end)';
			//console.log('TimelineBar.position', line.style.width, dr+'s', v);
		}
		return this;
	}
}