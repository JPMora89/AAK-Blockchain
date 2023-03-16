const crypto = require('crypto');

import axios from 'axios';

export function encryptString (data) { return new Promise(resolve => {
  // data: text string to be encrypted
  // publicKey: Crypto Object or PEM

axios.get('public.pem')
 .then((res)=>{
   const publicKey=res.data;
   var encrypted = crypto.publicEncrypt(
      {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
      },
      Buffer.from(data)
  )

  // Return: Base64 encoded encrypted text
  console.log("encrypted string: ",encrypted.toString("base64"));
  //return encrypted.toString("base64");
  return resolve(encrypted.toString("base64"));
 }).catch((err)=>{
   console.log('error found '+err);
   return resolve('error found');
 })
});
}


export function decryptString (data) {return new Promise(resolve => {
    // data: base64 encoded encrypted text
    // privateKey: Crypto Object or PEM
     axios.get('privateKey.pem')
    .then((res)=>{
      const privateKey=res.data;
      const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(data, 'base64')
    )

    // Return: plain text message
    return resolve(decrypted.toString());
    }).catch((err)=>{
      console.log('error found '+err);
      return resolve('error found');
    })
   });
}




//const encryptedString=encryptString("Mrinmoyee");
//console.log("encypted data: ", encryptedString);



//console.log("decrypted data: ", decryptString(encryptedString));

//module.exports = { encryptString,decryptString }
