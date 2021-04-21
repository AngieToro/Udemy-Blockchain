# Udemy - Course Blockchain 

## Project

### This repository is about:
1. Create a Blockchain


### Install
`npm install`

### Execute
Open 5 terminals for each Node 
* `npm run node_1`
* `npm run node_2`
* `npm run node_3`
* `npm run node_4`
* `npm run node_5`


#### Open Postman 
1. Post: 

* Register a node

URL: http://localhost:3002/register-node

Body: 
{
    "newNodeUrl": "http://localhost:3002"
}


* Register multiple nodes at once

URL: http://localhost:3001/register-nodes-bulk

Body:
{
    "allNetworkNodes": 
    [
        "http://localhost:3002",
        "http://localhost:3003"
    ]
}


* Register a node in his server and broadcast it the network - Connect all nodes to each other

URL: http://localhost:3001/register-and-broadcast-node

Body:
{
    "newNodeUrl": "http://localhost:3002"
}


* Transaction

URL: http://localhost:3001/transaction

Body: (example)
{
    "amount": 10,
    "sender": "5353453465GDGGG",
    "recipient": "6646YGHFHGHRG"
}


* Transaction broadcast

URL: http://localhost:3001/transaction/broadcast

Body: 
{
    "amount": 100,
    "sender": "64564GGFGDFGG",
    "recipient": "FGHHFDX5346346ET"
}



2. Get: 

* Get Blockchain 

URL: http://localhost:port/blockchain

Note: *port* is the Port: 3001 ... 3005


* Consensus

URL: http://localhost:3003/mine
