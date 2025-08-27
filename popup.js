// Get the checkboxes
const enableExtensionCheckbox = document.getElementById('enableExtension');
const forceBestQualityCheckbox = document.getElementById('forceBestQuality');

// Synchronize the webpage with the storage
chrome.storage.sync.get(['enableExtension'], (data) => {
    enableExtensionCheckbox.checked = data.enableExtension ?? true;
});

chrome.storage.sync.get(['forceBestQuality'], (data) => {
    forceBestQualityCheckbox.checked = data.forceBestQuality ?? false;
});

// Synchronize the storage with the webpage
enableExtensionCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ enableExtension: enableExtensionCheckbox.checked });
});

forceBestQualityCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ forceBestQuality: forceBestQualityCheckbox.checked });
});
