"use strict";
var modNowonair = extendModule({
	initialize: function(node_id) {
		this._tiles = {};
		this.node = document.getElementById(node_id);
		this.cont = this.node.querySelector('.scrollhide > div');
		//console.log('modNowonair',this.node);
		this.listen('channelView',this.onChannelView.bind(this));
	},
	onChannelView: function(event) {

		var cur = this._current ? this._tiles[this._current] : null;
		if(cur) cur.classList.remove('checked');

		var id = event.detail.channelId;
		this._tiles[id].classList.add('checked');
		this._current = id;

		//var cha = $App.getChannelById(id);
		//console.log('onChannelView',cha);

	},
	onscrollLazyLoad: function() {
		var list = [];
		var lis = this.node.querySelectorAll('li');
		for(var i=0;i<lis.length;i++) list.push({
			sy: lis[i].offsetTop,
			sh: lis[i].offsetTop + lis[i].offsetHeight,
			li: lis[i]
		});

		var callback = this.loadElements.bind(this),
			onscroll = function() {
			var bttm = sn.scrollTop + sn.offsetHeight,
				indx = [].concat(list), items = [],
				k = indx.length-1;
			for(;k>=0;k--) if(indx[k].sy<bttm) {
				list.splice(list.indexOf(indx[k]), 1);
				indx[k].li.classList.remove('latent');
				items.push(indx[k].li);
			}
			if(!list.length) sn.removeEventListener('scroll',sh);
			callback(items);
		};

		var st = undefined,	sn = this.cont,
			sh = function(e){if(st)clearTimeout(st);st=setTimeout(onscroll,300)};
		sn.addEventListener('scroll',sh,false);
		onscroll();
	},
	update: function(channels) {

		var ul = this.cont.getElementsByTagName('ul')[0];
		if(ul) this.cont.removeChild(ul);

		this._list = {};
		var ul = document.createElement('ul'),
			li = document.createElement('li'),
			ns = document.createElement('strong');
		li.className = 'latent';

		var cid;
		for(var j in channels) {
			cid = channels[j].cid;
			li = li.cloneNode(false);			
			li.setAttribute('data-cid', cid);
			li.addEventListener('click',this.onChannelClick.bind(this,cid),false);
			ns = ns.cloneNode(false);
			ns.appendChild(channels[j].getLogo());
			ns.appendChild(document.createTextNode(channels[j].title));
			li.appendChild(ns);
			ul.appendChild(li);
			this._list[cid]=li;
			this._tiles[cid]=li
		}
		this.cont.appendChild(ul);
		this.onscrollLazyLoad();
	},
	loadElements: function(lis) {
		var cid = [];
		lis.forEach(function(li){cid.push(li.getAttribute('data-cid'))});
		if(cid.length) cnapi.request.nowonair(cid.join(','),this.fillElements.bind(this));
		//console.log(cid.join(','));
		return; 
	},
	fillElements: function(data) {
		var tvs, li, nd, ng, pg;
		for(var cid in data) {
			li = this._list[cid];
			tvs = $App.getTelecastById(data[cid]);
			nd = document.createElement('span');
			pg = document.createElement('img');
			ng = document.createElement('i');
			li.appendChild(nd);
			li.appendChild(ng);
			ng.appendChild(pg);

			nd.innerText = tvs.title;
			pg.setAttribute('src',tvs.poster);

			//console.log(cid, tvs.title, li);
		}
		//console.log('fillElements',tvs);
	},
	onChannelClick: function(id, event) {
		if(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		this.fire('channelView',{channelId:id});
	}
});