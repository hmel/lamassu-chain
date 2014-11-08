'use strict';

var chain = require('chain-node');

exports.NAME = 'Chain.com';
exports.SUPPORTED_MODULES = ['info'];

var MINIMUM_PROPAGATION = .7;

exports.config = function config(localConfig) {
  if (localConfig) {
    chain.apiKeyId = localConfig.keyId;
    chain.apiKeySecret = localConfig.keySecret;
  }
};

exports.getLastTx = function getLastTx(address, callback) {
  chain.getAddressTransactions(address, {limit: 1}, function(err, resp) {
    if (err)
      return callback(err);

    if (!resp.length)
      return callback(); // no error & no data

    var tx = resp[0];
    callback(null, {
      txHash: tx.hash,
      tsReceived: Date.parse(tx.chain_received_at),
      confirmations: tx.confirmations,
      amount: tx.amount,
      fees: tx.fees
    });
  });
};

// NOTE: this method is not aware of the expegted tx amount
exports.getTxStatus = function getTxStatus(txHash, callback) {
  chain.getTransaction(txHash, function(err, resp) {
    if (err)
      return callback(err);

    var status = null;
    if (resp.confirmations > 0) status = 'confirmed';
    else if (resp.propagation_level > MINIMUM_PROPAGATION) status = 'authorized';

    if (!status)
      return callback();

    callback(null, {
      status: status + 'Deposit',
      confirmations: resp.confirmations,
      confidence: resp.propagation_level
    });
  });
};