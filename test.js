var processor = require('asciidoctor.js')();

require('asciidoctor-template.js');
require('asciidoctor-bespoke');

var options = {safe: 'safe', backend: 'bespoke'};
processor.convertFile('./src/index.adoc', options);
