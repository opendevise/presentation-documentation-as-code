var bespoke = require('bespoke'),
  classes = require('bespoke-classes'),
  extern = require('bespoke-extern'),
  hash = require('bespoke-hash'),
  multimedia = require('bespoke-multimedia'),
  nav = require('bespoke-nav'),
  onstage = require('bespoke-onstage'),
  overview = require('bespoke-overview'),
  scale = require('bespoke-scale');

function bullets(options) {
  return function(deck) {
    var activeSlideIndex,
      activeBulletIndex,

      bullets = deck.slides.map(function(slide) {
        return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
      }),

      next = function() {
        var nextSlideIndex = activeSlideIndex + 1;

        if (activeSlideHasBulletByOffset(1)) {
          activateBullet(activeSlideIndex, activeBulletIndex + 1);
          return false;
        } else if (bullets[nextSlideIndex]) {
          activateBullet(nextSlideIndex, 0);
        }
      },

      prev = function() {
        var prevSlideIndex = activeSlideIndex - 1;

        if (activeSlideHasBulletByOffset(-1)) {
          activateBullet(activeSlideIndex, activeBulletIndex - 1);
          return false;
        } else if (bullets[prevSlideIndex]) {
          activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
        }
      },

      activateBullet = function(slideIndex, bulletIndex) {
        activeSlideIndex = slideIndex;
        activeBulletIndex = bulletIndex;

        bullets.forEach(function(slide, s) {
          slide.forEach(function(bullet, b) {
            bullet.classList.add('bespoke-bullet');

            if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
              bullet.classList.add('bespoke-bullet-active');
              bullet.classList.remove('bespoke-bullet-inactive');
            } else {
              bullet.classList.add('bespoke-bullet-inactive');
              bullet.classList.remove('bespoke-bullet-active');
            }

            if (s === slideIndex && b === bulletIndex) {
              bullet.classList.add('bespoke-bullet-current');
            } else {
              bullet.classList.remove('bespoke-bullet-current');
            }
          });
        });
      },

      activeSlideHasBulletByOffset = function(offset) {
        return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
      };

    deck.on('next', next);
    deck.on('prev', prev);

    deck.on('slide', function(e) {
      activateBullet(e.index, 0);
    });

    activateBullet(0, 0);

    // patch
    deck.activateBullet = activateBullet
    deck.slides.forEach((slide, slideIdx) => {
      slide.bullets = bullets[slideIdx]
    })
  };
}

bespoke.from({ parent: 'article.deck', slides: 'section' }, [
  classes(),
  scale(),
  nav(),
  overview(),
  bullets('.build, .build-items > *:not(.build-items)'),
  hash(),
  multimedia(),
  function (deck) {

    const metas = {}
    Array.from(document.querySelectorAll('head meta')).forEach((meta) => {
        metas[meta.getAttribute('name')] = meta.getAttribute('content')
    })

    const steps = deck.slides.map((slide, slideIdx) => {

      const notes = [].slice.call(slide.querySelectorAll('aside[role="note"] p, aside[role="note"] li'))
        .map((note) => note.textContent)
        .join('\n')

      if (slide.bullets.length > 0) {
        return slide.bullets.map((b, bulletIdx) => {
          return {
            cursor: String(slideIdx) + '.' + String(bulletIdx),
            states: [],
            notes,
          }
        })
      }

      return {
        cursor: String(slideIdx),
        states: [],
        notes,
      }
    })

    const details = {
      title: document.title || '',
      authors: metas.author || '',
      description: metas.description || '',
      vendor: 'bespoke.js',
      steps,
      ratios: ['16/9'],
      themes: ['default'],
    }

    window.addEventListener('message', ({ source, data: { command, commandArgs } }) => {

      switch (command) {

        case 'get-slide-deck-details':
          source.postMessage({ event: 'slide-deck-details', eventData: { details } }, '*')
          break;

        case 'go-to-step':
          const { cursor } = commandArgs
          const [slideIdx, subslideIdx] = cursor.split('.')
          deck.slide(Number(slideIdx))
          deck.activateBullet(Number(slideIdx), Number(subslideIdx))
          break;

        default:
          console.debug(`unknown protocol command ${command} with args`, commandArgs)
      }
    })
  }
]);
