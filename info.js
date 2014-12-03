'use strict';

// WIP: This does a very superficial test to see if funds have arrived.
// Will be continiously improved.

var _ = require('lodash');
var chain = require('chain-node');

exports.NAME = 'Chain.com';
exports.SUPPORTED_MODULES = ['info'];

exports.config = function config(_config) {
  chain.apiKeyId = _config.apiKeyId;
  chain.apiKeySecret = _config.apiKeySecret;
};

exports.checkAddress = function checkAddress(address, amount, cb) {
  chain.getAddressTransactions(address, function(err, resp) {
    if (err) return cb(err);
    if (resp.length === 0) return cb(null, 'notSeen', 0, null);
    var tx = resp[0];
    var output = _.find(tx.outputs, {addresses: [address]});
    if (!output) return cb(null, 'notSeen', 0, null);
    var txAmount = output.value;
    var status = txAmount < amount ? 'insufficientFunds' : 'authorized';
    cb(null, status, amount, tx.hash);
  });
};
