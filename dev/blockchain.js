const sha256 = require('sha256')
const currentNodeUrl = process.argv[3];		//obtener el valor del url en el archivo package.json en la parte de node_x
const uuid = require('uuid/v1');


function Blockchain()					//constructor
{	
	this.chainA = [] 					//el blockchain sera almacenado
	this.pendingTransactionsA = []			//nuevas transacciones que son creadas antes de ser metidas en el blockchain

	this.currentNodeUrl = currentNodeUrl;	//saber el nodo en el que esta
	this.networkNodes = [];					//saber cuales son los otros nodos en la red

	this.createNewBlock(100,'0','0');	//bloque genesis
};

//en vez de constructor puede ser una clase, es mejor si no es javascript 
//class Blockchain
//{
//	constructor()
//	{
//		this.chain = [] 	
//		this.newTransactions = []	
//	}
// .......
//}

//funcion  para crear un bloque 
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash)
{
	//objeto
	const newBlock = 
	{
		index: this.chainA.length + 1,			//numero del bloque
		timestamp: Date.now(),
		transactions: this.pendingTransactionsA,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	}

	this.pendingTransactionsA = [];					//se  vacia para poder comenzar el nuevo bloque
	this.chainA.push(newBlock);

	return newBlock;
};


//funcion para retornar el ultimo bloque 
Blockchain.prototype.getLastBlock = function()
{
	return this.chainA[this.chainA.length - 1];
};


//funcion para crear transacciones
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient)
{
	const newTransactions = 
	{
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuid().split('-').join('') 
	};


	return newTransactions;

	//this.pendingTransactionsA.push(newTransactions);

	//return this.getLastBlock()['index'] + 1; 				//cual bloque sera el que tenga las nuevas transacciones
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj)
{
	this.pendingTransactionsA.push(transactionObj);

	return this.getLastBlock()['index'] + 1; 	
};


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce)		//toma el bloque completo y lo pasa a un string (hash)
{
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

	const hash = sha256(dataAsString);

	return	 hash;
};



Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData)
{
	// bitcoin.hasBlock(previousBlockHash, currentBlockData, nonce)
	// => repeatedly hash block until it finds correct hash => '0000FDDGDG44546565185FDGDGD'
	// => uses current block data for the hash, but also the previousBlockHash
	// => comtinuosly changes nonce value until it finds the correct hash
	// => returns to us the nonce value that creates the correct hash

	let nonce = 0; 
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

	while (hash.substring(0,4) !== '0000')
	{
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		//console.log(hash);
	}

	return nonce;

};

//hay que exṕortar el constructor para poder acceder a el desde otro archivo como en el caso de test.js
module.exports = Blockchain;