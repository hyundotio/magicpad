//initialize application
const resetFields = function() {
	$('input').each(function(){
		let $this = $(this);
		if(!$this.hasClass('reset-ignore')){
			$this.val('').prop('checked',false);
		}
	})
	$('.attachment-radio').eq(0).prop('checked',true).change();
	$('textarea').val('');
	$('.init-disabled').attr('disabled','disabled').removeClass('init-disabled');
}
const init = function() {
	window.URL = window.URL || window.webkitURL;
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	resetFields();
	checkReadImport();
	recallSession();
	keyUpChecker($('.pubkey-upload-input'),$('.upload-public-key-paste'));
	keyUpChecker($('.searchbox-pubkey'),$('.search-pubkey'));
	keyUpChecker($('.pubkey-input'),$('.import-pubkey-str'));
	readFormCheck();
	writeFormCheck();
	newKeyFormCheck();
	attachmentFormcheck();
	setTimeout(function () {
      resizeViewport();
  }, 300);
}
