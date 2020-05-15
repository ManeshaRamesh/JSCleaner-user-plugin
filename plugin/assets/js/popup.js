document.addEventListener('DOMContentLoaded', function() {


    var checkPageButton = document.getElementById('home');
    checkPageButton.addEventListener('click', function() {
        window.location.href="popup.html";
    }, false);
    
    var checkPageButton = document.getElementById('settings');
    checkPageButton.addEventListener('click', function() {
        chrome.tabs.create({ url: "../html/settings.html" });
    }, false);

    var checkPageButton = document.getElementById('scripts');
    if (checkPageButton){
        checkPageButton.addEventListener('click', function() {
            window.location.href="../html/scripts.html";
            // window.location.href="new.html";
            // chrome.browserAction.setPopup({popup: "scripts.html"});
        }, false);
    }
  }, false);

