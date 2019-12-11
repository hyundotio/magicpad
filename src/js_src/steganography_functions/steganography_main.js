//convert steganograph to text
const readSteg = function(img){
	return steg.decode(img);
}

//create  steganograph key
const createStegKey = function(input,type,str){
	async function main() {
		try {
			const keyInit = await openpgp.key.readArmored(str);
			const loadedImg = await resolveImgCORS(input);
			const imgCanvas = document.createElement("canvas");
			let imgContext = imgCanvas.getContext("2d");
			imgContext.canvas.width = loadedImg.width;
			imgContext.canvas.height = loadedImg.height;
			imgContext.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height);
			imgContext.font = '11px IBM Plex Mono';
			imgContext.fillStyle = '#0062ff';
			let imgStr;
			if(keyInit.keys[0].users[0].userId.email){
				imgStr = (keyInit.keys[0].users[0].userId.email).trunc(35);
			} else {
				imgStr = 'Converted key'
			}
			imgContext.fillText(imgStr, 14, 55);
			let newImg = await resolveImg(imgCanvas.toDataURL("image/png"));
			$('body').append($(newImg));
			if(type == 'public'){
				createSteg(newImg,$('.key-public-img-download'),str);
			} else if (type == 'private'){
				createSteg(newImg,$('.key-private-img-download'),str);
			} else if (type =='search'){
				createSteg(newImg,$('.searched-key-download-steg'),str);
			} else if (type =='convert'){
				createSteg(newImg,$('.save-converted'),str);
			}else {
				//createSteg(newImg,$('.key-revoke-steg-download-link'),str);
			}
			$(imgCanvas).remove();
			$(loadedImg).remove();
			$(newImg).remove();
		} catch(e) {
			lipAlert(e);
		}
	}
	main();
}

//createSteg($('steghost')[0],$('processed-img-download-link'),encryptedMessageStr);
const createSteg = function(img,$dest,str){
	revokeBlob($dest.attr('href'));
	$dest.attr('href',dataURItoBlobURL(steg.encode(str, img)));
}
