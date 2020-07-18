var Default = {

	favicon: null,

	changeFavicon: function(src){

		Default.favicon = src;

		var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'shortcut icon';
		link.href = src;
		document.getElementsByTagName('head')[0].appendChild(link);

	},

	toClipboard: function(str){

		const el = document.createElement('textarea');

		el.value = str;

		el.setAttribute('readonly', '');
		el.style.position = 'absolute';                 
		el.style.left = '-9999px';

		document.body.appendChild(el);

		const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;

		el.select();

		document.execCommand('copy');
		document.body.removeChild(el);

		if (selected) {
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(selected);
		}

	}

}

$(function(){

	Lucy.init();

	Lucy.favicon.normal();

});

$(window).on('resize', function(){
	Lucy.fit()
});

$(window).on('focus', function(){

	Lucy.favicon.normal();

});

document.onselectionchange = function(){

	Lucy.checkUsefulSelection();

}

shortcut.add("CTRL+SHIFT+C", function(){

	Default.toClipboard(Lucy.term.getSelection());

	Lucy.term.focus()

});

shortcut.add("CTRL+SHIFT+L", function(){

	// Lucy.openInIndexr();

});