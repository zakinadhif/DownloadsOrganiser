let folderMap = {};

// Load mappings on startup
chrome.storage.sync.get('folderMap', (data) => {
    if (data.folderMap) {
        folderMap = data.folderMap;
    }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.folderMap) {
        folderMap = changes.folderMap.newValue || {};
    }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    try {
        // Organize downloads by the site's hostname (e.g., for CTF sites)
        // Prioritize referrer to group files by the CTF site
        const urlStr = downloadItem.referrer || downloadItem.finalUrl || downloadItem.url;

        if (urlStr) {
            const url = new URL(urlStr);
            let hostname = url.hostname;
        
            console.log(hostname);

            // Remove 'www.' prefix if present
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }
            
            // Check if domain is in the map (Whitelist / Active List)
            if (folderMap && folderMap[hostname]) {
                 const folderName = folderMap[hostname];
                 const newFilename = folderName + (folderName.endsWith('/') ? '' : '/') + downloadItem.filename;
                 suggest({filename: newFilename});
            } else {
                // Not in the "Active" list, so we do not organize it.
                 console.log("Domain not in whitelist, skipping organization: " + hostname);
            }
        }
    } catch (error) {
        console.error('Error in redirecting download:', error);
    }
});

chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.error) {
        console.error('Download error:', downloadDelta.error.current);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'updateFolderMap' && request.newFolderMap) {
        // Update the folderMap with the new mappings provided in the request
        folderMap = request.newFolderMap;
        sendResponse({status: 'Folder map updated successfully'});
    }
    
});



