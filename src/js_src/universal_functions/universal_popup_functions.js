//Exits popup
const popupExit = function(){
	if(!$('body').hasClass('popup-uninterrupt')){
		$('.popup').removeClass('active');
		$('.main-nav').removeClass('mobile-active');
		$('.mobile-menu').removeClass('active');
		$('.popup-filter').removeClass('active');
	}
}
