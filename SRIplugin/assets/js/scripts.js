Constants = {};
var checkbox = {
  1: "<span class='green'></span>",
  0: "<span class='red'></span>",
};
Constants.labels = {
  Marketing: 0,
  CDN: 1,
  "Tag Manager": 2,
  Video: 3,
  "Customer Success": 4,
  Uility: 5,
  Advertising: 6,
  Analytics: 7,
  Hosting: 8,
  Content: 9,
  Social: 10,
  Others: 11,
  Critical: 12,
  Noncritical: 13,
};

var customFlag = 0;
var URLmode;
var currentTab;
var labels = [
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

document.addEventListener(
  "DOMContentLoaded",
  function () {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(function (tabs) {
        currentTab = tabs[0].url; // there will be only one in this array
      });
  },
  false
);

window.addEventListener("DOMContentLoaded", () => {
  // ...query for the active tab...
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      // ...and send a request for the DOM info...
      browser.tabs
        .sendMessage(
          tabs[0].id,
          { from: "popup", subject: "DOMInfo" }
          // ...also specifying a callback to be called
          //    from the receiving end (content script).
        )
        .then((response) => {
          console.log(
            "Scripts to be displayed",
            JSON.stringify(Array.from(response.entries())),
            response
          );
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
            scriptwrapper.innerHTML =
              "<div class='card z-depth-0 bordered'> \
            <div class='card-header' id='heading" +
              label.replace(" ", "") +
              "'>\
              <h5 class='mb-0'>\
                <button style= 'width: 100%;'class='btn btn-link collapsed' type='button' data-toggle='collapse' data-target='#collapse" +
              label.replace(" ", "") +
              "'\
                  aria-expanded='false' aria-controls='collapse" +
              label.replace(" ", "") +
              "'>\
                  " +
              label +
              " \
                </button>  \
              </h5>  \
            </div>  \
            <div id='collapse" +
              label.replace(" ", "") +
              "' class='collapse' aria-labelledby='heading" +
              label.replace(" ", "") +
              "' \
            data-parent='#accordionlabels'> \
              <div class='card-body' id ='scriptsListHere" +
              label.replace(" ", "") +
              "'> \
             </div> \
            </div> \
          </div>";
            div.appendChild(scriptwrapper);
            var place = document.getElementById(
              "scriptsListHere" + label.replace(" ", "")
            );
            for (let [key, value] of response) {
              if (value.label === label) {
                document.getElementById(
                  "collapse" + label.replace(" ", "")
                ).className = "collapse show";
                // place.innerText = place.innerText + key +"/n";
                place.innerHTML =
                  place.innerHTML +
                  "<div style='padding:2px;' class = 'row'> <div  class = 'col-11' style = 'overflow:hidden; white-space: nowrap;'> <a href='' title='" +
                  key +
                  "' style='background-color:#FFFFFF;color:#000000;text-decoration:none'>" +
                  key +
                  "<a></div><div class ='col-1'> " +
                  checkbox[value.status] +
                  "</div> </div>";
              }
            }
          }

          $(document).ready(function () {
            async function closeSelf() {
              // const { id: windowId, } = (await browser.windows.getCurrent());
              // return browser.windows.remove(windowId);
              window.close();
            }
            //saves the settings
            $("#reload").click(function () {
              browser.tabs.reload(tabs[0].id, { bypassCache: true });
              closeSelf();
            });
          });
        });
    }
  );
});
