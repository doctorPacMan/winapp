"use strict";
var modSchedule = extendModule({
	initialize: function(node_id) {
		//console.log('modSchedule initialize');
		this.dayz = {};
		this._time = {};
		this._cid = null;
		this._day = null;
		this.node = document.getElementById(node_id);
		this.container = this.node.querySelector('.mod-schedule-dayz > div');
		this.dayzBind(this.node.querySelectorAll('.mod-schedule-dayz time'));

		var arr = this.node.querySelectorAll('.mod-schedule-dayz > button');
		arr[0].addEventListener('click',this.slide.bind(this,-1));
		arr[1].addEventListener('click',this.slide.bind(this, 1));

		this.listen('channelView',this.onChannelView.bind(this));
		this.node.classList.remove('hidden');
		
		//this.onChannelView({detail:{channelId:10338251}});
		//this.request(10338251);
		//cnapi.request.schedule(cid, null, this.setSchedule.bind(this));
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = $App.getChannelById(cid);
		
		if(this._cid==cid) return;
		
		this._cid = event.detail.channelId;
		//console.log('onChannelView',this._cid, this._day);
		console.log('onChannelView',this._cid);
		console.log('onChannelView',cha.scheduledDates);
		
		this.dayzUpdt(cha.scheduledDates);
		//this.request(this._cid,this._day);
	},
	dayzUpdt: function(dates) {
		var dates = [].concat(dates);

		for(var day_id in this._time) {
			//console.log(day_id, , this._time[day_id]);
			//console.log(this._time[day_id]);
			this._time[day_id].classList[dates.indexOf(day_id)==-1?'add':'remove']('is-empty');
		}
	},
	dayzBind: function() {
		var c = this.container;
		while(c.childNodes.length) c.removeChild(c.childNodes[0]);

		var today = new Date(new Date().setHours(6,0,0,0)),
			wd = today.getDay(),
			wd = wd==0 ? 7 : wd,
			monday = new Date(today);

		monday.setHours(6,0,0,0);
		monday.setDate(today.getDate() - wd + 1);
		var fstday = new Date(monday.getTime() - 86400*1000*7);
		var lstday = new Date(fstday.getTime() + 86400*1000*20);

		var list = document.createElement('ul');
		for(var i=-7; i<14; i++) {
		//for(var i=0; i<7; i++) {
			var day = new Date(monday.getTime() + i*86400*1000),
				day_id = day.format('dd/mm');
			var li = document.createElement('li'),
				time = document.createElement('time'),
				b = document.createElement('b'),
				u = document.createElement('u');
			time.appendChild(b);
			time.appendChild(u);
			li.appendChild(time);
			list.appendChild(li);

			b.innerText = day.getDate();
			u.innerText = day.getDayNames(day.getDay());

			if(today.getTime()==day.getTime()) {
				u.innerText = 'Today';
				time.classList.add('is-today');
				time.classList.add('is-crrnt');
			}
			time.setAttribute('datetime',day.getHtmlTime());
			time.setAttribute('data-day',day_id);
			time.addEventListener('click',this.clickDay.bind(this,day));
			//time.addEventListener('click',this.focus.bind(this,day));
			this._time[day_id] = time;
			//console.log(time.getAttribute('data-day'));
		}
		this.container.appendChild(list);
		this.focus(today);
		this._day = today;
	},
	slide: function(dir) {
		var c = this.container;
		c.scrollLeft = c.scrollLeft + dir*c.offsetWidth;
	},
	focus: function(day) {
		var day_id = new Date(day).format('dd/mm'),
			time = this._time[day_id] || undefined,
			li = time.parentNode,
			cont = this.container;
		cont.scrollLeft = li.offsetLeft + li.offsetWidth/2 - cont.offsetWidth/2;
	},
	clickDay: function(day) {
		this._day = day;
		var day = new Date(day),
			day_id = day.format('dd/mm'),
			time = this._time[day_id] || undefined;
		//console.log(time, day);
		this.request(this._cid,this._day,this.setSchedule.bind(this));
	},
	request: function(cid, day) {
		cnapi.request.schedule(cid, day, this.setSchedule.bind(this));
	},
	setSchedule: function(tvs_ids, day) {

		console.log('setSchedule',tvs_ids);

		var day_from = day.setHours(6,0,0,0),
			day_ends = day_from + 86400 * 1000;// +24h

		var ol = document.createElement('ol'),
			li = document.createElement('li');

		for(var i=0;i<tvs_ids.length;i++) {

			var tvs = $App.getTelecastById(tvs_ids[i]),
				time = tvs.time.getTime(),
				ends = tvs.ends.getTime();
			
			if(time<day_from && ends<=day_from) continue;
			else if(time>=day_ends) break;

			li = li.cloneNode(false);
			li.appendChild(tvs.getNodeList());
			ol.appendChild(li);
			li.onclick = this.viewTelecast.bind(this,tvs.id);
			//li.onclick = this.fire.bind(this,'telecastView',{id:tvs.id});
			//console.log(tvs);
		}

		var old = this.node.getElementsByTagName('ol')[0];
		if (!old) this.node.appendChild(ol);
		else this.node.replaceChild(ol,old);
	},
	viewTelecast: function(id) {
		var tvs = $App.getTelecastById(id);
		//console.log('viewTelecast', tvs);
		//tvs.source = 'http://www.cn.ru/data/files/test/countdown.mp4';
		this.fire('telecastView',{id:tvs.id});
	}
});