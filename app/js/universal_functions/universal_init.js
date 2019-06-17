//initialize application
function init() {
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
      let viewheight = $(window).height();
      let viewwidth = $(window).width();
      let viewport = document.querySelector("meta[name=viewport]");
      viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0, user-scalable=0, maximum-scale=1");
  }, 300);
}
