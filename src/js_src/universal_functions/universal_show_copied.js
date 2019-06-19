//Activate Copied alert when user clicks on Copy to clipboard button
const showCopied = function($copied){
	$copied.addClass('active');
	setTimeout(function() {
		$copied.removeClass('active');
	}, 2000);
}
