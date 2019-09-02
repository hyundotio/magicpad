//Generate keys
const generateKeys = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
    $('.create-key-progress').addClass('active').find('span').text('Generating keys...');
		$body.addClass('cursor-loading popup-uninterrupt');
		const options = {
			userIds: [{
				name: ($('.form-name').val()),
				email: ($('.form-email').val())
			}],
			numBits: 4096,
			passphrase: ($('.form-passphrase').val())
		}
		async function main() {
			try {
				const generateKey = await openpgp.generateKey(options);
				if(generateKey.err != undefined){
					throw errorFinder('genkey');
				}
				session.generatedPrivKey = generateKey.privateKeyArmored.trim();
				session.generatedPubKey = generateKey.publicKeyArmored.trim();
				session.generatedRevKey = generateKey.revocationCertificate.trim();
				createStegKey(pvDataUri,'private',session.generatedPrivKey);
				createStegKey(pubDataUri,'public',session.generatedPubKey);
				keyReady();
			} catch(e) {
				session.running = false;
				$body.removeClass('cursor-loading');
				newKeyReset();
				lipAlert(e);
			}
		}
		main();
	}
}

//output key status + download links when keys are generated
const keyReady = function() {
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
	$('.create-key-window').addClass('active').find('.window-title').find('span').text('Generated keys');
	$('body').removeClass('cursor-loading popup-uninterrupt');
	session.running = false;
}

//Reset key generation form
const newKeyReset = function() {
	let $createKeyWindow = $('.create-key-window');
	let $keyNewForm = $('.key-new-form');
	$('.key-generate-start').text('Create new private and public key set +');
	$createKeyWindow.find('.window-title').find('span').text('New key set');
	$createKeyWindow.find('a').each(function() {
		$(this).attr('href', '#').removeAttr('download');
	})
	$('.create-key-progress').removeClass('active');
	$keyNewForm.removeClass('next-page').find('input').val('');
	$keyNewForm.find('.pw-toggle').prop('checked',false).change();
	$('.key-new-done').removeClass('active');
	$('.key-generate').attr('disabled', 'disabled');
}
