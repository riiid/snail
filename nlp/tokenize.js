var TKT = require('twtkrjs');
var _   = require('underscore');
var FB = require('firebase');
var url = process.argv[2];

if (!url) {
  console.error('No firebase url. exit.');
  return process.exit();
}

var root = new FB(url);

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
