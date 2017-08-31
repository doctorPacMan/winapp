"use strict";
var modNowonair = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);

		var li = this.node.querySelector('li');
		for(var i=0;i<12;i++) li.parentNode.appendChild(li.cloneNode(true));

		var sh = this.node.querySelector('.scrollhide > div'),
			cb = this.onscroll.bind(this,sh), st,
			so = function(e){
				if(st) clearTimeout(st);
				st = setTimeout(cb,500);
				//console.log(e)
			};
		sh.scrollTop = 0;
		sh.addEventListener('scroll',so,false);
		//sh.addEventListener('scroll',this.onscroll.bind(this),false);

		this._indx = [];
		var lis = this.node.querySelectorAll('li');
		for(var i=0;i<lis.length;i++) this._indx.push({
			//li: lis[i],
			sy: lis[i].offsetTop,
			sh: lis[i].offsetHeight
		});

		console.log('modNowonair',this.node,sh);
	},
	onscroll: function(nn) {
		var yTop = nn.scrollTop,
			yBot = nn.scrollTop + nn.offsetHeight;
		console.log(yTop, yBot);

		for(var k=0;k<this._indx.length;k++) {
			var li = this._indx[k];
			console.log(li);
		}
	}
});