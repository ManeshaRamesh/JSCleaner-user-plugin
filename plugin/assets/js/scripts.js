Constants = {};
var checkbox = {
  1 : "", 
  0 : "checked"
}
Constants.labels = {
Advertising : 0,
Analytics : 1, 
Social : 2, 
Video : 3, 
Utility:4,
Hosting: 5, 
Marketing: 6, 
"Customer Success": 7, 
Content : 8,
CDN : 9,
"Tag Manager": 10,
Others: 11
}
var customFlag =0;
var URLmode;
var currentTab;
var labels = ['Advertising','Analytics', 'Social', 'Video', 'Utility', 'Hosting', 'Marketing', 'Customer Success', 'Content', 'CDN', 'Tag Manager', 'Others']

document.addEventListener('DOMContentLoaded', function() {
  browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
                currentTab = tabs[0].url; // there will be only one in this array


  });
  browser.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) =>{

    
    browser.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'modeInfo'}
            // ...also specifying a callback to be called 
    //    from the receiving end (content script).
    ).then((message)=>{
      URLmode = message;
      console.log("get mode: ", URLmode)
      if (URLmode === 1 || URLmode ===undefined){
        console.log("are in default mode")
        radio1.disabled = true;
        radio2.disabled = false;
      }
     else if (URLmode === 0){
        console.log("not in default mode")
        radio1.disabled = false;
        radio2.disabled = false;
      }

    })
});

  //add the two modes
  var mode = document.getElementById("mode");
  var radio1 = document.createElement("input");
  radio1.type = 'button';
  radio1.className = 'modes col';
    radio1.style = "margin:3px;"

  // radio1.style = "margin:3px; background-color: brown; border: none; color: white; "
  radio1.value = "Set back to Default";
  radio1.id = 'buttonDefault'
  radio1.name = "buttonMode";
  radio1.checked = true; 
  

  // var radio1Label = document.createElement("label");
  // radio1Label.for = 'radioDefault';
  // radio1Label.innerText = "default";

  var mode = document.getElementById("mode");
  var radio2 = document.createElement("input");
  radio2.className = 'modes col';
  radio2.type = 'button';
  radio2.style = "margin:3px;"

  // radio2.style = "margin:3px; background-color: brown; border: none; color: white; "
  radio2.value = "Customize";
  radio2.id = 'buttonCustom'
  radio2.name = "buttonMode";

  //if mode == 1 = is an URL exception but set to default for noe
  //if mode == undefined = not a URLexception
  //if mode == 0 = it is a URLexception with page-specific settings

  

  // var radio2Label = document.createElement("label");
  // radio2Label.for = 'radioCustom';
  // radio2Label.innerText = "custom";
  
  mode.appendChild(radio1);
  // mode.appendChild(radio1Label)
  mode.appendChild(radio2);
  // mode.appendChild(radio2Label)

//hover over teh buttons
  // document.getElementById("radioDefault").onmouseover = function() {
  //     this.style.backgroundColor = "white";
  //     this.style.color = "brown";
  // }
  //  document.getElementById("radioDefault").onmouseout = function() {
  //     this.style.backgroundColor = "brown";
  //     this.style.color = "white";
  // }
  // document.getElementById("radioCustom").onmouseover = function() {
  //     this.style.backgroundColor = "white";
  //     this.style.color = "brown";
  // }
  //    document.getElementById("radioCustom").onmouseout = function() {
  //     this.style.backgroundColor = "brown";
  //     this.style.color = "white";
  // }
}, false);

window.addEventListener('DOMContentLoaded', () => {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    // ...and send a request for the DOM info...
    browser.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'}
        // ...also specifying a callback to be called 
        //    from the receiving end (content script).
        ).then((response)=>{
          console.log("Scripts to be displayed", JSON.stringify(Array.from(response.entries())), response)
          var accordian = document.getElementById("accordionLabels");
          var div = document.createElement("div");
          div.id = "accordionlabels";
          div.className = "col";
          accordian.appendChild(div);
          // for (let [key, value] of response) {
          for (label of labels) {
            var scriptwrapper = document.createElement("div");
            scriptwrapper.className = "row";
            // scriptwrapper.innerHTML= "<div class='col-6 scriptName'> " + key + "</div> <div class='col-6 status' style='overflow: hidden; '>"+ JSON.stringify(value) + "</div>"
            scriptwrapper.innerHTML =  "<div class='card z-depth-0 bordered'> \
            <div class='card-header' id='heading"+label.replace(' ', '')+"'>\
              <h5 class='mb-0'>\
                <button style= 'width: 100%;'class='btn btn-link collapsed' type='button' data-toggle='collapse' data-target='#collapse"+label.replace(' ', '')+"'\
                  aria-expanded='false' aria-controls='collapse"+label.replace(' ', '')+"'>\
                  " + label+" \
                </button>  \
              </h5>  \
            </div>  \
            <div id='collapse"+label.replace(' ', '')+"' class='collapse' aria-labelledby='heading"+label.replace(' ', '')+"' \
            data-parent='#accordionlabels'> \
              <div class='card-body' id ='scriptsListHere"+label.replace(' ', '')+"'> \
             </div> \
            </div> \
          </div>"
          div.appendChild(scriptwrapper);
          var place = document.getElementById('scriptsListHere'+label.replace(' ', ''))
          for (let [key, value] of response) {
            if (value.label === label){
              document.getElementById('collapse'+label.replace(' ', '')).className = "collapse show"
              // place.innerText = place.innerText + key +"/n";
              place.innerHTML = place.innerHTML + "<div style='padding:2px;' class = 'row'> <div  class = 'col-9' style = 'overflow:hidden; white-space: nowrap;'> <a href='' title='"+key+"' style='background-color:#FFFFFF;color:#000000;text-decoration:none'>"+key+ "<a></div><div class ='col-3'><input type='checkbox' " + checkbox[value.status] +" class = 'checkbox-script'></div> </div>"

            }
          }

            
          }
        
          var defaultMode = document.getElementById('buttonDefault');
          var listCheckBoxes = document.getElementsByClassName('checkbox-script');
          var customMode = document.getElementById('buttonCustom');
          var bodyContainer = document.getElementById('bodyContainer');
          var accordian = document.getElementById('accordionLabels');

          console.log("Body Container", bodyContainer)
          var saveButton = document.createElement("div");
          saveButton.className = "row"
          saveButton.id = "saveCustomContainer"
          saveButton.innerHTML = "<button id ='saveCustom'> Save Settings </button>"; 
          // if (defaultMode.checked){
            //disable all checkboxes 
            for (input of listCheckBoxes){
              input.disabled = true;
            } 



            $(document).ready(function(){
               async function closeSelf() {
                  // const { id: windowId, } = (await browser.windows.getCurrent());
                  // return browser.windows.remove(windowId);
                  window.close();
                }
              //saves the settings 
              $("#reload").click(function(){
                browser.tabs.reload(tabs[0].id, {bypassCache: true});
                closeSelf();

              })
              function handleResponseSave(sentMessage){
                    this.disabled = false;
                    console.log("Message from background script savecustom: ", sentMessage);

                    saveButton.innerHTML = "<button id ='saveCustom'> Updated Site Preferences </button>"; 
                    setTimeout(closeSelf, 1000)
                    browser.tabs.reload(tabs[0].id, {bypassCache: true});
                    
                    


                  }
                  function handleErrorSave(error){
                    this.disabled = false;
                    console.log("Could not save site preferences: ", error)
                    saveButton.innerHTML = "<button id ='saveCustom'> Failed to Update Preferences </button>"; 

                  }

              $(document).on('click', "#saveCustom",function(){

                this.disabled = true;
                // send to backgrounds script
                  browser.runtime.sendMessage({from:"popup", subject: "urlUpdate", content: {url: currentTab, scripts: response}})
                  .then(handleResponseSave, handleErrorSave);
                  

             
              })
              $(document).on('click','#buttonDefault', function(){
                console.log("clicked button default")

                browser.runtime.sendMessage({from:"popup", subject: "modeUpdate", content: {url: currentTab, scripts: response}}).then(()=>{
                  
                  console.log("set back to default");
                  browser.tabs.reload(tabs[0].id, {bypassCache: true});
                  closeSelf();
                }, (error)=>{
                  console.log("Error: ", error)
                })



              })

              $(document).on('click','#buttonCustom', function(){
                // $('#buttonCustom').toggle(function(toggled){
                  //enables and disables the checkboxes
                  //when customization is turned on
                  if (customFlag === 0){
                    for (input of listCheckBoxes){
                      input.disabled = false;
                    }
                    customFlag = 1;
                    //add save button
                    bodyContainer.insertBefore(saveButton,accordian);
                    //when scripts are being checked
                    $('.checkbox-script').click(function(){
                      var scriptName = this.parentNode.previousSibling.innerText;
                      var scriptElement = response.get(scriptName);
                      let statusScript;
                      saveButton.innerHTML = "<button id ='saveCustom'> Save Settings </button>"; 

                      if($(this).is(':checked')) {
                        statusScript  = 0;
                      }
                      else{
                        statusScript  = 1;

                      } 
                      
                      response.set(scriptName, {label: scriptElement.label, status: statusScript})
                      console.log("updated response", response, JSON.stringify(response))
                    })

                  }
                  //when customization is turned off

                  else{
                    //remove button
                    var saveCustomButton = document.getElementById("saveCustomContainer")
                    if (saveCustomButton){
                      bodyContainer.removeChild(saveCustomButton);
                    }
                    // disabled all teh checkboxes
                    for (input of listCheckBoxes){
                      input.disabled = true;
                    }
                    customFlag = 0;
                  }

                // })
              })



            })
           // }
          // $(document).ready(function () {


          //   $(document).on('click', "#saveCustom",function(){
          //     this.disabled = true;
              
          //       browser.runtime.sendMessage({from:"popup", subject: "urlUpdate", content: {url: currentTab, scripts: response}}, function(message){
          //         if (message == "updated" || message == "added"){
          //           this.disabled = false;
          //         }

          //       });

             
          //   })

          //   //the buttons


          //   // if cutomize button is clicked"
          //     //save button appears
          //     //hide the buttons
          //     //once saved 
          //       //remove the save button ans the red buttons appears
          //   $('.modes').click(function() {
          //     if(customMode.checked){
          //       //enable all checkboxes
          //       for (input of listCheckBoxes){
          //         input.disabled = false;
          //       } 
          //       //add save button
          //       bodyContainer.insertBefore(saveButton,accordian);
          //       $('.checkbox-script').click(function(){
          //         var scriptName = this.parentNode.previousSibling.innerText;
          //         var scriptElement = response.get(scriptName);
          //         let statusScript;
          //         if($(this).is(':checked')) {
          //           statusScript  = 0;
          //         }
          //         else{
          //           statusScript  = 1;

          //         } 
                  
          //         response.set(scriptName, {label: scriptElement.label, status: !statusScript})
          //         console.log("updated response", response)
          //       })
          //     }
          //     else{
          //       if(defaultMode.checked){
          //         for (input of listCheckBoxes){
          //           input.disabled = true;
          //         }
          //         var saveCustomButton = document.getElementById("saveCustomContainer")
          //         if (saveCustomButton){
          //           bodyContainer.removeChild(saveCustomButton);
          //         }
          //       }
          //     }
          //   })
          // })

        });
  });
});