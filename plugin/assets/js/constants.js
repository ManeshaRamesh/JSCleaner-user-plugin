var defaultLabels = [];
var labels = ['Advertising','Analytics', 'Social', 'Video', 'Utility', 'Hosting', 'Marketing', 'Customer Success', 'Content', 'CDN', 'Tag Manager', 'Others']
// chrome.storage.local.get(['default'], function(result) {
//     var obj;
//     console.log("default: ", result); 
//     if (!result.default){ //if not in google storage 

//         // console.log("does not exist", result.key)
//         var settingDefault = []
//         labels.forEach((element) =>{
//             obj ={
//                 label: element,
//                 status: 1
//             }
//             settingDefault.push(obj)// enables all scripts - does not block anything unless set otherwise
//         })


//         console.log("default setting", settingDefault)
//         chrome.storage.local.set({default: settingDefault}, function() { }) //store default settings in chrome storage     
//         defaultLabels = settingDefault;
//     }
//     else{
//         console.log("exists", result.key)
//         defaultLabels = result.default;
//     }

 
//   });

function setdefaultLabels(value){
    return new Promise((resolve, reject)=>{
        defaultLabels = value;
        resolve(defaultLabels);
    })
    

}
export {
    defaultLabels, 
    setdefaultLabels
};
