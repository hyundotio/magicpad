//Blob button fix for iOS
$('.blob-download').bind('click',function(e){
  if(iOS){
    e.preventDefault();
		let link = $(this).attr('href');
    setTimeout(function(){
        window.open(link, "_blank");
    }, 500);
  }
})

//do not run <a> buttons with disabled class
$('a').bind('click',function(e){
	if ($(this).hasClass('disabled')){
		e.preventDefault();
	}
})

$('.no-link').bind('click',function(e){
		e.preventDefault();
})

//Password show toggler
$('.pw-toggle').change(function() {
	let $thisPar = $(this).parent();
	let $passphraseBox = $thisPar.prev('input');
	if($passphraseBox.length == 0){
		$passphraseBox = $thisPar.prev('section').find('.passphrase-box');
	}
	if (this.checked) {
		$passphraseBox.attr('type', 'text');
	} else {
		$passphraseBox.attr('type', 'password');
	}
});

//label container bind (input file is triggered by label for custom styling)
$('.label-container').bind('click', function(e) {
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
	if($mainNav.hasClass('mobile-active')){
    popupExit();
		$this.removeClass('active');
		$mainNav.removeClass('mobile-active');
		$popupFilter.removeClass('active');
	} else {
    popupExit();
		$this.addClass('active');
		$mainNav.addClass('mobile-active');
		$popupFilter.addClass('active');
	}
})
