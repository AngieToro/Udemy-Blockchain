const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1'); 	//crear un unico random string para poner la direccion del nodo
const port = process.argv[2];		//obtener el valor del puerto en el archivo package.json en la parte de start
const requestPromise = require('request-promise');
const nodeAddress = uuid().split('-').join('');
const coin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));				//si los datos vienen en json, convierte el valor accesible
 

 //obtiene el blockchain completo
app.get('/blockchain', function (req, res) 
{
	res.send(coin);
});


//agrega una transaccion al blockchain
app.post('/transaction', function(req, res)
{
	//console.log(req.body);
	//res.send(`The amount of the transaction is ${req.body.amount} coin`);

	//const blockIndex = coin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	//res.json({note:`Transaction will be added in block ${blockIndex}`});

	const newTransaction = req.body;
	const blockIndex = coin.addTransactionToPendingTransactions(newTransaction);
	res.json(
		{
			note: `Transacction will be added in block ${blockIndex}`
		}
	);
});

// transmite la transaccion
app.post('/transaction/broadcast', function(req, res) 
{
	const newTransaction = coin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

	coin.addTransactionToPendingTransactions(newTransaction);
	
	const promises = [];

	coin.networkNodes.forEach(networkNodeUrl => 
	{
		const requestOptions = 
		{
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		promises.push(requestPromise(requestOptions));
	});

	Promise.all(promises)
	.then(data => 
	{
		res.json(
			{ 
				note: 'Transaction created and broadcast successfully'
			}
		);
	});
});

//mina el bloque 
app.get('/mine', function(req, res)
{
	const lastBlock = coin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];


	const currentBlockData = 
	{
		transactions: coin.pendingTransactions,
		index: lastBlock['index'] + 1
	};

	const nonce = coin.proofOfWork(previousBlockHash, currentBlockData);

	const blockHash = coin.hashBlock(previousBlockHash, currentBlockData, nonce);


	//coin.createNewTransaction(12.5,"00",nodeAddress); 	//mining reward

	const newBlock = coin.createNewBlock(nonce, previousBlockHash, blockHash);
	

	const promises = [];


	coin.networkNodes.forEach(networkNodeUrl =>
	{
		const requestOptions = 
		{
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		promises.push(requestPromise(requestOptions));
	});

	Promise.all(promises)
	.then(data =>
	{
		const requestOptions = 
		{
			uri: coin.currentNodeUrl + 'transaction/broadcast',
			method: 'POST',
			body: 
				{
					amont: 12.5,
					sender: "00",
					recipient: nodeAddress
				},
			json: true
		};

		return requestPromise(requestOptions);
	})
	.then(data => 
	{
		res.json(
		{
			note: "New block mined and broadcast successfully",
			block: newBlock
		});
	});
	
});

//recibe un nuevo bloque
app.post('/receive-new-block', function(req, res)
{
	const newBlock = req.body.newBlock;
	const lastBlock = coin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;		//indica si el blockue es legitimo
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex)
	{
		coin.chainA.push(newBlock);
		coin.pendingTransactions = [];
		res.json(
		{
			note: 'New block received and accepted',
			newBlock: newBlock
		});
	}
	else
	{
		res.json(
		{
			note: 'New block rejected',
			newBlock: newBlock
		});
	}
});

//register a node in his server and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res)
{
	//tomar el nodo actual y registrarlo con la red de nodos actuak 
	const newNodeUrl = req.body.newNodeUrl;

	//si el newNodeUrl no esta presente en la red, entonces agregarla 
	if (coin.networkNodes.indexOf(newNodeUrl) == -1)
	{
		coin.networkNodes.push(newNodeUrl);
	}

	const regNodesPromises = [];

	//transmitir el nodo a todos los demas nodos que estan en la red
	coin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(requestPromise(requestOptions));		//asincronos
	});

	//va a correr cada uno de los request de la lista, cuando se termine se puede manejar lo que este en data
	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [...coin.networkNodes, coin.currentNodeUrl]},
			json: true 
		};

		return requestPromise(bulkRegisterOptions);
	})

	.then(data => {
		res.json(
			{ 
				note: 'New node registered with network successfully'
			}
		);
	});
});


//register a node with the network
app.post('/register-node', function(req, res)
{
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = coin.networkNodes.indexOf(newNodeUrl) == -1;	//si newNodeUrl no existe en networkNodes es true
	const notCurrentNode = coin.currentNodeUrl !== newNodeUrl;	


	if (nodeNotAlreadyPresent && notCurrentNode)
	{
		coin.networkNodes.push(newNodeUrl);
	}
	
	res.json(
		{
			note: 'New node registered successfully'
		}
	);
});



//register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res)
{
	const allNetworkNodes = req.body.allNetworkNodes;
	
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = coin.networkNodes.indexOf(networkNodeUrl) == -1;		//si el nodo ya existe
		const notCurrentNode = coin.currentNodeUrl !== networkNodeUrl;	//si no es el mismo nodo que el actual

		if (nodeNotAlreadyPresent && notCurrentNode)
		{
			coin.networkNodes.push(networkNodeUrl);
		}

	});

	res.json(
		{ 
			note: 'Bulk registration successful'
		}
	);
});

// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});



//app.listen(3000, function()
app.listen(port, function()
{
	console.log(`Listening on port ${port}`);
});