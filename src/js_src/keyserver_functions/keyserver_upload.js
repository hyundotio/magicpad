//Function to upload key
const uploadKey = function(type){
	if(!session.running){
		session.running = true;
		if(type !== 'import'){
				session.keyToUploadFile = $('.pubkey-upload-input').val();
		}
		let $uploadProgress = $('.upload-progress');
		$uploadProgress.addClass('active').find('span').text('Uploading key...');
		let server = $('.upload-key-server-list').val();
		if (location.protocol == "https:") {
			server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		if(testPubKey(session.keyToUploadFile, server)){
			async function main() {
				try {
					const hkp = new openpgp.HKP(server);
					const hkpUpload = await hkp.upload(session.keyToUploadFile);
					const pbKeyObj = await openpgp.readArmored.key(session.keyToUploadFile);
					const buffer = new Uint8Array(pbKeyObj.keys[0].primaryKey.fingerprint).buffer;
					let downloadLink = $('.upload-key-server-list').val() + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
					if(type !== 'import'){
						//paste
						$('.paste-upload-link').addClass('active').attr('href',downloadLink);
					} else {
						$('.import-upload-link').addClass('active').attr('href',downloadLink);
						//import
					}
					$uploadProgress.removeClass('active').find('span').text('Upload complete');
					session.running = false;
				} catch(e) {
					$uploadProgress.removeClass('active').find('span').text('Upload failed');
					lipAlert(e);
					session.running = false;
				}
			}
			main();
		} else {
			$('.upload-progress').removeClass('active').find('span').text('Upload failed');
			lipAlert(errorFinder('pubkey'));
			session.running = false;
		}
	}
}
