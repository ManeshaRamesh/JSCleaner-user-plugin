var db;

function createDatabase() {
  return new Promise((resolve, reject) => {
    //create the database

    // Let us open our database
    var DBOpenRequest = window.indexedDB.open("JSCLEANER", 2);

    // these event handlers act on the database being opened.
    DBOpenRequest.onerror = function (event) {
      console.log(
        window.jscleaner.Error.DATABASEERROR + "Failed to load to database."
      );
      reject()
    };
    //if fired when teh database is updated or deleted
    DBOpenRequest.onupgradeneeded = function (event) {
      var db = this.result;

      db.onerror = function (event) {
        console.log(
          window.jscleaner.ErrorDATABASEERROR + "Failed to create Object Store"
        );
      };
      var scriptsOS = db.createObjectStore("scripts", { keyPath: "name" });
      scriptsOS.createIndex("label", "label", { unique: false });
      scriptsOS.createIndex("accuracy", "accuracy", { unique: false });
      //   scriptsOS.createIndex("ttl", "ttl", {unique: false});

      console.log("createdObjectStore", scriptsOS);
    };
    DBOpenRequest.onsuccess = function (event) {
      console.log("Database Initialized");
      db = DBOpenRequest.result;
      resolve(DBOpenRequest.result);
    };
  })
}

function getItem(OSName, key) {
  return new Promise((reject, resolve) => {
      var item;
    // open a read/write db transaction, ready for retrieving the data
    var transaction = db.transaction([OSName], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function (event) {
      console.log("Transaction Completed (GET ITEM)- ", item);
        resolve(item)
      
    };

    transaction.onerror = function (event) {
      console.log(
        "Transaction not opened due to error. does not exist - ",
        transaction.error
      );
      reject();
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);

    // Make a request to get a record by key from the object store
    var objectStoreRequest = objectStore.get(key);

    objectStoreRequest.onsuccess = function (event) {
      // report the success of our request
      console.log("Request successful - ", OSName);

      item = objectStoreRequest.result;
    };
  });
}

//Add item to database
function addItem(OSName, newItem) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([OSName], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function (event) {
      console.log("Transaction to add Item is complete");
      resolve();
    };

    transaction.onerror = function (event) {
      console.log(
        "Transaction not opened due to error. Duplicate items not allowed - ",
        newItem
      );
      reject();
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);

    // Make a request to add our newItem object to the object store
    var objectStoreRequest = objectStore.add(newItem);
    objectStoreRequest.onerror = function (event) {
      console.log("Failed to add item to database", event);
    };

    objectStoreRequest.onsuccess = function (event) {
      console.log("Added item to database", event);
    };
  });
  //declare type o transaction
}

//Update existing item in database
function updateItem(OSName, data) {
  return new Promise((reject, resolve) => {
    var transaction = db.transaction([OSName], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function (event) {
      console.log("Transaction Completed (UPDATE ITEM) - ", data);
      resolve();
    };

    transaction.onerror = function (event) {
      console.log(
        "Transaction not opened due to error. Duplicate items not allowed - ",
        data
      );
      reject();
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);

    // Make a request to add our newItem object to the object store
    var objectStoreRequest = objectStore.put(data);

    objectStoreRequest.onsuccess = function (event) {
      // report the success of our request
      console.log("Request to update item was successful- ", data);
    };
  });
}

//delete item from database

function deleteItem(OSName, key) {
  return new Promise((reject, resolve) => {
    // open a read/write db transaction, ready for deleting the data
    var transaction = db.transaction([OSName], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function (event) {
      console.log("Transaction completed (DELETE ITEM)" + key);
      resolve();
    };

    transaction.onerror = function (event) {
      console.log("Transaction not opened due to error: " + transaction.error);
      reject("Transaction not opened due to error: " + transaction.error);
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore(OSName);

    // Make a request to delete the specified record out of the object store
    var objectStoreRequest = objectStore.delete(key);

    objectStoreRequest.onsuccess = function (event) {
      // report the success of our request
      console.log("Request to remove item was successful- ", key);
    };
    objectStoreRequest.onerror = function (event) {
      // report the success of our request
      console.log("Request to remove item failed- ", key);
    };
  });
}

function ifExists(OSName, attribute, item) {
  return new Promise((resolve, reject) => {
    let objectStore = db.transaction(OSName).objectStore(OSName);
    objectStore.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;
      // if there is still another cursor to go, keep runing this code
      if (cursor) {
        if (cursor.value[attribute] == item) {
          resolve(cursor.value);
        }

        // continue on to the next item in the cursor
        cursor.continue();

        // if there are no more cursor items to iterate through, say so, and exit the function
      } else {
        console.log("reached end of table");
        resolve(false);
      }
    };
  });
}

export { createDatabase, addItem, deleteItem, updateItem, getItem, ifExists };
