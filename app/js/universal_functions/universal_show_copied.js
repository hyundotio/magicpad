//Activate Copied alert when user clicks on Copy to clipboard button
function showCopied($copied){
	$copied.addClass('active');
	setTimeout(function() {
		$copied.removeClass('active');
	}, 2000);
}
