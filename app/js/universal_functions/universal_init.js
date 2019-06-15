//initialize application
function init() {
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	$('input').val('').prop('checked',false);
	$('textarea').val('');
	keyUpChecker($('.pubkey-upload-input'),$('.upload-public-key-paste'));
	keyUpChecker($('.searchbox-pubkey'),$('.search-pubkey'));
	keyUpChecker($('.pubkey-input'),$('.import-pubkey-str'));
	readFormCheck();
	writeFormCheck();
	newKeyFormCheck();
	$('.server-key-pub-import-upload').attr('disabled','disabled');
	$('.copy-converted').attr('disabled','disabled');
	setTimeout(function () {
      let viewheight = $(window).height();
      let viewwidth = $(window).width();
      let viewport = document.querySelector("meta[name=viewport]");
      viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0, user-scalable=0, maximum-scale=1");
  }, 300);
}
