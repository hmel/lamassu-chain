'use strict';

var chain = require('chain-node');

exports.NAME = 'Chain.com';
exports.SUPPORTED_MODULES = ['info'];


function countAll(array, address) {
  return array.reduce(function(prev, current) {
    if (current.addresses.indexOf(address) !== -1)
      prev += current.value;

    return prev;
  }, 0);
}

// Iterates all in/outputs and counts how given tx changed address's balance
function getAmountForAddress(address, tx) {
  return countAll(tx.outputs, address) - countAll(tx.inputs, address);
}

function processTx(tx, address) {
  return {
    txHash: tx.hash,
    tsReceived: Date.parse(tx.chain_received_at),
    confirmations: tx.confirmations,
    amount: getAmountForAddress(address, tx),
    fees: tx.fees,

    // NOTE: optional, shold be set when plugin implements 0-conf
    authorized: false,
    confidence: 0.0
  };
}


exports.config = function config(localConfig) {
  if (localConfig) {
    chain.apiKeyId = localConfig.keyId;
    chain.apiKeySecret = localConfig.keySecret;
  }
};

exports.getAddressLastTx = function getAddressLastTx(address, callback) {
  chain.getAddressTransactions(address, {limit: 1}, function(err, resp) {
    if (err)
      return callback(err);

    if (!resp.length)
      return callback(); // no error & no tx

    callback(null, processTx(resp[0], address));
  });
};

exports.getTx = function getTx(txHash, address, callback) {
  chain.getTransaction(txHash, function(err, resp) {
    if (err)
      return callback(err);

    callback(null, processTx(resp, address));
  });
};