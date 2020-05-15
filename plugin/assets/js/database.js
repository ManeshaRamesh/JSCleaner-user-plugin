
import * as Constants from './constants.js';

 var db;

//  var blockScripts = ['']; //array of blocked scripts (based on labels)


// var BlockTheseScripts =[]
var disabledLabels = [];

var blockScripts = [];
var labelledScript = new Map();
var URLExceptions = new Map();


// const asyncLocalStorage = {
//     setItem: function (key, value) {
//         return new Promise((resolve)=>{
//             resolve(localStorage.setItem(key, value));
//         })
            
//     },
//     getItem: function (key) {
//         return new Promise((resolve)=>{
//             resolve(localStorage.getItem(key));
//         })
//     }
// };

function createDatabase(){ 
    return new Promise((resolve) => {
            //create the database

    // Let us open our database
    var DBOpenRequest = window.indexedDB.open("JSCLEANER", 2);

    // these event handlers act on the database being opened.
    DBOpenRequest.onerror = function(event) {
        console.log(window.jscleaner.Error.DATABASEERROR + "Failed to load to database.")
    };

    DBOpenRequest.onupgradeneeded = function(event) {
    var db = this.result;
    
    db.onerror = function(event) {
        console.log(window.jscleaner.ErrorDATABASEERROR + "Failed to load to database.")
    };

        // if (!db.objectStoreNames.contains('scripts')) {
            var scriptsOS = db.createObjectStore("scripts", {keyPath: "name"});
            // scriptsOS.createIndex("scriptsID", "scriptsID", {unique: true, autoIncrement:true});
            // scriptsOS.createIndex('name', 'name', {unique: true});
            scriptsOS.createIndex('label', 'label', {unique: false});
            scriptsOS.createIndex('accuracy', 'accuracy', {unique: false});

            console.log("createdObjectStore", scriptsOS)
        // }
        // if (!db.objectStoreNames.contains('urls')) {
            var urlsOS = db.createObjectStore('urls', {keyPath: 'urlsName'});
            // urlsOS.createIndex('urlID', 'urlID', {unique: true});
            urlsOS.createIndex('default', 'default', {unique: false});
            urlsOS.createIndex('scripts', 'scripts', {unique: false});
        // }
        // if (!db.objectStoreNames.contains('urlsScripts')) {
        // var urlsscriptsOS = db.createObjectStore('urlsScripts', {keyPath: 'urlsScriptsID', autoIncrement:true});
        // }
    }
    DBOpenRequest.onsuccess = function(event) {
        console.log("Database Initialized")

    //   note.innerHTML += '<li>Database initialised.</li>';
    
    // store the result of opening the database in the db
    // variable. This is used a lot below
    resolve(DBOpenRequest.result);
    
    };


    })


   }

function addItem(newItem, OSName ){
    // console.log("Add Item", newItem)
    // Create a new object ready to insert into the IDB
//   var newItem = [ { taskTitle: "Walk dog", hours: 19, minutes: 30, day: 24, month: "December", year: 2013, notified: "no" } ];

  // open a read/write db transaction, ready for adding the data
  var transaction = db.transaction([OSName], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function(event) {
    // note.innerHTML += '<li>Transaction completed.</li>';
    // console.log("Transaction Completed (ADD ITEM) - ", newItem)
  };

  transaction.onerror = function(event) {
//   note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
    // console.log("Transaction not opened due to error. Duplicate items not allowed - ", newItem)

  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore(OSName);

  // Make a request to add our newItem object to the object store
  var objectStoreRequest = objectStore.add(newItem);
    objectStoreRequest.onerror = function(event) {
        console.log ("failed to add item to database",  event);
//   note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
    // console.log("Transaction not opened due to error. Duplicate items not allowed - ", newItem)

  };

  objectStoreRequest.onsuccess = function(event) {
    // report the success of our request
    // note.innerHTML += '<li>Request successful.</li>';
    // console.log("Request to add item was successful- ", newItem)
    // loadData(null); 
    if (OSName == 'scripts'){
        updateScriptsMap(newItem);
    }
    else if (OSName == 'urls'){
        updateURLExceptionMap(newItem);
    }
    
    updateBlockedScripts('add',newItem);


};

   

 
}

function updateURLExceptionMap(item){
    var key = item.urlsName;
    var value = {
        default : item.default, 
        scripts: item.scripts
    }
     URLExceptions.set(key, value);

}
function updateBlockedScripts(action,item){
    if (action ==='add'){
        if(disabledLabels.includes(item.label)){
            blockRequests(true, item, action) 
        }
    }
    // else if (action ==='remove'){} 
    else {
        console.log("action is incorrect");

    }
}

function updateScriptsMap(item){
    var key = item.name;
    var value = {
        accuracy : item.accuracy, 
        label : item.label,
        scriptsID: item.scriptsID, 
    }
    labelledScript.set(key, value);
}

    //read values params - objectstore, key,
function readItem(OSName, key) {
    // open a read/write db transaction, ready for retrieving the data
    var transaction = db.transaction([OSName], "readwrite");
    
    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function(event) {
        console.log("Transaction Completed - ", OSName)

    };
    
    transaction.onerror = function(event) {
        console.log("Transaction not opened due to error. Duplicate items not allowed - ", transaction.error)

        // note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
    };
    
    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);
    
    // Make a request to get a record by key from the object store
    var objectStoreRequest = objectStore.get(key);
    
    objectStoreRequest.onsuccess = function(event) {
        // report the success of our request
        console.log("Request successful - ", OSName)
    
        var myRecord = objectStoreRequest.result;
    };
}

function updateItem(OSName, data){
    // var title = "Walk dog";

 var transaction = db.transaction([OSName], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function(event) {
    // note.innerHTML += '<li>Transaction completed.</li>';
    // console.log("Transaction Completed (ADD ITEM) - ", newItem)
  };

  transaction.onerror = function(event) {
//   note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
    // console.log("Transaction not opened due to error. Duplicate items not allowed - ", newItem)

  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore(OSName);

  // Make a request to add our newItem object to the object store
  var objectStoreRequest = objectStore.put(data);

  objectStoreRequest.onsuccess = function(event) {
    // report the success of our request
    // note.innerHTML += '<li>Request successful.</li>';
    console.log("Request to update item was successful- ", data)
    // loadData(null); 
    if (OSName == 'scripts'){
        updateScriptsMap(data);
    }
    else if (OSName == 'urls'){
        updateURLExceptionMap(data);
    }
    
    updateBlockedScripts('add',data);

}
}
 function removeItem(OSName, key){
       // open a read/write db transaction, ready for deleting the data
    var transaction = db.transaction([OSName], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function(event) {
        // console.log('Transaction completed');
    };

    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error: ' + transaction.error );
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);

    // Make a request to delete the specified record out of the object store
    var objectStoreRequest = objectStore.delete(key);

    objectStoreRequest.onsuccess = function(event) {
        // report the success of our request
        // note.innerHTML += '<li>Request successful.</li>';
        console.log("Request to remove item was successful- ", key)
        // loadData(null); 
        labelledScript.delete(key);
    };
 }
 function searchItem(OSName, attribute, item){
       // first clear the content of the task list so that you don't get a huge long list of duplicate stuff each time
    //the display is updated.
  

    // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
    let objectStore = db.transaction(OSName).objectStore(OSName);
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
            if (cursor.value[attribute] == item) { return cursor.value;};

          // continue on to the next item in the cursor
          cursor.continue();

        // if there are no more cursor items to iterate through, say so, and exit the function
        } else {
            console.log("reached end of table")
            return null;
        }
      }

 }

 function ifExists(OSName, attribute, item){

    return new Promise((resolve,reject) =>{
        let objectStore = db.transaction(OSName).objectStore(OSName);
        objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
            if(cursor) {
                if (cursor.value[attribute] == item) {resolve(true);};

            // continue on to the next item in the cursor
            cursor.continue();

            // if there are no more cursor items to iterate through, say so, and exit the function
            } else {
                console.log("reached end of table")
                resolve(false);
            }
        }
    })
    


 }

function iterate(OSName, callback){
    if (!db) return;
    let objectStore = db.transaction(OSName).objectStore(OSName);
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
            callback(cursor.value)
            // .then((result)=>{
            //     if (result){
            //         console.log(result); 
            //         return result;
            //     }
            //     else if (result === null){
            //         cursor.continue();
            //     }
            // })
            // if (cursor.value[attribute] == item) {console.log(cursor.value); return true;};
            
            // continue on to the next item in the cursor
          
            cursor.continue();
        // if there are no more cursor items to iterate through, say so, and exit the function
        } else {
            console.log("reached end of table")
            return;
        }
      }

 }

 async function logStorageChange(changes, area) {
    console.log("Change in storage area: " + area);
   
    let changedItems = Object.keys(changes);
   
    
      
    for (let item of changedItems) {
        //if item is default
        //
        if (item === 'default'){
            Constants.setdefaultLabels(changes[item].newValue).then(()=>{
                console.log("updating array", Constants.defaultLabels)
                blockRequests(true);
                return;

            }); 
            
        }
     
    }
    // for (let item of changedItems) {
    //   console.log(item + " has changed:");
    //   console.log("Old value: ");
    //   console.log(changes[item].oldValue);
    //   console.log("New value: ");
    //   console.log(changes[item].newValue);
    // }
  }
 function blockURLS(OSName, details){
     return new Promise((resolve, reject)=>{
        let objectStore = db.transaction(OSName).objectStore(OSName);
        objectStore.openCursor().onsuccess = function(event) {
          let cursor = event.target.result;
            // if there is still another cursor to go, keep runing this code
            if(cursor) {
                if(cursor.value.name === details.url){
                    if (cursor.value.label === "Social"){
    
                        console.log("Should be blocked", cursor.value)
                        var scheme = /^https/.test(details.url) ? "https" : "http";
                        // chrome.tabs.update(details.tabId, {
                        //     url: scheme + "://robwu.nl/204"
                        // });
                        resolve({redirectUrl: scheme + "://robwu.nl/204" });
                    }
                }
                cursor.continue();
                // if (cursor.value[attribute] == item) {console.log(cursor.value); return true;};
                
                // continue on to the next item in the cursor
              
    
            // if there are no more cursor items to iterate through, say so, and exit the function
            } else {
                console.log("reached end of table")
                resolve(undefined);
            }
          }


     })


 }

// these scripts are all labelled 
 function cancel(requestDetails) {
    //store it in locastorage
    var hostUrl;
    var tempObj = {}
    var Obj = {};
    var entry; 

    //redirect urls

    // console.log("All requestDetails: ", (requestDetails.url.search("http://86.97.179.52:9000/JSCleaner/JSLabel2.py") === -1), requestDetails.url.search(".js"), requestDetails.url) 

    if ((requestDetails.url.search(".js") !== -1 && requestDetails.url.search("http://92.99.20.210:9000/JSCleaner/JSLabel2.py") === -1) || (requestDetails.type === "script")){ //check if url is of type script
        // console.log("All requestDetails: ", "pass", requestDetails.url) 


        //////////
           var found = false;
           var scriptBody;
           var request ;
           var jsonObj;
           var requestString;
            // console.log("details", details);
            //check if the scripts can be found
            // console.log("hellloooo", Database.labelledScript)
            // if script is not in the database
            console.log("labelledscript", JSON.stringify(Array.from(labelledScript.entries())))
            
            if (!labelledScript.get(requestDetails.url)){
                console.log("Unlabelled requestDetails", requestDetails)

                // send get request to server and get response 
                function reqListener () {
                    // console.log("RESPONSE FROM PROXY: ", this.responseText);
                    // scriptBody = this.responseText.substring(0, this.responseText.search(">>>>>>>>>>>>>>>>>>>> JSCLEANER <<<<<<<<<<<<<<<<<<<<"))
                    // console.log("response: ", scriptBody)
                    // jsonObj = this.responseText.substring(this.responseText.search(">>>>>>>>>>>>>>>>>>>> JSCLEANER <<<<<<<<<<<<<<<<<<<<") + 51)
                    console.log("response text: ", requestDetails.url,  this.responseText)
                    jsonObj= JSON.parse(this.responseText)
                    console.log("parsed", requestDetails.url, " ", jsonObj)
                    if (!labelledScript.get(requestDetails.url) ){
                        addItem(jsonObj[0], 'scripts')
                        console.log("add item")
                    }
                    //     tempObj = {
                    //         smessage : {
                    //             body: scriptBody,
                    //             url: requestDetails.url
                    //         }, 
                    //         subject: "injectScript"
                    //     }
                    // browser.tabs.sendMessage(requestDetails.tabId, tempObj)


                    return 
                    
                    
                }
                  
                  var oReq = new XMLHttpRequest();
                  oReq.addEventListener("load", reqListener);
                  requestString = encodeURIComponent(requestDetails.url)
                  request = "http://92.99.20.210:9000/JSCleaner/JSLabel2.py?url=" + requestString
                  console.log("Request: ", request)
                  oReq.open("GET", request );
                  oReq.send();
                  oReq.timeout = 5000;
                  oReq.onerror = function(e){
                      console.log("Server Error: contact administrator" + e)
                      return
                      
                  }
                  // oReq.ontimeout = function(e){
                  //   console.log("Request has timedout: ", e, requestDetails.url)
                  //   return
                    
                  // }

            }
            else{
                var entry = labelledScript.get(requestDetails.url)
                if (entry.label === "Others"){
                    if (parseFloat(entry.accuracy) === 2.0){
                        console.log("critical")
                        Obj = {
                            name: requestDetails.url,
                            status: 1, 
                            label: entry.label
                        };
                        tempObj = {
                            message : Obj, 
                            subject: "script"
                        }
                        browser.tabs.sendMessage(requestDetails.tabId,tempObj)
                        // it is critical
                        return
                    }
                    else if (parseFloat(entry.accuracy) === -2.0){

                        // it is non-critical
                        Obj = {
                            name: requestDetails.url,
                            status: 0, 
                            label: entry.label
                        };
                        tempObj = {
                            message : Obj, 
                            subject: "script"
                        }
                        browser.tabs.sendMessage(requestDetails.tabId,tempObj)
                        console.log("Canceling non-critical scripts: " + requestDetails.url);

                        return({cancel:true})
                    }
                }

            }
            // for(var i = 0; i < Database.scripts.length; i++) {
            //     if (Database.scripts[i].name == details.url) {
            //         found = true;
            //         break;
            //     }
            // }
            // console.log("Should script be labelled?: ", details.url, !found  , !scripts.includes(details.url) )


        //////////
        // console.log("requestDetails", requestDetails)
        //gettign the hostURL - the page that makes the requests
        if (requestDetails.frameAncestors.length===0){
            hostUrl = requestDetails.documentUrl;
        }
        else{
            hostUrl = requestDetails.frameAncestors[0].url;
        }

        //checks if the host Url is an exception
        if (URLExceptions.get(hostUrl)){ // if it 
            Obj =URLExceptions.get(hostUrl);
            // console.log("Canceling URL Exception: " + Obj.default, Obj.scripts);
            if (Obj.default === 0){
                for (entry of Obj.scripts){
                    // console.log(entry.name +" === " + requestDetails.url, entry.name  === requestDetails.url);
                    if (entry.name === requestDetails.url) {
                            tempObj = {
                            message : entry, 
                            subject: "script"
                        }
                        if ( !entry.status){
                        
                        console.log("Canceling URL Exception: " + requestDetails.url);

                        browser.tabs.sendMessage(requestDetails.tabId,tempObj)

                        return({cancel: true})

                        }
                        else{

                       
                        browser.tabs.sendMessage(requestDetails.tabId,tempObj)

                        return; 

                        }
                        
                    }
                

                    
                }
            }
        }

        //will be executed if the script is not a URLExcepption or if the urls are set to follow the default settings across all pages
         // if it is a url that needs to be bloked
        if (blockScripts.includes(requestDetails.url)){ 

                Obj = {
                    name: requestDetails.url,
                    status: 0, 
                    label: labelledScript.get(requestDetails.url) ? labelledScript.get(requestDetails.url).label : undefined
                };
                tempObj = {
                    message : Obj, 
                    subject: "script"
                }
                browser.tabs.sendMessage(requestDetails.tabId,tempObj)
            console.log("Canceling: " + requestDetails.url);
            return {cancel: true};
        }

        else{
            Obj = {
                name: requestDetails.url,
                status: 1, 
                label: labelledScript.get(requestDetails.url) ? labelledScript.get(requestDetails.url).label : undefined
            };
            tempObj = {
                message : Obj, 
                subject: "script"
            }
            browser.tabs.sendMessage(requestDetails.tabId,tempObj)
            return;
        } 
        // chrome.storage.local.get([hostUrl], function(result) {
        //     console.log("HELOO", result);

        //     if (!result.hasOwnProperty(hostUrl)){
        //         var obj = {};
        //         obj[hostUrl] = []
        //         obj[hostUrl].push(requestDetails.url);
        //         chrome.storage.local.set(obj, function() { })
        //     }

        //     else{
        //         if (!result[hostUrl].includes(requestDetails.url)){
        //             result[hostUrl].push(requestDetails.url);
        //             chrome.storage.local.set(result, function() { })
        //         }
        //     }

        // })
         //store default settings in chrome storage     

    }
    
     
}

 function blockRequests(removelistener, object, action){
    return new Promise((resolve, reject)=>{
        var label;
        console
       //this runs when the extension is reloaded and things need to be read from the database
        if (!object)
        {
            console.log("reload", Constants.defaultLabels)
            blockScripts = [];
            disabledLabels = [];
            // console.log("empty", blockScripts )
            //gets labels that are disabled
            for(label of Constants.defaultLabels){
                if (!label.status){
                    // console.log("Labels that are disabled", label.label)
                    disabledLabels.push(label.label);
                }
            }
            //gets teh scripts with the disabled labels
            // iterate('scripts', function(value){
            // if(disabledLabels.includes(value.label)){
            //     blockScripts.push(value.name); 
            // }
            // })
            // console.log("disabledLabels", disabledLabels) 
            for(let [key,value] of labelledScript){
                // console.log(key, value)
                if(disabledLabels.includes(value.label)){
                    blockScripts.push(key); 
                }
            }
        }
        else{ 
            if(action ==='add'){//just add the name of the script (for add item)
                blockScripts.push(object.name);
            }
            else if (action === 'remove'){
                const index = blockScripts.indexOf(object.name);
                if (index > -1) {
                    blockScripts.splice(index, 1);
                }
            }

        }
            
            console.log("creating a listener")

            // add the listener,
            // passing the filter argument and "blocking"
            browser.webRequest.onBeforeRequest.addListener(
                cancel,
                {urls: ["<all_urls>"]},
                ["blocking"]
            );
        // }
        // return blockScripts;
        console.log("Scripts that are being blocked", blockScripts, blockScripts.length); 

        resolve(blockScripts); 
    }).catch((error)=>{
        console.log("Error in creating a list of blocked scripts: ", error)
    }) 

 }

 /*
    1) creates a map of labeelled scripts
    2) creates a map of URLExeptions
    3) makes a list of scripts that need to be blocked
 */

 function createMapofLabelledScripts(openedDB){
        return new Promise(async (resolve, reject)=>{
        if (openedDB !==null){
            db = openedDB;
        }

                
        
        // console.log('Scripts that need to be blocked; ', blockScripts)

        
        var transaction = db.transaction(['scripts'], "readwrite");
        
        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
            // console.log("Transaction Completed - ", OSName)

        };
        
        transaction.onerror = function(event) {
            // console.log("Transaction not opened due to error. Duplicate items not allowed - ", transaction.error)
            reject(false)

            // note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
        };
        
        // create an object store on the transaction
        var objectStore = transaction.objectStore('scripts');
        
        // Make a request to get a record by key from the object store
        var objectStoreRequest = objectStore.getAll();
        
        objectStoreRequest.onsuccess = function(event) {
            var scripts = []; //array of all scripts
            // report the success of our request
            scripts = objectStoreRequest.result;
            var count;
            var key;
            var value;
            for(count = 0; count < scripts.length ; count ++){
                key = scripts[count].name
                value = {
                    accuracy : scripts[count].accuracy, 
                    label : scripts[count].label,
                    scriptsID: scripts[count].scriptsID, 
                }
                labelledScript.set(key, value )
            }
            console.log("Map Created - ", labelledScript)


            resolve(labelledScript)
        
        };

    }).catch(function(error){
        console.log("Error loading labelled scripts from database: ", error)

    })

 }

  function createMapofURLExceptions(openedDB){
        return new Promise(async (resolve, reject)=>{
        if (openedDB !==null){
            db = openedDB;
        }

                
        
        // console.log('Scripts that need to be blocked; ', blockScripts)

        
        var transaction = db.transaction(['urls'], "readwrite");
        
        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
            // console.log("Transaction Completed - ", OSName)

        };
        
        transaction.onerror = function(event) {
            // console.log("Transaction not opened due to error. Duplicate items not allowed - ", transaction.error)
            reject(false)

            // note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
        };
        
        // create an object store on the transaction
        var objectStore = transaction.objectStore('urls');
        
        // Make a request to get a record by key from the object store
        var objectStoreRequest = objectStore.getAll();
        
        objectStoreRequest.onsuccess = function(event) {
            var urls = []; //array of all scripts
            // report the success of our request
            urls = objectStoreRequest.result;
            var count;
            var key;
            var value;
            for(count = 0; count < urls.length ; count ++){
                key = urls[count].urlsName
                value = {
                    default : urls[count].default, 
                    scripts: urls[count].scripts
                }
                URLExceptions.set(key, value )
            }
            console.log("Map Created - ", URLExceptions)


            resolve(URLExceptions)
        
        };

    }).catch(function(error){
        console.log("Error loading URL exceptions from database: ", error )

    })

 }


 function loadData(openedDB){
    return new Promise(async (reject, resolve)=>{
        var map = await createMapofLabelledScripts(openedDB); 
        var map2 = await createMapofURLExceptions(openedDB);
        var  list = await blockRequests(); 
        resolve("done")

    }).catch((error)=>{
        console.log("Error loading data: ", error)
    })

}


export  {
    createDatabase,
    readItem,
    addItem, 
    removeItem,
    updateItem, 
    searchItem, 
    ifExists, 
    iterate, 
    blockURLS,
    labelledScript, 
    loadData, 
    blockRequests, 
    logStorageChange, 
    URLExceptions


};
