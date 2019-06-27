

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

var images;
var index = 0;
var timeout;

function slideShow(){
	images = document.getElementsByClassName("picture");
	images[index].style.display ="none";
	index = (index+1)%images.length;
	images[index].style.display="block";
	timeout=setTimeout(slideShow , 3000);

}

function stopShow(){
	clearTimeout(timeout);
}
function startShow(){
	timeout = setTimeout(slideShow, 3000);
}

function previousSlide(){
	clearTimeout(timeout);
	images[index].style.display="none";
	index=(index-2+images.length)%images.length;
	slideShow();
}

function nextSlide(){
    clearTimeout(timeout);
    slideShow();
}