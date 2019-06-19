module.exports = {
  build: function () {
    const fs = require('fs-extra');
    const path = require('path');
    let compressor = require('node-minify');
    let ncp = require('ncp');
    let jsdom = require('jsdom').JSDOM;
    let indexHtml = fs.readFileSync('./src/html_src/index/index.html',{encoding:'utf-8'});
    let dom = new jsdom(indexHtml);
    let window = dom.window;
    let $ = require('jquery')(window);


    function traverseDir(dir,type,target) {
      fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
          traverseDir(fullPath,type,target);
         } else {
           if(fullPath.search('.'+type)){
             let newPaths = fullPath.split(path.sep).join('/');
             target.push(newPaths);
           }
         }
      });
    }

    let popups = [];
    let tabWindows = [];
    let nav = [];
    let js = [];
    let jsContent = [];

    function createMainJs(){
      let eventsJs = [];
      let newJs = [];
      for (let i = 0; i < js.length; i++){
        if(js[i].search('/events/') > 0){
          eventsJs.push(js[i]);
        } else {
          newJs.push(js[i]);
        }
      }
      js = newJs.concat(eventsJs);
      js = js.concat(['src/js_src/universal_functions/universal_onload.js']);
      for (let i = 0; i < js.length; i++){
        if(js[i].search('session.js') > 0){
          js.splice(i,1);
        }
      }
      js.unshift('src/js_src/session/session.js');
      for (let i = 0; i < js.length; i++){
        jsContent.push(fs.readFileSync(js[i],{encoding:'utf-8'}));
      }
      jsContent = jsContent.join('\r\n');
      if(!fs.existsSync('./app/js')){
        fs.mkdirSync('./app/js');
        fs.writeFileSync('./app/js/main.js',jsContent,{encoding:'utf-8'});
      }
    }

    function prependHtml(arr,dest){
      arr.forEach(function(htmlSrc) {
        let readHtml = fs.readFileSync(htmlSrc,{encoding:'utf-8'});
        $(dest).append(readHtml);
      });
    }

    function prependJs(){
      let bodyHtml = $('html').html();
      bodyHtml = bodyHtml + '<script src="./js/main.js'+'"></script>';
      $('html').html(bodyHtml);
    }

    function buildPage(){
      fs.removeSync('./app');
      fs.mkdirSync('./app');
      ncp('./src/static/','./app/');
      ncp('./src/css','./app/css');
      traverseDir('./src/html_src/nav/','html',nav);
      traverseDir('./src/html_src/tab_windows/','html',tabWindows);
      traverseDir('./src/html_src/popup','html',popups);
      traverseDir('./src/js_src/','js',js);
      createMainJs();
      prependHtml(popups,'.popups');
      prependHtml(tabWindows,'.tab-windows');
      prependHtml(nav,'.main-nav');
      prependJs();
      let finalHtml = '<!DOCTYPE html>'+window.document.documentElement.outerHTML;
      fs.writeFileSync("./app/index.html", finalHtml, function(err) {
        if (err) {
            console.log(err);
        }
      });
    }
    buildPage();
  }
};
