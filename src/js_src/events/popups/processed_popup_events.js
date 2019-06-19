//Copy to clipboard button
$('.copy-processed').bind('click', function() {
	//copyProcessed($('.processed-output').text());
	Clipboard.copy($('.processed-output').text());
	showCopied($('.processed-output-window').find('.copied'));
})
