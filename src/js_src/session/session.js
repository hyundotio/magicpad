let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

let session = {
	privKey: '',
	pubKey: '',
	generatedPubKey:'',
	generatedPrivKey:'',
	generatedRevKey:'',
	pubKeyFingerprint: '',
	privKeyFingerprint:'',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastDecStatus: '',
	lastEncStatus: '',
	lastEncPaste: '',
	lastEncFile:'',
	lastDecFile:'',
	lastDecFilename:'',
	lastEncFileType:'',
	lastEncFilename:'',
	keyToUploadFile:'',
	searchedKey:''
}
