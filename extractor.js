(function(w, d) {

  var ref;
  var LOOP_DELAY = 6000;
  var FETCH_ALL = true;

  function init() {
    var gen = new FirebaseTokenGenerator(w.firebase_secret);
    var token = gen.createToken({ uid:'0', snail:true });
    ref = new Firebase(w.firebase_root);
    ref.authWithCustomToken(token, function(err, auth) {
      if (err) console.log(err);
    });
  }

  function details() {
    function skip(item) {
      return item.querySelector('.content').hasAttribute('itemprop');
    }
    var meta = d.querySelectorAll('.meta-info');
    var result = {};
    var list = Array.prototype.filter.call(meta, skip).forEach(function(node) {
      content  = node.querySelector('.content').textContent.trim();
      itemprop = node.querySelector('.content').getAttribute('itemprop');
      result[itemprop] = content;
    });
    result.package = location.search.replace(/^.*?\=/, '');
    ref.child('details').update(result);
    return result;
  }

  function stat() {
    function getNumber(el) {
      return el.querySelector('.bar-number').textContent.trim();
    }

    var result = {};
    var stat   = {};
    var rate   = stat.rate = {};
    var now    = Date.now();
    stat['score'] = +d.querySelector('.score').textContent.trim();
    stat['date' ] = now

    var histogram = d.querySelector('.rating-histogram').children;
    rate['five']  = +getNumber(histogram[0]).replace(/\,/g, '')
    rate['four']  = +getNumber(histogram[1]).replace(/\,/g, '')
    rate['three'] = +getNumber(histogram[2]).replace(/\,/g, '')
    rate['two']   = +getNumber(histogram[3]).replace(/\,/g, '')
    rate['one']   = +getNumber(histogram[4]).replace(/\,/g, '')

    result[now] = stat;
    ref.child('stat').update(result);
    return result;
  }

  function featured() {
    function extractReview(review) {
      var result = {};
      var authorInfo = review.querySelector('.author-name > a');
      if (!authorInfo) {
        result.author    = review.querySelector('.author-name').textContent.trim();
      } else {
        result.author    = authorInfo.textContent.trim();
        result.storepage = authorInfo.href;
      }
      result.rating   = review.querySelector('.current-rating').style.width;
      result.title    = review.querySelector('.review-title').textContent.trim();
      result.content  = review.querySelector('.review-text').textContent.trim();
      result.reviewId = review.dataset.reviewid;
      return result;
    }

    var reviewEl = d.querySelectorAll('.featured-review');
    var result = Array.prototype.map.call(reviewEl, extractReview);
    ref.child('featured_reviews').update(toObj(result, 'reviewId'));
    return result;
  }

  function fetchReview() {
    function extractReview(review) {
      var result = {};
      var authorInfo = review.querySelector('.author-name > a');
      if (!authorInfo) {
        result.author    = review.querySelector('.author-name').textContent.trim();
      } else {
        result.author    = authorInfo.textContent.trim();
        result.storepage = authorInfo.href;
      }
      review.querySelector('.review-link').innerHTML = '';
      result.rating    = review.querySelector('.current-rating').style.width;
      result.date      = review.querySelector('.review-date').textContent;
      result.date_unix = moment(result.date, 'YYYY MM DD').unix() * 1000
      result.title     = review.querySelector('.review-title').textContent.trim();
      result.content   = review.querySelector('.review-body').textContent.trim();
      result.reviewId  = review.querySelector('.review-header').dataset.reviewid;
      result.type      = review.classList[0];
      return result;
    }
    function extractReply(reply) {
      var result = {};
      result.author    = reply.querySelector('.author-name').textContent.trim();
      result.date      = reply.querySelector('.review-date').textContent;
      result.date_unix = moment(result.date, 'YYYY MM DD').unix() * 1000
      result.content   = reply.textContent.trim();
      result.type      = reply.classList[0];
      return result;
    }
    // not process '.developer-reply'
    var reviews = d.querySelectorAll('.single-review');
    var result  = Array.prototype.map.call(reviews, function(el) {
      if (el.classList[0] === 'single-review')
        return extractReview(el);
      else
        return extractReply(el);
    });
    var container = d.querySelector('.details-section.reviews .expand-pages-container');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    return result;
  }

  function review(quantity) {
    var reviews = [];
    var fetched = [];
    var boundary = '';
    var nextBtn = d.querySelector('.reviews .expand-button.expand-next');

    function checkBoundary() {
      boundary = boundary.length > 5 ? '' : boundary.concat(fetched.length);
      return boundary !== '0000';
    }

    function checkQuantity() {
      return quantity > 0 ? reviews.length < quantity : FETCH_ALL;
    }

    function shouldFetchNext() {
      return checkQuantity() && checkBoundary();
    }

    function looper() {
      if (shouldFetchNext()) {
        nextBtn.click();
        fetched = fetchReview();
        reviews = reviews.concat(fetched);
        ref.child('reviews').update(toObj(reviews, 'reviewId'));
        w.callPhantom({ state: 'count', count: fetched.length });
        w.setTimeout(looper, LOOP_DELAY);
      } else {
        ref.child('reviews').update(toObj(reviews, 'reviewId'));
        w.callPhantom({ state: 'finish', count: reviews.length });
      }
    }
    fireClickEvent(d.querySelector('button[data-dropdown-value="0"]'));
    w.setTimeout(looper, LOOP_DELAY);
  }
  function toObj(list, key) {
    var obj = {};
    list.forEach(function(item) {
      obj[item[key]] = item;
    });
    return obj;
  }

  // from http://stackoverflow.com/a/2381862/588388
  function fireClickEvent(node) {
    var doc;
    if (node.ownerDocument) {
      doc = node.ownerDocument;
    } else if (node.nodeType == 9){
      doc = node;
    } else {
      throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

    if (node.dispatchEvent) {
      var event = doc.createEvent('MouseEvents');
      event.initEvent('click', true, true);

      event.synthetic = true;
      node.dispatchEvent(event, true);
    }
  };

  w['init']     = init;
  w['details']  = details;
  w['stat']     = stat;
  w['featured'] = featured;
  w['review']   = review;
  w['reviewAll']= function() {
    review(-1);
  }

})(window, document);
