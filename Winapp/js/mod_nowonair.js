"use strict";
var modNowonair = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.cont = this.node.querySelector('.scrollhide > div');
		console.log('modNowonair',this.node);
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
	getNowonairNode: function(cha) {
		var div = document.createElement('div'),
			i = document.createElement('i'),
			a = document.createElement('a'),
			t = document.createElement('time');
		div.className = 'tvsair';
		div.appendChild(i);div.appendChild(a);
		a.appendChild(t);
		t.innerText = cha.title;
		return div;
/*
					<div class="tvsair">
						<i><img src="img/poster16x9.jpg"></i>
						<a>
							<time>22:22, Первый общеобразовательный общеобразовательный</time>
							<span>Первый общеобразовательный телеканал телеканал телеканал</span>
						</a>
					</div>
*/
	},
	update: function(channels) {

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
			ns = ns.cloneNode(false);
			ns.innerText = channels[j].title;
			li.appendChild(ns);
			ul.appendChild(li);
			this._list[cid]=li;
		}
		this.cont.appendChild(ul);
		this.onscrollLazyLoad();
	},
	loadElements: function(lis) {
		var cid = [];
		lis.forEach(function(li){cid.push(li.getAttribute('data-cid'))});
		console.log(cid.join(','));
		return cnapi.request.nowonair(cid.join(','),this.fillElements.bind(this));
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

			console.log(cid, tvs.title, li);
		}
		console.log('fillElements',tvs);
	}
});