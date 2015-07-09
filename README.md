# :snail:

Extract application info(user review, rate etc) from [Google play](https://play.google.com/store/apps) on demand. Extracted info will be stored on [Firebase](https://www.firebase.com).


## Build Image

```
$ bower install
$ docker build -t chitacan/snail .
```

## Run

> This project is not registered on Docker Hub yet. You should build an image on your machine before run following command.

```
$ docker run -it --rm chitacan/snail --package=<YOUR_APP_PACKAGE> --fetch-all --fb-root='https://<YOUR_FIREBASE_APP>.firebaseio.com'
```

## Analysis

see [nlp/README.md](https://github.com/riiid/snail/blob/master/nlp/README.md)

## Visualize

[Example 1](http://codepen.io/chitacan/full/XbZgEx/) : Explore every user review by date.
[Example 2](http://codepen.io/chitacan/full/oXqKoX/) : Explore most mentioned noun in user review.
