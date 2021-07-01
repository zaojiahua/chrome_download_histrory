import ext from "./utils/ext";

console.log('ok! ');
// var extractTags = () => {
//   var url = document.location.href;
//   if(!url || !url.match(/^http/)) return;

//   var data = {
//     title: "",
//     description: "",
//     url: document.location.href
//   }

//   var ogTitle = document.querySelector("meta[property='og:title']");
//   if(ogTitle) {
//     data.title = ogTitle.getAttribute("content")
//   } else {
//     data.title = document.title
//   }

//   var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
//   if(descriptionTag) {
//     data.description = descriptionTag.getAttribute("content")
//   }

//   return data;
// }

// function onRequest(request, sender, sendResponse) {
//   if (request.action === 'process-page') {
//     sendResponse(extractTags())
//   }
// }

// ext.runtime.onMessage.addListener(onRequest);

// chrome.tabs.getCurrent(function(tab){
// console.log(tab.title);
// console.log(tab.url);
// })

// chrome.tabs.getSelected(null, function (tab) {
//     console.log(tab.url);
// }); 
