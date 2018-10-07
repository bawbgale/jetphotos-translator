'use strict';
const request = require('axios');
const cheerio = require('cheerio');

module.exports.getjetphoto = async (event, context, callback) => {
  const tailNum = event.tailNum;
  return request(`https://www.jetphotos.com/photo/keyword/${tailNum}`)
    .then(({data}) => {
      const $ = cheerio.load(data);
      const photoElements = $('img.result__photo');
      const photos = [];
      photoElements.each((i, el) => {
        photos.push($(el).attr('src'));
      });
      var html = `<html><img style="max-width: 500px;" src="${photos[0]}"/></html>`;
      context.succeed(html);
    })
    .catch((err) => {
      context.succeed(err.response);
    });
};
