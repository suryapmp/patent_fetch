async function authenticateAndGetAccessToken() {
    const email = 'swagger_patents@dev-morgancode.com';
    const password = 'QppuycgwcHa9pYmpoZZe';

    try {
        // Authenticate and obtain an access token
        const response = await fetch('https://patents.tvornica.net/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`Authentication failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}


async function downloadAbstractWithToken(accessToken, patentNumber) {
    const downloadUrl = 'https://patents.tvornica.net/api/download-available-documents';
    const requestData = {
        numbers: patentNumber,
        date_from: '1990-10-02',
        date_to: '2023-10-02',
        document_code: 'ABST',
        desired_apps_extended_info: false
    };

    try {

        const response = await fetch(downloadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Failed to download abstract document');
        }

        const data = await response.json();
        if (data.download_url) {
            const abstractDownloadURL = data.download_url;

         
            const link = document.createElement("a");
            link.href = abstractDownloadURL;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("The abstract document is not available.");
        }
    } catch (error) {
        console.error('Error downloading abstract document:', error);
        alert("An error occurred while downloading the abstract document.");
    }
}


filedCheckbox.addEventListener('change', async function () {
    subCheckboxes.style.display = filedCheckbox.checked ? 'block' : 'none';


    if (!filedCheckbox.checked) {
        abstractCheckbox.checked = false;
    }
});


abstractCheckbox.addEventListener('change', async function () {
    if (abstractCheckbox.checked) {
        try {
            const accessToken = await authenticateAndGetAccessToken();
            const patentNumber = urlParams.get('patent'); 
            await downloadAbstractWithToken(accessToken, patentNumber);
        } catch (error) {
            console.error(error);
            alert("An error occurred during authentication or while downloading the abstract document.");
        }
    }
});

function downloadPDF() {

    const urlParams = new URLSearchParams(window.location.search);
    const patentNumber = urlParams.get('patent');

    const filedCheckbox = document.getElementById('filedCheckbox');
    const abstractCheckbox = document.getElementById('abstractCheckbox');
    const claimsCheckbox = document.getElementById('claimsCheckbox');
    const specificationCheckbox = document.getElementById('specificationCheckbox');

    if (filedCheckbox.checked) {
        const checkedCheckboxes = [];
        if (specificationCheckbox.checked) checkedCheckboxes.push('SPEC');
        if (abstractCheckbox.checked) checkedCheckboxes.push('ABST');
        if (claimsCheckbox.checked) checkedCheckboxes.push('CLAIM');

        if (checkedCheckboxes.length > 0) {
            const documentCodes = checkedCheckboxes.join('+');
            const redirectURL = `https://ped.uspto.gov/api/queries/cms/public/${patentNumber}?document_code=${documentCodes}`;
            window.location.href = redirectURL;
        } else {
            alert("Please select at least one document type to download (Specification, Abstract, or Claim).");
        }
    } else {
        alert("Please select 'Patent as Filed' and at least one document type to download (Specification, Abstract, or Claim).");
    }
}




