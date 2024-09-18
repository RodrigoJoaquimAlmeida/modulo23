import http from 'node:http';
import { stock } from './stock.js';
import { URL } from 'node:url';
import jsonBody from 'body/json.js';

const server = http.createServer();

server.addListener('request', (request, response) => {
	const urlObject = new URL(`http://${request.headers.host}${request.url}`);
	console.log(urlObject);
	if (urlObject.pathname === '/') {
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(stock));
		response.end();
	}
	if (
		urlObject.pathname === '/get-unavailable-products' &&
		request.method === 'POST'
	) {
		response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.write('No endpoint allowed for POST request');
		response.end();
		return;
	}
	if (
		urlObject.pathname === '/get-unavailable-products' &&
		request.method === 'GET'
	) {
		const unavailableProducts = stock.filter(
			(products) => products.amountLeft === 0
		);
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(unavailableProducts));
		response.end();
	}
	if (urlObject.pathname === '/get-by-id') {
		const idParams = urlObject.searchParams.get('id');
		if (!idParams || isNaN(idParams)) {
			response.writeHead(400, { 'Content-Type': 'text/plain' });
			response.write('Bad ID Params Information, try again!');
			response.end();
			return;
		}
		const selectObject = stock.find(
			(product) => product.id === Number(idParams)
		);
		if (!selectObject) {
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.write('ID Number not found, try again');
			response.end();
			return;
		}
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(selectObject));
		response.end();
		return;
	}
	if (urlObject.pathname === '/create' && request.method === 'POST') {
		jsonBody(request, response, (error, body) => {
			if (error) {
				response.writeHead(400, { Content_type: 'text/plain' });
				response.write('Request process failed ');
				response.write(error);
				response.end();
				return;
			}
			const { productName, amountLeft } = body;
			const newProduct = {
				id: stock.length,
				productName,
				amountLeft,
			};
			stock.push(newProduct);
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify(newProduct));
			response.end();
			return;
		});
	}
});

server.listen(8000);
