const resizeViewport = function() {
	const viewheight = $(window).outerHeight();
	const viewwidth = $(window).outerWidth();
	const viewport = document.querySelector("meta[name=viewport]");
	viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
}

window.addEventListener("orientationchange", function() {
		resizeViewport();
});

window.addEventListener('resize', function(event){
	  resizeViewport();
});
