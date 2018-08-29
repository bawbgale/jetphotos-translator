'use strict';
const request = require('axios');
const cheerio = require('cheerio');

module.exports.getjetphoto = async (event, context, callback) => {
  return request('https://www.jetphotos.com/photo/keyword/n3476g')
    .then(({data}) => {
      // const $ = cheerio.load(data);
      // const photoElements = $('img.result__photo');
      // const photos = [];
      // photoElements.each((i, el) => {
      //   photos.push($(el).attr('src'));
      // });
      var html = '<html><img style="max-width: 500px;" src="//cdn.jetphotos.com/full/5/83475_1495955378.jpg"/></html>';
      context.succeed(html);
    })
    .catch((err) => {
      callback(null, {err});
    });
};
