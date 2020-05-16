import * as Database from "./Database.js";

var timedout = false;
window.jscleaner = {};
window.jscleaner.tabs = [];
var scripts = [];
var labelledScripts = [];

window.jscleaner.labels = [
  "Marketing",
  "CDN",
  "Tag Manager",
  "Video",
  "Customer Success",
  "Utility",
  "Advertising",
  "Analytics",
  "Hosting",
  "Content",
  "Social",
  "Others",
  "Critical",
  "Noncritical",
];

// Background script runs in the following order:

// 1. Creates a database
// 2. add listenre at onBeforeSendHeaders
// 3. Add  listener to the changing of the local storage to update the disabled scripts

var disabled_labels = [];
//creates a database
Database.createDatabase()
  .then((result) => {
    //loads defualt settings

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
        for (var element of result.default) {
          if (element.status === 0) {
            disabled_labels.push(element.label);
          }
        }

        // Constants.setdefaultLabels(result['default']);
      }
      console.log("disabled classes", disabled_labels);
      return disabled_labels;
    });
  })
  .then(() => {

    // timeout in case the scripts array does not fill up 

    setInterval(() => {
      if (scripts.length) {
        // console.log("print add item - here1")
        // timedout = false;
        var requestString = "";
        for (let ele of scripts) {
          requestString = requestString + encodeURIComponent(ele) + "*****";
        }
        requestString = requestString.substr(0, requestString.length - 5);
        //send an ajax request
        // console.log("REQUEST TO PROXY: ", requestString);

        function reqListener() {
          var tempObj;
          // console.log("RESPONSE FROM PROXY: ", this.responseText);
          labelledScripts = JSON.parse(this.responseText);
          console.log(labelledScripts);
          var script;
          for (script of labelledScripts) {
            Database.addItem(script, "scripts");
          }
          labelledScripts = [];

        }

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);

        oReq.open(
          "GET",
          "http://92.99.20.210:9000/JSCleaner/JSCleanerFinal/JSLabel.py?url=" + requestString
        );
        oReq.send();
        var count = 0;
        // oReq.timeout = 5000;
        oReq.onerror = function (e) {

        };

        scripts = [];

      }
    }, 5000);
    console.log("Added blocking listener");
    browser.webRequest.onBeforeSendHeaders.addListener(
      function (requestDetails) {
        console.log("onBeforeSendHeaders");
        return new Promise(async (resolve, reject) => {
          if (
            (requestDetails.url.search(".js") !== -1 &&
              requestDetails.url.search(
                "http://92.99.20.210:9000/JSCleaner/JSCleanerFinal/JSLabel.py"
              ) === -1) ||
            requestDetails.type === "script"
          ) {
            var ifLabelled = await Database.ifExists(
              "scripts",
              "name",
              requestDetails.url
            );
            //if not in database
            if (!ifLabelled && !scripts.includes(requestDetails.url)){
              scripts.push(requestDetails.url); // add to the list of scripts
              if (scripts.length === 5) { // if script reaches a limit of 5 send the request to the proxy
              
                var requestString = "";
                for (var script of scripts){
                  requestString = requestString + encodeURIComponent(script) +  "*****"
                }
                requestString = requestString.substr(0, requestString.length - 5); //removes the last comma
                function reqListener() {
                  
                  console.log("RESPONSE FROM PROXY: ", this.responseText);
                  //parses the response and adds it to the database
                  labelledScripts = JSON.parse(this.responseText);
                  var script;
                  for (script of labelledScripts) {
                    var tempObj = {
                      name: script["name"],
                      label: script["label"],
                      accuracy: "1",
                    };
                    Database.addItem("scripts", tempObj);
                  }
                  labelledScripts = [];
                  resolve();
                }
                //craetes a request
                var oReq = new XMLHttpRequest();
                oReq.addEventListener("load", reqListener);

                oReq.open(
                  "GET",
                  "http://92.99.20.210:9000/JSCleaner/JSCleanerFinal/JSLabel.py?url=" +
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
                scripts= []

              }
              //creates a requeststring
            } else {
              console.log("In database", ifLabelled);
              var Obj;
              var tempObj;

              browser.tabs.sendMessage(requestDetails.tabId, tempObj);
              if (disabled_labels.includes(ifLabelled.label)) {
                Obj = {
                  name: requestDetails.url,
                  status: 0,
                  label: ifLabelled.label,
                };
                tempObj = {
                  message: Obj,
                  subject: "script",
                };
                resolve({ cancel: true });
              } else {
                //if not disabled
                Obj = {
                  name: requestDetails.url,
                  status: 1,
                  label: ifLabelled.label,
                };
                tempObj = {
                  message: Obj,
                  subject: "script",
                };
              }
              browser.tabs.sendMessage(requestDetails.tabId, tempObj);
            }
          }
          resolve();
        });
      },
      { urls: ["<all_urls>"] },
      ["requestHeaders"]
    );

    browser.storage.onChanged.addListener(function (changes, area) {
      console.log("Change in storage area: " + area);

      let changedItems = Object.keys(changes);
      disabled_labels = [];

      for (let item of changedItems) {
        //if item is default
        //
        if (item === "default") {
          for (var e of changes[item].newValue) {
            if (e.status === 0) {
              disabled_labels.push(e.label);
            }
          }
        }
      }
      console.log("changed", disabled_labels);
    });
    console.log("Added labelling listener");
  });
