const errorDict = [
  {
    input: 'privkey',
    output: 'The private key cannot be read. It may be corrupted.'
  },
  {
    input: 'pubkey',
    output: 'The public key cannot be read. It may be corrupted.'
  },
  {
    input: 'decpriv',
    output: 'The private key passphrase is incorrect.'
  },
  {
    input: 'signfail',
    output: 'Cannot sign message. Try again with a different message and/or keys.'
  },
  {
    input: 'parsemsg',
    output: 'The encrypted message cannot be read. It may be corrupted.'
  },
  {
    input: 'parseattach',
    output: 'The encrypted attachment cannot be read. It may be corrupted.'
  },
  {
    input: 'genkey',
    output: 'Keys could not be generated. Try again.'
  },
  {
    input: 'encmsg',
    output: 'Cannot encrypt message. Try a different private key.'
  },
  {
    input: 'stegkeyread',
    output: 'The imported image does not contain a valid key.'
  },
  {
    input: 'stegkey',
    output: 'The imported file is not a valid image key.'
  },
  {
    input: 'stegkeygen',
    output: 'Failed to create image keys.'
  },
  {
    input: 'stegnomsg',
    output: 'The imported steganograph does not contain a message.'
  },
  {
    input: 'stegmsggeneral',
    outout: 'Failed to process imported steganograph.'
  },
  {
    input: 'steglen',
    output:'Selected steganograph host cannot store the encrypted message. Try a larger image.'
  },
  {
    input: 'parsesignmsg',
    output: 'The signature cannot be read. It maybe corrupted.'
  },
  {
    input: 'invalidsign',
    output: 'The signature is corrupted. Proceed with caution.'
  },
  {
    input: 'decmsg',
    output: 'Cannot decrypt message. Try a different private key.'
  },
  {
    input: 'upload',
    output: 'The public key could not be uploaded. Try again.'
  },
  {
    input: 'uploadcomplete',
    output: 'The fingerprint could not be generated from the uploaded key. Proceed with caution.'
  },
  {
    input: 'searchconnection',
    output:'Could not connect to key server. Try again.'
  },
  {
    input: 'searchresultkey',
    output: 'A key was retrieved but was unabled to read fingerprint. Use another key or proceed with caution.'
  },
  {
    input: 'searchgeneral',
    output: 'Failed to search. Try again with a different server and/or key.'
  },
  {
    input: 'encattach',
    output: 'Cannot encrypt attachment. Try testing a different file and/or using different keys.'
  },
  {
    input: 'decattach',
    output: 'Cannot decrypt attachment. Try a different private key.'
  },
  {
    input: 'file',
    output: 'Failed to load selected file.'
  },
  {
    input: 'keyimportfail',
    output: 'Failed to import key. Try another file.'
  }
]

const opgpErrorHandler = function(opgp,type){
  if(opgp){
    throw (errorFinder(type))
	} else {
		return false
	}
}

const errorFinder = function(error){
  for(i = 0; i < errorDict.length; i++){
    if((errorDict[i].input).search(error) > -1){
      return errorDict[i].output
    }
  }
}
