var modSchedule = extendModule({
	initialize: function(node_id) {
		//console.log('modSchedule initialize');

		this.dayz = {};
		this._day = null;
		this.node = document.getElementById(node_id);
		this.dayzFill(this.node.querySelectorAll('.dayz > time'));
		this.listen('channelView',this.onChannelView.bind(this));
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			day = new Date();
		//cnapi.request.schedule(cid, null, this.setSchedule.bind(this));
		console.log('onChannelView',cid,day);
	},
	dayzFill: function(dayz) {
		var today = new Date(),
			dates = [],
			ds = 86400 * 1000;

		today.setHours(6,0,0,0);

		var start = today.getTime() - Math.floor(dayz.length/2)*ds;
		for(var i=0;i<dayz.length;i++) {
			var day = new Date(start + i*ds),
				d = day.getDate(),
				m = day.getMonth()+1,
				w = day.getDayNames(day.getDay()),
				t = day.getHtmlTime(),
				v = day.format('yyyy-mm-dd');

			var p = document.createElement('sup'),
				b = document.createElement('sub');
			dayz[i].setAttribute('datetime',t);
			dayz[i].innerHTML = '';
			dayz[i].appendChild(p);
			dayz[i].appendChild(b);
			dayz[i].onclick = this.request.bind(this,day);

			if(day.getTime()==today.getTime()) {
				dayz[i].className = 'is-today';
				p.innerText = d+'.'+(m<10?'0'+m:m);
				b.innerText = 'Сегодня';
			} else {
				p.innerText = d;
				b.innerText = w;
			}
			this.dayz[v] = dayz[i];
		}
		//console.log('modSchedule.dayz',dayz,today,start);
		console.log('modSchedule.dayz',this.dayz);
		
	},
	fillProgram: function(list) {
		
		console.log('fillProgram',list);

		var ol = document.createElement('ol'),
			li = document.createElement('li'),
			show, time, name, cell,
			v = list[0], 
			rf = new Date(v.date.year, v.date.month-1, v.date.day, 6, 0, 0, 0),
			t_from = rf.getTime(),
			t_ends = t_from + 86400 * 1000;

//console.log(new Date(t_from), new Date(t_ends));

		for(var i=0;i<list.length;i++) {
			var v = list[i],
				t = new Date(v.date.year, v.date.month-1, v.date.day, v.date.hour, v.date.minute, 0, 0);
			
			if(t.getTime()<t_from) continue;
			else if(t.getTime()>=t_ends) break;
			
			cell = li.cloneNode(false);
			show = document.createElement('a');
			name = document.createElement('span');
			time = document.createElement('time');
			
			time.setAttribute('datetime',t.getHtmlTime());
			time.innerText = t.format('h:nn');
			name.innerText = v.title;

			show.appendChild(time);
			show.appendChild(name);
			cell.appendChild(show);
			
			ol.appendChild(cell);
			//console.log(v);
		}
		
		var old = this.node.getElementsByTagName('ol')[0];
		if (!old) this.node.appendChild(ol);
		else this.node.replaceChild(ol,old);
	},
	request: function(day) {
		var cid = $App.currentChannel;
		cid = 10338262;
		
		if(this._day) {
			var p = this._day.format('yyyy-mm-dd');
			this.dayz[p].classList.remove('is-crrnt');
		}
		
		var c = day.format('yyyy-mm-dd');
		this.dayz[c].classList.add('is-crrnt');
		this._day = day;
		cnapi.request.schedule(cid, day, this.setSchedule.bind(this));
	},
	setSchedule: function(list, day) {
		console.log('setSchedule',list);
		
		var tc = $App.getTelecastById(list[0]), 
			t_from = day.setHours(6,0,0,0),
			t_ends = t_from + 86400 * 1000;

		var ol = document.createElement('ol'),
			li = document.createElement('li');

		for(var i=0;i<list.length;i++) {

			var tvs = $App.getTelecastById(list[i]),
				time = tvs.time.getTime(),
				ends = tvs.ends.getTime();
			
			if(time<t_from && ends<=t_from) continue;
			else if(time>=t_ends) break;

			li = li.cloneNode(false);
			li.appendChild(tvs.getNodeList());
			ol.appendChild(li);
			li.onclick = this.viewTelecast.bind(this,tvs.id);
			//console.log(tvs);
		}

		var old = this.node.getElementsByTagName('ol')[0];
		if (!old) this.node.appendChild(ol);
		else this.node.replaceChild(ol,old);
	},
	viewTelecast: function(id) {
		var tvs = $App.getTelecastById(id);
		console.log('viewTelecast',tvs);
		this.fire('telecastView',{id:id});
	}
});