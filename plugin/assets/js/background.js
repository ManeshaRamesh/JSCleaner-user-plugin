import * as Database from "./Database2.js";
import * as Constants from "./constants.js";

var timedout = false;
window.jscleaner = {};
window.jscleaner.tabs = [];

window.jscleaner.labels = [
  "Advertising",
  "Analytics",
  "Social",
  "Video",
  "Utility",
  "Hosting",
  "Marketing",
  "Customer Success",
  "Content",
  "CDN",
  "Tag Manager",
  "Others",
];

chrome.storage.local.get(["default"], function (result) {
  var obj;
  if (!result.hasOwnProperty("default")) {
    //if not in google storage

    // console.log("does not exist", result.key)
    var settingDefault = [];
    window.jscleaner.labels.forEach((element) => {
      obj = {
        label: element,
        status: 1,
      };
      settingDefault.push(obj); // enables all scripts - does not block anything unless set otherwise
    });

    console.log("default setting", settingDefault);
    chrome.storage.local.set({ default: settingDefault }, function () {}); //store default settings in chrome storage
    // Constants.setdefaultLabels(settingDefault);
  } else {
    console.log("exists", result);
    // Constants.setdefaultLabels(result['default']);
  }
});

Database.createDatabase().then((result) => {
  //open settings.html

  // // will run this when installed
  // browser.runtime.onInstalled.addListener(function (object) {
  //     browser.tabs.create({url: "../html/settings.html"}, function (tab) {
  //     });
  // });

  // onberforerequest

  async function cancel(requestDetails) {
    // return new Promise( (reject, resolve) => {
      // if it is a script
      if (requestDetails.type === "script") {
        console.log(requestDetails.url);
        var ifLabelled = await Database.ifExists('scripts', "name", requestDetails.url);
        console.log("If labelled: ", ifLabelled)
        if (ifLabelled){
            console.log("Item: ", ifLabelled)
            return {cancel: true}
        }
      }
      return

  }
  browser.webRequest.onBeforeRequest.addListener(
    cancel,
    { urls: ["<all_urls>"] },
    ["blocking"]
  );


  browser.webRequest.onBeforeSendHeaders.addListener(
    function (requestDetails) {
      return new Promise(async (resolve, reject) => {
        if (
          (requestDetails.url.search(".js") !== -1 &&
          requestDetails.url.search(
              "http://92.99.20.210:9000/JSCleaner/JSLabel2.py"
            ) === -1) ||
            requestDetails.type === "script"
        ) {
          var ifLabelled = await Database.ifExists('scripts', "name", requestDetails.url);
          //if not in database
          if (!ifLabelled) {
            //creates a requeststring
            var requestString = encodeURIComponent(requestDetails.url);
            function reqListener() {
              var labeledScripts;
              console.log("RESPONSE FROM PROXY: ", this.responseText);
              //parses the response and adds it to the database
              labeledScripts = JSON.parse(this.responseText);
              var script;
              for (script of labeledScripts) {
                Database.addItem("scripts", script)
              }
              resolve();
            }
            //craetes a request
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
    
            oReq.open(
              "GET",
              "http://92.99.20.210:9000/JSCleaner/JSLabel2.py?url=" +
                requestString
            );
            oReq.send();
            var count = 0;
            oReq.timeout = 5000;
            oReq.onerror = function (e) {
              console.log("Server Error: contact administrator" + e);
              reject();
            };
            // oReq.ontimeout = function (e) {
            //   console.log("Request has timedout: ", e);
            //   reject();
            // };
  
          }
        }
      });
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );
});




