module.exports = {
  build: function () {
    const fs = require('fs-extra');
    const path = require('path');
    let jsdom = require('jsdom').JSDOM;
    let indexHtml = fs.readFileSync('./html_src/index/index.html',{encoding:'utf-8'});
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

    function prependHtml(arr,dest){
      arr.forEach(function(htmlSrc) {
        let readHtml = fs.readFileSync(htmlSrc,{encoding:'utf-8'});
        $(dest).append(readHtml);
      });
    }

    function prependJs(arr){
      let bodyHtml = $('html').html();
      arr.forEach(function(jsSrc){
        jsSrc = jsSrc.split('/');
        jsSrc.shift();
        bodyHtml = bodyHtml + '<script src="./'+jsSrc.join('/')+'"></script>';
        $('html').html(bodyHtml);
      });
    }

    function buildPage(){
      traverseDir('./html_src/nav/','html',nav);
      traverseDir('./html_src/tab_windows/','html',tabWindows);
      traverseDir('./html_src/popup','html',popups);
      traverseDir('./app/js/','js',js);
      prependHtml(popups,'.popups');
      prependHtml(tabWindows,'.tab-windows');
      prependHtml(nav,'.main-nav');
      prependJs(js);
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
