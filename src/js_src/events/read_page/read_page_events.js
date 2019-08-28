//Convert imported steganography to text message on read page
$('.import-stg-msg').change(function(){
	let $this = $(this);
	convertStegMsg($this);
	$this.val('');
})
//Decrypt message on read page
$('.decrypt-message').bind('click', function() {
	if (!$(this).is(':disabled')) {
		$('body').addClass('loading');
		decryptMessage();
	}
})

//Re-open Processed Output containing decrypted message on Read page
$('.view-message-decrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		viewDecMsg();
	}
})

//Form check for read page textarea
$('.read').keyup(function(e) {
	readFormCheck()
}).change(function(){
	readFormCheck()
})
