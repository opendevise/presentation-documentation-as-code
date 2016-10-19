var bespoke = require('bespoke'),
  bullets = require('bespoke-bullets'),
  classes = require('bespoke-classes'),
  extern = require('bespoke-extern'),
  hash = require('bespoke-hash'),
  multimedia = require('bespoke-multimedia'),
  nav = require('bespoke-nav'),
  onstage = require('bespoke-onstage'),
  overview = require('bespoke-overview'),
  scale = require('bespoke-scale');

bespoke.from({ parent: 'article.deck', slides: 'section' }, [
  classes(),
  scale(),
  nav(),
  overview(),
  bullets('.build, .build-items > *:not(.build-items)'),
  onstage(),
  hash(),
  multimedia(),
  extern(bespoke)
]);
