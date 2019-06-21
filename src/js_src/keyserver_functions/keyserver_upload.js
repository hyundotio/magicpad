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
					const hkpUpload = await resolveUploadKey(session.keyToUploadFile);
					if (opgpErrorHandler(hkpUpload.err)) return;
					const pbKeyObj = await resolvePubKey(session.keyToUploadFile);
					if (opgpErrorHandler(pbKeyObj.err)) return;
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

			/*
			hkp.upload(session.keyToUploadFile).then(function() {
				//downloadlink
				openpgp.key.readArmored(session.keyToUploadFile).then(data => {
					const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
					let downloadLink = $('.upload-key-server-list').val() + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
					if(type !== 'import'){
						//paste
						$('.paste-upload-link').addClass('active').attr('href',downloadLink);
					} else {
						$('.import-upload-link').addClass('active').attr('href',downloadLink);
						//import
					}
					$('.upload-progress').removeClass('active').find('span').text('Upload complete');
					session.running = false;
				}).catch(function(e){
					$('.upload-progress').removeClass('active').find('span').text('Upload failed');
					lipAlert("The fingerprint could not be generated from the uploaded key. Please try again.");
					session.running = false;
				})
			}).catch(function(e){
				$('.upload-progress').removeClass('active').find('span').text('Upload failed');
				lipAlert('The public key could not be uploaded. Please try again.');
				session.running = false;
			});
			*/
		} else {
			$('.upload-progress').removeClass('active').find('span').text('Upload failed');
			lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
			session.running = false;
		}
	}
}
