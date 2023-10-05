function authenticateAndGetAccessToken() {
    const email = 'swagger_patents@dev-morgancode.com';
    const password = 'QppuycgwcHa9pYmpoZZe';

    return fetch('https://patents.tvornica.net/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Authentication failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => data.access_token)
        .catch(error => {
            console.error('Authentication error:', error);
            throw error;
        });
}

function downloadAbstractWithToken(accessToken, patentNumber) {
    const downloadUrl = 'https://patents.tvornica.net/api/download-available-documents';
    const requestData = {
        numbers: patentNumber,
        date_from: '1990-10-02',
        date_to: '2023-10-02',
        document_code: 'ABST',
        desired_apps_extended_info: false
    };

    return fetch(downloadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to download abstract document');
            }
            return response.json();
        })
        .then(data => {
            if (data.download_url) {
                const abstractDownloadURL = data.download_url;

     
                return fetch(abstractDownloadURL);
            } else {
                throw new Error("The abstract document is not available.");
            }
        })
        .then(abstractResponse => {
            if (abstractResponse.ok) {
                return abstractResponse.blob();
            } else {
                throw new Error("Failed to fetch the abstract document.");
            }
        })
        .then(abstractBlob => {
            const abstractFile = new Blob([abstractBlob], { type: 'application/pdf' });

       
            const abstractURL = URL.createObjectURL(abstractFile);

   
            console.log('Abstract Document URL:', abstractURL);
        })
        .catch(error => {
            console.error('Error downloading abstract document:', error);
            alert("An error occurred while downloading the abstract document.");
        });
}

// Function to handle the downloadPDF logic
function downloadPDF() {
    // Get the patent number from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const patentNumber = urlParams.get('patent');

    authenticateAndGetAccessToken()
        .then(accessToken => downloadAbstractWithToken(accessToken, patentNumber))
        .catch(error => {
            console.error(error);
            alert("An error occurred during authentication or while downloading the abstract document.");
        });
}
