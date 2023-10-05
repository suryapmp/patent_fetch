function downloadPDF() {
    // Get the patent number from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const patentNumber = urlParams.get('patent');

    // Generate the URL for downloading the granted patent PDF
    const grantedDownloadURL = `https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/${patentNumber}`;

    // Generate the URL based on the patent number for the USPTO Patent Center application
    const patentCenterURL = `https://patentcenter.uspto.gov/applications/${patentNumber}/ifw/docs?application=${patentNumber}`;

    // Checkboxes for sub-document types
    const abstractCheckbox = document.getElementById('abstractCheckbox');
    const claimsCheckbox = document.getElementById('claimsCheckbox');
    const specificationCheckbox = document.getElementById('specificationCheckbox');

    // If "Patent as Filed" is checked
    if (filedCheckbox.checked) {
        // Determine which checkboxes are checked
        const checkedCheckboxes = [];
        if (specificationCheckbox.checked) checkedCheckboxes.push('SPEC');
        if (abstractCheckbox.checked) checkedCheckboxes.push('ABST');
        if (claimsCheckbox.checked) checkedCheckboxes.push('CLAIM');

        if (checkedCheckboxes.length > 0) {
            // Build the document codes string for the URL
            const documentCodes = checkedCheckboxes.join('+');

            // Redirect the user to the URL with the dynamically changed patent number
            const redirectURL = `https://ped.uspto.gov/api/queries/cms/public/${patentNumber}?document_code=${documentCodes}`;
            window.location.href = redirectURL;
        } else {
            alert("Please select at least one document type to download (Specification, Abstract, or Claim).");
        }
    } else if (grantedCheckbox.checked) {
        // Initiate the download of the granted patent without navigating to the URL
        const link = document.createElement("a");
        link.href = grantedDownloadURL;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Please select 'Patent as Filed' and at least one document type to download (Specification, Abstract, or Claim).");
    }
}

// Event listener for the "Patent as Filed" checkbox to show/hide sub-checkboxes
filedCheckbox.addEventListener('change', function () {
    subCheckboxes.style.display = filedCheckbox.checked ? 'block' : 'none';

    // Clear the Abstract checkbox when hiding sub-checkboxes
    if (!filedCheckbox.checked) {
        abstractCheckbox.checked = false;
    }
});

// Event listener for the "Abstract" checkbox to download the abstract document
abstractCheckbox.addEventListener('change', function () {
    if (abstractCheckbox.checked) {
        // Fetch the JSON response
        fetch(`https://ped.uspto.gov/api/queries/cms/public/${patentNumber}`)
            .then(response => response.json())
            .then(data => {
                // Check if the response contains the abstract document
                if (data.documentCode === "ABST" && data.pdfUrl) {
                    // Generate the URL for downloading the abstract PDF
                    const abstractDownloadURL = `https://ped.uspto.gov/api/queries/cms/${data.pdfUrl}`;

                    // Initiate the download of the abstract PDF
                    const link = document.createElement("a");
                    link.href = abstractDownloadURL;
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert("The abstract document is not available.");
                }
            })
            .catch(error => {
                console.error("Error fetching the abstract document:", error);
                alert("An error occurred while fetching the abstract document.");
            });
    }
});
