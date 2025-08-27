chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // Apply defaults only when first installed
        chrome.storage.sync.set({
            enableExtension: true,
            forceBestQuality: false
        });
    }
});