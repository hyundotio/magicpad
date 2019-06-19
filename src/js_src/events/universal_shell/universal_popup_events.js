//Exit popup button binding
$('.popup-exit').bind('click', function(e) {
	if (!session.running) {
		popupExit();
	}
})

//Expand popup button binding
$('.popup-expand').bind('click', function() {
	let $this = $(this);
	let $thisParPar = $this.parent().parent();
	if ($this.hasClass('active')){
		$this.removeClass('active').find('img').attr('src', './ui/expand.svg');
		$thisParPar.removeClass('expanded');
	} else {
		$this.addClass('active').find('img').attr('src', './ui/minimize.svg');
		$thisParPar.addClass('expanded');
	}
})


//Bindings for tabs within popups (used for Key Server Browser)
$('.popup-tabs').find('.popup-tab').each(function(){
	$(this).bind('click',function(){
		let $this = $(this);
		let $thisParPar = $this.parent().parent();
		let $popupTabContent = $thisParPar.parent().find('.popup-tab-content');
		$thisParPar.find('.active').removeClass('active');
		$this.addClass('active');
		$popupTabContent.find('.active').removeClass('active');
		$popupTabContent.find('.'+$this.attr('data-tab')).addClass('active');
	})
})
