FROM fprieur/docker-casperjs
MAINTAINER kyung yeol kim <kykim@riiid.co>

LABEL version="0.0.1"

ADD *.js /src/snail/
ADD bower_components/firebase/firebase.js /src/snail/
ADD bower_components/moment/moment.js /src/snail/

ENTRYPOINT ["casperjs", "/src/snail/index.js"]
