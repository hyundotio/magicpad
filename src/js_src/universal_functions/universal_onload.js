//get rid of loading screen when all assets are loaded
window.onload = function(){
	init();
	let loadingStart = document.getElementById('loading-start');
	loadingStart.style.opacity = 0;
	setTimeout(function(){
		$(loadingStart).remove();
	},250);
}

//Handles online notification lip (alerts user if they are online)
window.addEventListener('online', function() {
	$('.online-flag').addClass('active');
});
window.addEventListener('offline', function() {
	$('.online-flag').removeClass('active');
});
