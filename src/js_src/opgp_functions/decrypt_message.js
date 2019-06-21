//Decrypt messages
const decryptMessage = function() {
	if (!session.running) {
		async function main() {
		  try {
				session.running = true;
				const $body = $('body');
				session.lastEncPaste = $('.text-read').val();
				const privKeyObj = await resolvePrivKey(session.privKey).keys[0];
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-read-passphrase').val());
				const pbKeyObj = await resolvePubKey(session.pubKey).keys;
				const msg = await resolveDecMsgPrep(session.lastEncPaste);
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj]
				}
				const plaintext = await resolveDecMsg(options);
				const $processedAside = $('.processed-aside');
				session.lastDec = plaintext;
				session.running = false;
				if ((session.lastDec.data).search('-----BEGIN PGP SIGNATURE-----') != -1) {
					verifySignature();
				} else {
					$body.removeClass('loading');
					session.lastDecStatus = 'Message decrypted.';
					$processedAside.text(session.lastDecStatus);
					$('.view-message-decrypted').removeAttr('disabled');
					session.running = false;
					viewDecMsg();
				}
			} catch (e) {
			  console.error(e);
			}
		}
		main();
	}
}
/*
}).catch(function(e) {
							session.running = false;
							lipAlert('Cannot decrypt message. Try a different private key.');
							$body.removeClass('loading');
						});
					}).catch(function(e) {
						session.running = false;
						lipAlert('The encrypted message cannot be parsed and/or is formatted incorrectly.');
						$body.removeClass('loading');
					});
				}).catch(function(e) {
					session.running = false;
					lipAlert('The public key cannot be read. It may be corrupted.');
					$body.removeClass('loading');
				});
			}).catch(function(e) {
			session.running = false;
			lipAlert('The private key passphrase is incorrect.');
			$body.removeClass('loading');
		});
	}).catch(function(e) {
		session.running = false;
		lipAlert('The private key cannot be read. It may be corrupted.');
		$body.removeClass('loading');
	});
				*/

//View decrypted message
const viewDecMsg = function() {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastDecStatus);
	$('.popup-filter').addClass('active');
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;filename=decrypted_message.txt,' + encodeURIComponent(session.lastDec.data)).attr('download', 'decrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.addClass('active').removeClass('mono steg').find('.window-title').find('span').text('Decrypted message');
}
