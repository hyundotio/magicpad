//Clear selected file for steganography host
$('.clear-steg-host').bind('click',function(){
	$('.stg-host-label').text('Select steganograph host');
	$('.stg-host').val('');
	$(this).removeClass('active');
})

//Form check for write page textarea
$('.write').keyup(function() {
	writeFormCheck()
}).change(function(){
	writeFormCheck()
})

//Detect sleected file for steganography host on write page
$('.stg-host').change(function(){
	let $this = $(this);
	let file = $this[0].files[0];
	let reader = new FileReader();
	let $stgClear = $('.clear-steg-host');
	if(file != undefined){
		if($.inArray(file['type'], ["image/gif", "image/jpeg", "image/png"]) > -1){
			$('.stg-host-label').text('Reselect steganograph host');
			$stgClear.addClass('active');
		} else {
			$(this).val('');
			$stgClear.removeClass('active');
			lipAlert('The imported file is not a valid image to be used as a steganograph host');
		}
	}
})

//Checkbox binding for Signing Message in write page
$('.encrypt-sign-checkbox').change(function() {
	let $encryptMessage = $('.encrypt-message');
	let $signCredentials = $('.sign-credentials');
	if (this.checked) {
		$encryptMessage.addClass('sign-enabled');
		$signCredentials.removeClass('disabled').find('input').removeAttr('disabled');
	} else {
		$encryptMessage.removeClass('sign-enabled');
		$signCredentials.addClass('disabled').find('input').attr('disabled', 'disabled');
	}
	writeFormCheck()
})

//Binding for encrypting messages
$('.encrypt-message').bind('click', function() {
	let $this = $(this);
	if (!$this.is(':disabled')) {
		$('body').addClass('loading');
		if ($this.hasClass('sign-enabled')) {
			signMessage();
		} else {
			encryptMessage($('.text-write').val(), false);
		}
	}
})

//Binding to view encrypted message processed-output popup
$('.view-message-encrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		if($('.steg-msg-download').attr('href').length > 1){
			viewEncMsg(true);
		} else {
			viewEncMsg(false);
		}
	}
})
