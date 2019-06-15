//Generate keys
function generateKeys() {
	if (!session.running) {
		session.running = true;
    $('.create-key-progress').addClass('active').find('span').text('Generating keys...');
		$('body').addClass('cursor-loading');
		let options = {
			userIds: [{
				name: ($('.form-name').val()),
				email: ($('.form-email').val())
			}],
			numBits: 4096,
			passphrase: ($('.form-passphrase').val())
		}
		openpgp.generateKey(options).then(key => {
			session.generatedPrivKey = key.privateKeyArmored.trim();
			session.generatedPubKey = key.publicKeyArmored.trim();
			session.generatedRevKey = key.revocationCertificate.trim();
			createStegKey('./ui/privatekeyreference.jpg','private',session.generatedPrivKey);
			createStegKey('./ui/publickeyreference.jpg','public',session.generatedPubKey);
			keyReady();
		}).catch(function(e) {
			session.running = false;
			$('body').removeClass('cursor-loading');
			lipAlert('Keys could not be generated. Please try again.');
			newKeyReset();
		});
	}
}

//output key status + download links when keys are generated
function keyReady() {
	let formName = $('.form-name').val().split(' ')[0].toLowerCase().replace(/\s/g, '');
	$('.key-public-img-download').attr('download',formName+'_pub_steg.png');
	$('.key-private-img-download').attr('download',formName+'_priv_steg.png');
	$('.key-public-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_public.asc,' + btoa(session.generatedPubKey)).attr('download', formName+'_public.asc');
	$('.key-private-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_private.asc,' + btoa(session.generatedPrivKey)).attr('download', formName+'_private.asc');
	$('.key-rev-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_revoke.asc,' + btoa(session.generatedRevKey)).attr('download', formName+'_revoke.asc');
	$('.key-new-done').addClass('active');
	$('.key-new-form').addClass('next-page');
	$('.create-key-progress').removeClass('active').find('span').text('Keys generated');
	$('.key-generate-start').text('Download generated keys');
	$('.create-key-window').find('.window-title').find('span').text('Generated keys');
	$('body').removeClass('cursor-loading');
	session.running = false;
}

//Reset key generation form
function newKeyReset() {
	let $createKeyWindow = $('.create-key-window');
	$('.key-generate-start').text('Create new private and public key set +');
	$createKeyWindow.find('.window-title').find('span').text('New key set');
	$createKeyWindow.find('a').each(function() {
		$(this).attr('href', '#').removeAttr('download');
	})
	$('.create-key-progress').removeClass('active');
	$('.key-new-form').removeClass('next-page').find('input').val('');
	$('.key-new-done').removeClass('active');
	$('.key-generate').attr('disabled', 'disabled');
}
