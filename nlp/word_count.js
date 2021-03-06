var _   = require('underscore');
var FB = require('firebase');
var url = process.argv[2];

if (!url) {
  console.error('No firebase url. exit.');
  return process.exit();
}

var root = new FB(url);
var tokensRef = root.child('tokens');

tokensRef.once('value', function(snap) {
  var tokens = [];
  var values = _.values(snap.val());
  _.map(values, function(value) {
    var t = _.values(value);
    tokens = tokens.concat(t);
  });
  noun(tokens);
});

function noun(tokens) {
  result = _.chain(tokens)
    .filter(function(item) { return item.pos === 'Noun' })
    .countBy('text')
    .pairs()
    .sortBy(1).reverse()
    .object()
    .value()

  console.log(result);
}
