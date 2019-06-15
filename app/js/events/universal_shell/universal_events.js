//do not run <a> buttons with disabled class
$('a').bind('click',function(e){
	if ($(this).hasClass('disabled')){
		e.preventDefault();
	}
})

//Password show toggler
$('.pw-toggle').change(function() {
	let $passphraseBox = $('.passphrase-box');
	if (this.checked) {
		$passphraseBox.attr('type', 'text');
	} else {
		$passphraseBox.attr('type', 'password');
	}
});

//label container bind (input file is triggered by label for custom styling)
$('.label-container').bind('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	$(this).next('input').click();
})

//autofocus out of select + select for better UX
$('select').change(function(){
	$(this).blur();
})

//mobile app Menu actuator
$('.mobile-menu').bind('click',function(){
	let $mainNav = $('.main-nav');
	let $popupFilter = $('.popup-filter');
	let $this = $(this);
	popupExit();
	if($mainNav.hasClass('mobile-active')){
		$this.removeClass('active');
		$mainNav.removeClass('mobile-active');
		$popupFilter.removeClass('active');
	} else {
		$this.addClass('active');
		$mainNav.addClass('mobile-active');
		$popupFilter.addClass('active');
	}
})
