const fs = require('fs');

// JSON data containing the PDF information
const pdfData = [
 
];

// Directory where PDFs will be saved
const pdfDirectory = './application';

// Function to download and save PDFs
function downloadAndSavePDFs(pdfData) {
    pdfData.forEach((pdf) => {
        // Check if the documentCode is "ABST"
        if (pdf.documentCode === 'ABST') {
            // Extract the pdfUrl from the JSON data
            const pdfUrl = pdf.pdfUrl;

            // Construct the complete PDF URL
            const completePdfUrl = `https://ped.uspto.gov/api/queries/cms/${pdfUrl}`;

            // Generate a filename for the PDF
            const filename = `${pdf.applicationNumberText}_${pdf.documentCode}.pdf`;

            // Download and save the PDF
            fetch(completePdfUrl)
                .then((response) => response.buffer())
                .then((pdfBuffer) => {
                    fs.writeFileSync(`${pdfDirectory}/${filename}`, pdfBuffer);
                    console.log(`Downloaded and saved: ${filename}`);
                })
                .catch((error) => {
                    console.error(`Error downloading or saving ${filename}: ${error.message}`);
                });
        }
    });
}

// Call the function to download and save PDFs
downloadAndSavePDFs(pdfData);
