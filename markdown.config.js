/* CLI markdown.config.js file */
let got = require('got');
let config = {
  user : (process.env.REPO)?process.env.REPO.split('/')[0]:'puntorigen'
};
String.prototype.replaceAll = function(strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};
let get_users = async function() {
  let thanks_to = []; //ordered list
  let stars = await got('https://api.github.com/users/'+config.user+'/followers').json();
  // get data for each user that gave a star
  for (let user of stars) {
    thanks_to.push({ name:user.login,
                     github:user.html_url,
                     avatar:user.avatar_url });
  }
  return thanks_to;
};

module.exports = {
    matchWord: 'UPDATE',
    transforms: {
      /* TAG METHODS */
      async LAST_UPDATE(content, options) {
        let date = require('date-and-time');
        let format = (options.format)?options.format:'DD-MM-YYYY HH:mm';
        let now_f = date.format(new Date(), format, true).replaceAll('-','--')+' (GMT 0)'; // gmt 0
        let encode = require('encodeurl');
        let encoded = encode(now_f);
        return `![last_update](https://img.shields.io/badge/last%20update-${encoded}-blue)`;
      },
      async TWITTER(content, options) {
        return `![twitter](https://img.shields.io/twitter/follow/${options.username}?style=social)`;
      },
      async QUOTES(content, options) {
        const quotes = require('./quotes.json');
        const random = Math.floor(Math.random() * quotes.length);
        const quote = quotes[random];
        const author = `- ${quote.author}`;
        return `<h3>"${quote.quote}"</h3>\n${'&nbsp'.repeat(Math.round(quote.quote.length/2))}<small><i>${author}</i></small>`;
      },
      async FOLLOWERS(content, options) {
        let followers = await get_users();
        if (followers.length==0) return '';
        let resp = `# Many thanks to my followers ..\n`;
        //resp += `<ol>\n`;
        for (let user of followers) {
          resp += `<a href="${user.github}" alt="${user.name}"><img src="${user.avatar}" width="30" height="30"/></a> `;
        }
        //resp += `</ol>\n`;
        return resp;
      }
    },
    callback: function () {
      console.log('markdown processing done')
    }
  }