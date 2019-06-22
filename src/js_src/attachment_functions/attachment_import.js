//Input key filename when selected
const attachmentFilename = function($type) {
	async function main() {
		try {
			const attachment = await resolveLoadFileURL($type);
			let $filenameEl = $('.attachment-filename');
			const filename = getFilename($type.val());
			$filenameEl.text(' - ' + filename);
			$('.attachment-size').text('File size: '+bytesToSize(attachment.file.
				size));
			$('.attachment-import-label').find('span').text('Reselect file');
		} catch(e) {
			$type.val('');
			opgpErrorHandler(true,'file');
		}
	}
	main();
}
