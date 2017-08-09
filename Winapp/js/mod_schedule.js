var modSchedule = extendModule({
	initialize: function(node_id) {
		//console.log('modSchedule initialize');
		this.dayz = {};
		this._day = null;
		this.node = document.getElementById(node_id);
		this.container = this.node.querySelector('.mod-schedule-dayz > div');
		//this.dayzFill(this.node.querySelectorAll('.mod-schedule-dayz time'));
		this.listen('channelView',this.onChannelView.bind(this));
		this.node.style.display = 'block';
		
		//this.onChannelView({detail:{channelId:10338251}});
		//this.request(10338251);
		//cnapi.request.schedule(cid, null, this.setSchedule.bind(this));
	},
	onChannelView: function(event) {
		var day = new Date.server(),
			cid = event.detail.channelId,
			cha = $App.getChannelById(cid),
			days = cha.scheduledDates;
		console.log('onChannelView',cha);
		this.dayzFill(cid, days);
		this.request(cid);
	},
	dayzFill: function(cid, days) {
		var list = document.createElement('ul'),
			wrpr = this.container;
		while(wrpr.childNodes.length) wrpr.removeChild(wrpr.childNodes[0]);

		var today = new Date.server().setHours(6,0,0,0);
		// return console.log(wrpr, days, today);

		for(var i=0;i<days.length;i++) {
			var day = days[i];
			day.setHours(6,0,0,0);
			var d = day.getDate(),
				m = day.getMonth()+1,
				w = day.getDayNames(day.getDay()),
				t = day.getTime(),
				v = day.format('yyyy-mm-dd');

			var li = document.createElement('li'),
				time = document.createElement('time'),
				p = document.createElement('sup'),
				b = document.createElement('sub');

			p.innerText = t!=today ? d : d+'.'+(m<10?'0'+m:m);
			b.innerText = t!=today ? w : 'Сегодня';
			if(t==today) time.className='is-today';

			time.onclick = this.request.bind(this,cid,day);
			time.setAttribute('datetime',day.getHtmlTime());
			time.appendChild(p);
			time.appendChild(b);
			li.appendChild(time);
			list.appendChild(li);
			this.dayz[v] = time;
		}
		wrpr.appendChild(list);
	},
	request: function(cid, day) {
		if(this._day) {
			var p = this._day.format('yyyy-mm-dd');
			this.dayz[p].classList.remove('is-crrnt');
		}
		
		var day = day || Date.server(),
			c = day.format('yyyy-mm-dd');
		this.dayz[c].classList.add('is-crrnt');
		this._day = day;
		this.scrollTo(day);
		cnapi.request.schedule(cid, day, this.setSchedule.bind(this));
	},
	scrollTo: function(day) {
		var c = day.format('yyyy-mm-dd'),
			li = this.dayz[c].parentNode,
			lx = li.offsetLeft,
			lw = li.offsetWidth,
			dx = Math.round(this.container.offsetWidth/2);
		//console.log('scrollTo', c);
		this.container.scrollLeft = lx + lw/2 - dx;
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
			//li.onclick = this.viewTelecast.bind(this,tvs.id);
			li.onclick = this.fire.bind(this,'telecastView',{id:tvs.id});
			//console.log(tvs);
		}

		var old = this.node.getElementsByTagName('ol')[0];
		if (!old) this.node.appendChild(ol);
		else this.node.replaceChild(ol,old);
	},
	viewTelecast: function(id) {
		var tvs = $App.getTelecastById(id);
		console.log('viewTelecast', tvs);
		// this.fire('telecastView',{id:id});
	}
});