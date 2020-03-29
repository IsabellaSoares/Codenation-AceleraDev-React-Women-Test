const request = require('request');
const fs = require('fs');
const file = 'answer.json';
const token = '9597f167e1a0b01922cc5e827f0ec88d2e511012';

// function returns a Promise
async function getPromise() {
	return new Promise((resolve, reject) => {

		request('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=' + token,
			function (error, response, body) {
				fs.writeFileSync(file, body);
				resolve('Request completed!');
			}
		);
	});
}

// anonymous async function to execute some code synchronously after http request
(async function () {
	// wait to http request to finish
	await getPromise();
	
	// below code will be executed after http request is finished
	/* READ FILE AND INITIALIZE VARIABLES */
	let rawdata = fs.readFileSync(file);
	let result = JSON.parse(rawdata);

	const count = result.numero_casas;
	const cyphered_text = result.cifrado;
	let decyphered_text = '';

	/* DECYPHER OPERATION */
	let i = 0;
	let cast = 0;

	for (i = 0; i < cyphered_text.length; i++) {
		if (cyphered_text[i].match(/[a-z]/i)) {
			
			cast = cyphered_text[i].charCodeAt(0) - count;

			if (cast < 97) {
				cast = 97 - cast;
				cast = 123 - cast;
			}

			decyphered_text += String.fromCharCode(cast);
		} else {
			decyphered_text += cyphered_text[i];
		}
	}

	result.decifrado = decyphered_text;

	/* CRIPTO sha1 OPERATION */
	const crypto = require('crypto');
	const sha1 = crypto.createHash('sha1');

	result.resumo_criptografico = sha1.update(decyphered_text).digest('hex');

	/* OVERRIDE JSON FILE */
	fs.unlinkSync(file);
	fs.writeFileSync(file, JSON.stringify(result));

	request.post({
		url: 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=' + token,
		formData: {
			answer: fs.createReadStream(file)
		},
	}, function(error, response, body) {
		console.log(body);
	});
})();