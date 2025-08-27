let enableExtension = true;
let forceBestQuality = false;

function getNormalizedImageUrl(url) {
    // Create a normalized version of the image URL by removing the size suffix
    return url.replace(/_(full|large|medium|small)(?=\.\w+)/, "");
}

async function findBestImage(normalizedUrl) {
    // Make sure we have a normalized URL
    const match = normalizedUrl.match(/^(.*?)(\.\w+)(\?.*)?$/);
    if (!match) return normalizedUrl;

    // Extract the base, extension, and query string
    const base = match[1];
    const ext = match[2];
    const query = match[3] || "";

    // Define the variants to check, ordered from highest to lowest quality
    const variants = [
        base + "_full" + ext + query,
        base + "_large" + ext + query,
        base + "_medium" + ext + query,
        base + "_small" + ext + query
    ];

    // Check each variant URL
    for (let url of variants) {
        try {
            const res = await fetch(url, { method: "HEAD" });

            if (res.ok) {
                return url;
            }
        } catch (e) {}
    }

    // If no variant was found, fall back to the original URL
    return normalizedUrl;
}

function insertImage(url) {
    // Create an image element and set its properties
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Thumbnail";
    img.style.width = "150px";
    img.style.display = "inline";
    img.style.float = "right";

    // Insert the image into the sidebar
    const parent = document.querySelector('dl[class="sidestats"]');
    parent.insertBefore(img, parent.firstChild);
}

function fixScoreDisplay() {
    // Select the sidebar stats
    const sidestats = document.querySelector('dl[class="sidestats"]');

    // Get the current score and percentage (percentage is used by the CSS)
    const numeric_score = document.getElementById("score_number").textContent;
    const stars = document.querySelector('span[class="star-variable"]');
    const percentage_score = stars.firstChild.style.width;

    // Remove the old score display
    const old_dd = document.querySelector("dd:last-of-type");
    if (old_dd) {
        sidestats.removeChild(old_dd);
    }

    // Create a new score display
    const new_dd = document.createElement("dd");

    // Create the score number element
    const score_number = document.createElement("span");
    score_number.id = "score_number";
    score_number.textContent = numeric_score;
    new_dd.appendChild(score_number);

    // Create the score divider element
    const divider = document.createElement("span");
    divider.textContent = " / 5";
    divider.style.fontSize = "80%";
    new_dd.appendChild(divider);

    // Create the star rating element
    const star_span = document.createElement("span");
    star_span.style.width = percentage_score;

    // Create the star variable element
    const star_variable = document.createElement("span");
    star_variable.className = "star-variable";
    star_variable.style.marginLeft = "15px";
    star_variable.style.marginRight = "20px";
    star_variable.appendChild(star_span);

    // Append the star variable and new dd element to the sidebar
    sidestats.appendChild(new_dd);
    sidestats.appendChild(star_variable);
}

function injectArtwork() {
    // Check if the extension is enabled
    if (!enableExtension) return;

    // Get the image tag
    const image_tag = document.querySelector('meta[property="og:image"]');

    if (image_tag) {
        // Normalize the image URL
        const cleaned_url = getNormalizedImageUrl(image_tag.content);

        if (forceBestQuality) {
            // Find the best quality image
            const best_quality_url = findBestImage(cleaned_url);

            // Wait for the best quality URL to be found
            best_quality_url.then(function (url) {
                // Insert the image and fix the score display
                insertImage(url);
                fixScoreDisplay();
            });
        } else {
            // Insert the image and fix the score display
            insertImage(cleaned_url);
            fixScoreDisplay();
        }
    } else {
        console.warn("No og:image meta tag found.");
    }
}

function startExtension() {
    if (!enableExtension) return;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectArtwork);
    } else {
        injectArtwork();
    }
}

// Apply settings from storage first
chrome.storage.sync.get(['enableExtension', 'forceBestQuality'], (data) => {
    if (data.enableExtension !== undefined) enableExtension = data.enableExtension;
    if (data.forceBestQuality !== undefined) forceBestQuality = data.forceBestQuality;

    if (enableExtension) startExtension();
});

// Listen for live changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        if (changes.enableExtension) {
            enableExtension = changes.enableExtension.newValue;

            if (enableExtension) {
                // Inject artwork immediately
                startExtension();
            } else {
                // Refresh page to restore it to original state
                location.reload();
            }
        }
    }
});
