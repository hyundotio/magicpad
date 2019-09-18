//Exits popup
const popupExit = function(){
	let $body = $('body');
	if(!$body.hasClass('popup-uninterrupt')){
		$body.removeClass('popup-active');
		$('.popup').removeClass('active');
		$('.main-nav').removeClass('mobile-active');
		$('.mobile-menu').removeClass('active');
		$('.popup-filter').removeClass('active');
	}
}

const openPopup = function(className){
	$('body').addClass('popup-active');
	$('.popup-filter').addClass('active');
	$(className).addClass('active');
}
