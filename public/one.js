

function menu() {
	var menu = $('.menu')[0];
	if (menu.style.display !=='none') {
		menu.style.display = 'none';
	} else {
		menu.style.display = 'block';
	}
}

function toggleDisplay(className) {
	var obj = "." + className; 
	if ($(obj).css('display') =='none') {
		$(obj).css('display','block');
		window.scrollBy(0, 80);
	}
	else $(obj).css('display','none');

}
