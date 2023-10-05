const fs = require('fs');


const pdfData = [
 
];


const pdfDirectory = './application';


function downloadAndSavePDFs(pdfData) {
    pdfData.forEach((pdf) => {
        // Check if the documentCode is "ABST"
        if (pdf.documentCode === 'ABST') {
            // Extract the pdfUrl from the JSON data
            const pdfUrl = pdf.pdfUrl;


            const completePdfUrl = `https://ped.uspto.gov/api/queries/cms/${pdfUrl}`;

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


downloadAndSavePDFs(pdfData);
