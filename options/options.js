document.addEventListener('DOMContentLoaded', function() {
    const addMappingForm = document.getElementById('addMappingForm');
    const mappingsContainer = document.getElementById('mappingsContainer');
    const howToButton = document.getElementById('howToButton');
    const howToContent = document.getElementById('howToContent');


    function loadMappings() {
        chrome.storage.sync.get('folderMap', function(data) {
            mappingsContainer.innerHTML = '';
            Object.keys(data.folderMap || {}).forEach(ext => {
                const row = document.createElement('tr');

                const extCell = document.createElement('td');
                extCell.textContent = ext;

                const folderCell = document.createElement('td');
                folderCell.textContent = data.folderMap[ext];

                const actionCell = document.createElement('td');
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.onclick = function() {
                    delete data.folderMap[ext];
                    chrome.storage.sync.set({ 'folderMap': data.folderMap }, function() {
                        loadMappings();
                    });
                };
                actionCell.appendChild(removeButton);

                row.appendChild(extCell);
                row.appendChild(folderCell);
                row.appendChild(actionCell);

                mappingsContainer.appendChild(row);
            });
        });
    }

    howToButton.addEventListener('click', function() {
        howToContent.style.display = howToContent.style.display === 'block' ? 'none' : 'block';
    });

    addMappingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let newExt = document.getElementById('newExtension').value.trim(); // This is now the Domain
        const newFolder = document.getElementById('newFolder').value.trim();

        // Normalize domain: remove www.
        if (newExt.startsWith('www.')) {
            newExt = newExt.substring(4);
        }

        if (newExt && newFolder) {
            chrome.storage.sync.get('folderMap', function(data) {
                data.folderMap = data.folderMap || {};
                
                // Allow overwriting or warn? The previous code didn't check for existence on add, 
                // but the code I read earlier had: if (data.folderMap.hasOwnProperty(newExt)) ...
                // Wait, that was popup.js I think. options.js didn't have that check in the snippet I read?
                // Let's check the read content of options.js again.
                
                data.folderMap[newExt] = newFolder;
                chrome.storage.sync.set({ 'folderMap': data.folderMap }, function() {
                    loadMappings();
                    addMappingForm.reset();
                    clearErrorMessage(); 
                });
            });
        } else {
            displayErrorMessage('Both Domain and Folder Name are required.');
        }
    });

    // Function to display error message
    function displayErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block'; // Show the error message
    }

    // Function to clear error message
    function clearErrorMessage() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'none';
    }

    loadMappings();
});
