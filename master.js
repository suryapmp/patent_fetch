const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Define the base URL
const baseUrl = 'https://patents.tvornica.net/api';

// Define the login endpoint URL
const loginUrl = `${baseUrl}/login/`;

// Define the login parameters
const loginData = {
    email: 'swagger_patents@dev-morgancode.com', // Replace with your email
    password: 'QppuycgwcHa9pYmpoZZe', // Replace with your password
};

// Define the access token file path
const accessTokenFilePath = path.join(__dirname, 'login_responses', 'login_response.json');

// Define the headers with bearer authentication
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

// Function to read the access token from the login response
function readAccessToken() {
    try {
        const loginResponse = JSON.parse(fs.readFileSync(accessTokenFilePath, 'utf-8'));
        return loginResponse.access;
    } catch (error) {
        console.error('Error reading access token:', error.message);
        return null;
    }
}

// Function to send a login request and store the response
async function sendLoginRequest() {
    try {
        const response = await axios.post(loginUrl, loginData);

        if (response.status === 200) {
            const responseData = response.data;
            fs.writeFileSync(accessTokenFilePath, JSON.stringify(responseData, null, 4));
            console.log('Login response stored successfully.');

            //sendAuthrequest()
            //call send auth request function
            // After successful login, retrieve documents using the access token
            retrieveDocuments();
        } else {
            console.error('Failed to send login request.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        
    }
}

// function to get authorize
async function sendAuthrequest() {
    try {
        if (!accessToken) {
            await getAccessToken();
        }

        const authorizedEndpoint = `${baseUrl}/login`;

        access token
        const headers = {
            'Authorization': `Bearer ${accesstoken}`
        };

        const requestData = {

        };
        
        const response = await axios.post(authorizedEndpoint, responseData, { headers });

        console.log('Response', response.data)
    }
}

// Function to send a request to retrieve documents
async function retrieveDocuments() {
    try {
        // Read the access token
        const accessToken = readAccessToken();

        if (!accessToken) {
            console.error('Access token not found. Please run the login module first.');
            return;
        }

        // Define the endpoint URL
        const documentsUrl = `${baseUrl}/download-available-documents/`;

        // Define the request data
        const requestData = {
            numbers: '10000007', // Replace with the desired numbers
            date_from: '1990-10-03',
            date_to: '2023-10-03',
            document_code: 'ABST', // Replace with the desired document code
            desired_apps_extended_info: false,
        };

        // Set the bearer token in the headers
        headers.Authorization = `Bearer ${accessToken}`;

        // Send the request
        const response = await axios.post(documentsUrl, requestData, { headers });

        if (response.status === 200) {
            // Extract the download URL for the zip file
            const downloadUrl = response.data.results.download_all_documents_as_zip.url;

            // Define the folder path to store the zip file
            const zipFolder = path.join(__dirname, 'zip_responses');
            const zipFilePath = path.join(zipFolder, 'downloaded.zip');

            // Create the zip_responses folder if it doesn't exist
            if (!fs.existsSync(zipFolder)) {
                fs.mkdirSync(zipFolder);
            }

            // Download the zip file
            const writer = fs.createWriteStream(zipFilePath);
            const responseStream = await axios({
                method: 'GET',
                url: downloadUrl,
                responseType: 'stream',
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });

            responseStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log('Zip file downloaded successfully.');
        } else {
            console.error('Failed to retrieve documents.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the function to send the login request and store the response
sendLoginRequest();
/Users/surya / Documents / patents fetch / project 1 / master.js