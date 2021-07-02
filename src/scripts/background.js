import ext from "./utils/ext";
import request from "./utils/axios";

ext.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "perform-save") {
            console.log("Extension Type: ", "/* @echo extension */");
            console.log("PERFORM AJAX", request.data);

            sendResponse({ action: "saved" });
        }
    }
);

// 记录下载历史
var download_history = {}

ext.downloads.onCreated.addListener((downloadItem) => {
    ext.tabs.getSelected(null, function(tab) {
        download_history[downloadItem.id] = { 'referrer': tab.url, 'finalUrl': downloadItem.finalUrl }
    });
})

ext.downloads.onChanged.addListener((downloadDelta) => {
    var download_item = download_history[downloadDelta.id]
    if (download_item) {
        if (downloadDelta.error) {
            delete download_history[downloadDelta.id]
        } else if (downloadDelta.filename) {
            download_item['filename'] = downloadDelta.filename.current;
        } else if (downloadDelta.state && downloadDelta.state.current == 'complete') {
            request({
			    url: 'https://api.betaquantity.com/post/download-history',
			    method: 'post',
			    data: download_item
			}).then((responseData) => {
				console.log(responseData);
			});
        }
    }
})
