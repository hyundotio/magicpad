//initialize application
const init = function() {
	window.URL = window.URL || window.webkitURL;
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	$('input').each(function(){
		if($(this).attr('type') == 'radio'){
			if($(this).index() == 0){
					$(this).prop('checked',true);
			} else {
					$(this).prop('checked',false);
			}
		} else {
			$(this).val('').prop('checked',false);
		}
	})
	$('textarea').val('');
	keyUpChecker($('.pubkey-upload-input'),$('.upload-public-key-paste'));
	keyUpChecker($('.searchbox-pubkey'),$('.search-pubkey'));
	keyUpChecker($('.pubkey-input'),$('.import-pubkey-str'));
	readFormCheck();
	writeFormCheck();
	newKeyFormCheck();
	attachmentFormcheck();
	$('.init-disabled').attr('disabled','disabled').removeClass('init-disabled');
	setTimeout(function () {
      resizeViewport();
  }, 300);
}
