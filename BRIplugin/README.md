# JSCleaner-machineLearningModel
This is the version of the JSCleaner that used a machine learning model to label scripts
This extension only runs in firefox.

To run this on your computer do the following; 
- Go to about:debugging and turn on developer's mode.
- Click on add tempoary extension
- Navigate to the correct folder and click on start.js
- The icon should appear on your browser's tool bar.
- After making any changes reload the extension on about:debugging


Currently the following has not been implemented:
- To make the blocking happen in the first page load by rerouting

Things to note:
- Currently this plugin does not make get requests to the server (still waiting for access).

If you want to enable or disable scripts, do so on the settings.html page and see which scripts have been blocked on the networks tab of your Dev Tools. 


References: 

https://almanac.httparchive.org/en/2019/third-parties
