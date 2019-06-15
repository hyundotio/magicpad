//Open steganography key converter popup
$('.open-keyconverter').bind('click',function(){
	$('.steg-key-converter-window').addClass('active');
	$('.popup-filter').addClass('active');
});

//Detect steganography imported file
$('.key-convert').change(function(){
	convertStegKey($(this));
});

//copy to clipboard - converted
$('.copy-converted').bind('click',function(){
	Clipboard.copy($('.converted-key-output').text());
	showCopied($('.steg-key-converter-window').find('.copied'));
})
