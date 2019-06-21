//bindings for navigating between main nav tabs
$('.tab').bind('click', function(e) {
	e.preventDefault();
	let $main = $('main');
	let $tabWindow = $main.find('.tab-window');
	let nextTab = $(this).attr('data-tab');
	$('.main-nav').find('.active').removeClass('active');
	$(this).addClass('active');
	$tabWindow.removeClass('active').each(function() {
		if ($(this).hasClass(nextTab)) {
			popupExit();
			$(this).addClass('active');
		}
		for (let i = 0; i < formChecker.length; i++){
			if(formChecker[i].type == nextTab){
				formChecker[i].runCheck();
			}
		}
	})
})
