module.exports = {
  build: function () {
    const fs = require('fs-extra');
    const path = require('path');
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
           if(type != undefined){
             if(fullPath.search('.'+type) > -1){
               let newPaths = fullPath.split(path.sep).join('/');
               target.push(newPaths);
             }
           } else {
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

    function removeArrItem(item,arr){
      for (let i = 0; i < arr.length; i++){
        if(arr[i].search(item) > 0){
          arr.splice(i,1);
        }
      }
      return arr
    }
    function createMainJs(){
      fs.mkdirSync('./app/js');
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
      js = removeArrItem('session.js',js);
      js.unshift('src/js_src/session/session.js');
      for (let i = 0; i < js.length; i++){
        jsContent.push(fs.readFileSync(js[i],{encoding:'utf-8'}));
      }
      jsContent = jsContent.join('\r\n');
      fs.writeFileSync('./app/js/main.js',jsContent,{encoding:'utf-8'});
    }

    function prependHtml(arr,dest){
      arr.forEach(function(htmlSrc) {
        let readHtml = fs.readFileSync(htmlSrc,{encoding:'utf-8'});
        $(dest).append(readHtml);
      });
    }

    function prependJs(){
      let bodyHtml = $('html').html();
      bodyHtml = bodyHtml + '<script src="./js/main.js"></script>';
      $('html').html(bodyHtml);
    }

    function buildpwaJs(){
      let appFiles = [];
      traverseDir('./app',undefined,appFiles);
      let readJs = fs.readFileSync('./src/pwa_src/mpsw.js',{encoding:'utf-8'});
      let readPackage = fs.readFileSync('./package.json');
      let pkgJson = JSON.parse(readPackage);
      let pkgV = pkgJson.version.replace('-','.').split('.');
      let pkgVNum = 0;
      for (let i = 0; i < pkgV.length; i++){
        pkgVNum = pkgVNum + parseInt(pkgV[i] * (10 ** i));
      }
      let pwaSrcV = 'let cacheName = "mp'+pkgVNum+'";\n\n';
      for (let i = 0; i < appFiles.length; i++){
        if(appFiles[i].split('app/').length > 1){
          appFiles[i] = appFiles[i].substr(4);
        }
      }
      let pwaSrcC = 'let contentToCache = ["'+appFiles.join('","')+'"];\n\n';
      let jsContent = pwaSrcV + pwaSrcC + readJs;
      fs.writeFileSync('./app/pwa.js',jsContent,{encoding:'utf-8'});
      //console.log(readJs);
    }

    function buildPage(){
      fs.removeSync('./app');
      fs.mkdirSync('./app');
      ncp('./src/static/','./app/',function(){
        ncp('./src/css','./app/css',function(){
          traverseDir('./src/html_src/nav/','html',nav);
          traverseDir('./src/html_src/tab_windows/','html',tabWindows);
          traverseDir('./src/html_src/popup','html',popups);
          traverseDir('./src/js_src/','js',js);
          createMainJs();
          prependHtml(popups,'.popups');
          prependHtml(tabWindows,'.tab-windows');
          prependHtml(nav,'.main-nav');
          prependJs();
          let htmlStart = fs.readFileSync('./src/html_src/index/index_start.html',{encoding:'utf-8'});
          let htmlEnd = fs.readFileSync('./src/html_src/index/index_end.html',{encoding:'utf-8'});
          let finalHtml = htmlStart + window.document.documentElement.outerHTML.replace('<html>','').replace('</html>','') + htmlEnd;
          fs.writeFileSync("./app/index.html", finalHtml, function(err) {
            if (err) {
                console.log(err);
            }
          });
          buildpwaJs();
        });
      });
    }
    buildPage();


  }
};
