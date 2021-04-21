//importar el archivo blockchain.js
const Blockchain = require('./blockchain')

const coin = new Blockchain();

//coin.createNewBlock(2389,'0SFGFFGDG48485DGGDFG','DGDGD54544545RRRFDF5');			//sin transacciones

//coin.createNewTransaction(100,'ALEX5345656165161DFDGD','JENDGGFHFGHD5546456DGF'); //primero se crea la transaccion y luego el bloque que es el de abajo que seria comoel minado, sino quedan en pendingTransactionsA
//coin.createNewBlock(8456,'DGDG46464FDFDFD65GDG','DGDGD54544545RRRFDF5');

// const previousBlockhash = 'GDGFD54555GDGDDGF'
// const currentBlockData = 
// 	[
// 		{
// 			amount: 10,
// 			sender: 'GFGD45455555',
// 			recipient: '454646GDFGDGFDG'
// 		},

// 		{
// 			amount: 300,
// 			sender: 'GJGJGH545666546',
// 			recipient: '454646GDFGDGFDG'
// 		},

// 		{
// 			amount: 200,
// 			sender: 'TE464636DGDG',
// 			recipient: '454646GDFGDGFDG'
// 		}
// 	];

// //const nonce = 100;
// const nonce = coin.proofOfWork(previousBlockhash, currentBlockData);


// //console.log(coin.proofOfWork(previousBlockhash, currentBlockData));

// console.log(coin.hashBlock(previousBlockhash, currentBlockData, nonce));




console.log(coin);				//todo
//console.log(coin.chainA[2]); //uno en particular