/**
 * TODO
 *  - parse permission
 *
 * Attach Inspector
 *  - run with "--remote-debugger-port=9001 --remote-debugger-autorun=yes"
 *  - opne chrome and browse "http://localhost:9001"
 *
 * Use cookies
 *  - run with "--cookies-file=./cookies"
 */
var fs     = require('fs');
var util   = require('utils');
var child  = require('child_process');
var casper = require('casper').create({
  clientScripts: [
    '/src/snail/firebase.js',
    '/src/snail/moment.js',
    '/src/snail/extractor.js'
  ],
  pageSettings: {
    loadImages: false,
    loadPlugins: false
  },
  retryTimeout: 10
});

// handle cli options
var PACKAGE        = casper.cli.get('package')   || 'co.riiid.renote';
var INIT_FETCH_ALL = casper.cli.get('fetch-all') || false
var FIREBASE_ROOT  = casper.cli.get('fb-root')   || 'https://renote-info.firebaseio.com/playstore'

var BASE_URL = "https://play.google.com/store/apps/details?id=";
var URL      = BASE_URL.concat(PACKAGE);

var isCaptchaPage = function() {
  // TODO
  // http://stackoverflow.com/a/16710826/588388
  // if we meet captcha, save image & watch file for user input.
  if (this.exists('form[action="CaptchaRedirect"]')) {
    this.echo("We fucked... Attach debugger and type that captcha!!!", 'ERROR');
    this.exit(1);
  }
}

var login = function() {
  // TODO
}

var processDetailSection = function() {
  if (!this.exists('.details-section.metadata')) {
    this.echo("Can't find defails-section...", 'ERROR');
    return;
  }

  var details = this.evaluate(function() {
    return details();
  });

  this.echo('Processing detail section', 'INFO');
}

var processRate = function() {
  var stat = this.evaluate(function() {
    return stat();
  });

  this.echo('Processing rate', 'INFO');
}

var processFeatured = function() {
  var featured = this.evaluate(function() {
    return featured();
  });
  this.echo('Processing featured reviews', 'INFO');
}

var processReview = function() {
  if (INIT_FETCH_ALL) {
    this.evaluate(function() { reviewAll(); });
  } else {
    this.evaluate(function(quantity) {
      return review(quantity);
    }, 50);
  }
}
casper.start(URL, function() {
  this.echo('🐌 ...', 'INFO');
  this.echo('Target : ' + PACKAGE, 'INFO');
  this.page.onCallback = function(info) {
    if (info.state == 'count')
      casper.echo('Processing reviews : ' + info.count, 'INFO');
    else if (info.state == 'finish') {
      casper.echo(info.count + ' reviews', 'INFO');
      casper.echo('Finished', 'INFO');
      casper.exit();
      // post next process
    }
  }
});
casper.then(isCaptchaPage);
casper.then(login);
casper.then(function() {
  this.evaluate(function(fb) {
    window.firebase_root = fb;
    window.init();
  }, FIREBASE_ROOT);
})
casper.then(processDetailSection);
casper.then(processRate);
casper.then(processFeatured);
casper.then(processReview);
casper.on("page.error", function(msg, trace) {
  this.echo("Error: " + msg, "ERROR");
});
casper.run(function() {});
