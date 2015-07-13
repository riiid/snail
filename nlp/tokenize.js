var TKT = require('twtkrjs');
var _   = require('underscore');
var FB = require('firebase');
var FBG = require('firebase-token-generator');

var secret = process.env['FIREBASE_SECRET'];
var url    = process.env['FIREBASE_URL'];

if (!url || !secret) {
  console.error('No FIREBASE_URL or FIREBASE_SECRET on ENV. exit.');
  return process.exit();
}

var root = new FB(url);
var gen  = new FBG(secret);

var token = gen.createToken({ uid:'0', snail:true });

root.authWithCustomToken(token, function(err, aut) {
  if (err) return console.error(err);
  run();
});

var run = function() {
  var processor = new TKT({
    stemmer: false,
    normalizer: false,
    spamfilter: false
  });

  var reviewsRef = root.child('reviews');
  var tokensRef  = root.child('tokens');

  reviewsRef.once('value', function(snap) {
    var tokens = {};
    var count  = 0;
    var values = _.values(snap.val());
    values.map(function(value) {
      processor.tokenize(value.content, function(err, result) {
        if (err) return console.error(err);
        count +=1;
        console.log('tokenized ' + count);
        result = result.map(function(item) {
          item.parent = value.reviewId;
          return item;
        });
        tokens[value.reviewId] = result;
        if (count == values.length) {
          tokensRef.update(tokens, function() {
            console.log('Finished');
            process.exit();
          });
        }
      });
    });
  });
}
