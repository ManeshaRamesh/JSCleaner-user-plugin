import * as Database from "./Database.js";

var timedout = false;
window.jscleaner = {};
window.jscleaner.tabs = [];

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
            status: 0,
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
  // .then(() => {
  //   chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  //     // First, validate the message's structure.

  //     if (msg.from === "popup" && msg.subject === "urlUpdate") {
  //       var URLscripts = [];
  //       var tempObj = {};
  //       // console.log("Recieved from content script: ",msg.content);
  //       msg.content.scripts.forEach((value, key, map) => {
  //         // console.log("element", value, " ", key);
  //         tempObj = {
  //           name: key,
  //           label: value.label,
  //           status: value.status,
  //         };
  //         URLscripts.push(tempObj);
  //       });
  //       // console.log(Database.URLExceptions.get(msg.content))
  //     }
  //   });
  // })
  .then(() => {
    console.log("Added blocking listener");
    browser.webRequest.onBeforeSendHeaders.addListener(
      function (requestDetails) {
        console.log("onBeforeSendHeaders");
        return new Promise(async (resolve, reject) => {
          if (
            (requestDetails.url.search(".js") !== -1 &&
              requestDetails.url.search(
                "http://92.99.20.210:9000/JSCleaner/JSLabel2.py"
              ) === -1) ||
            requestDetails.type === "script"
          ) {
            var ifLabelled = await Database.ifExists(
              "scripts",
              "name",
              requestDetails.url
            );
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
                  var tempObj = {
                    name: script["name"], 
                    label: script["label"], 
                    accuracy:"1"
                  }
                  Database.addItem("scripts", tempObj);
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
