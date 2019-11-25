//Open steganography key converter popup
$('.open-keyconverter').bind('click',function(){
	openPopup('.steg-key-converter-window');
});

//Detect steganography imported file
$('.key-convert').change(function(){
	convertKey($(this));
});

//copy to clipboard - converted
$('.copy-converted').bind('click',function(){
	Clipboard.copy($('.converted-key-output').text());
	showCopied($('.steg-key-converter-window').find('.copied'));
})
