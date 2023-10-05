const fs = require('fs');
const axios = require('axios');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const base_url = 'https://patents.tvornica.net/api';
const endpoint = '/download-available-documents/';

// Function to fetch and store access token
async function fetchAccessToken() {
    const access_token_path = 'login/login_response.json'; // Update with the actual path
    let access_token;

    try {
        if (fs.existsSync(access_token_path)) {
            const access_token_data = JSON.parse(fs.readFileSync(access_token_path));
            access_token = access_token_data.access_token;
        }

        if (!access_token) {
            console.log('Access token not found. Fetching it now...');

            // Update with your email and password
            const loginData = {
                email: 'swagger_patents@dev-morgancode.com',
                password: 'QppuycgwcHa9pYmpoZZe',
            };

            const loginResponse = await axios.post(`${base_url}/login/`, loginData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (loginResponse.status === 200) {
                access_token = loginResponse.data.access;
                fs.writeFileSync(access_token_path, JSON.stringify({ access_token }, null, 2));
                console.log('Access token fetched and stored successfully.');
            } else {
                console.error(`Failed to fetch access token. Status code: ${loginResponse.status}`);
                console.error(loginResponse.data);
            }
        } else {
            console.log('Access token found. Using existing access token.');
        }

        return access_token;
    } catch (error) {
        console.error(`Error fetching access token: ${error.message}`);
        return null;
    }
}

// Function to download and store documents
async function downloadDocuments(access_token, application_number, document_code) {
    try {
        const headers = {
            'Authorization': `Bearer ${access_token}`,
        };

        const data = {
            numbers: application_number,
            date_from: '1990-10-02',
            date_to: '2023-10-02',
            document_code: document_code,
            desired_apps_extended_info: false,
        };

        const response = await axios.post(`${base_url}${endpoint}`, data, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            responseType: 'json',
        });

        if (response.status === 200) {
            const response_filename = `response_${application_number}_${document_code}.json`;
            const response_path = `parameters/${response_filename}`; // Update with the actual path
            fs.writeFileSync(response_path, JSON.stringify(response.data, null, 2));
            console.log(`Response stored in ${response_path}`);

            const document_data = response.data.results.available_applications[0][0].documents[0];
            const document_url = document_data.url;

            if (document_url) {
                const parsed_url = new URL(document_url);
                const filename = decodeURIComponent(parsed_url.pathname.split('/').pop());
                const document_dir = `${application_number}/${document_code}`;

                // Create the subdirectory for the application number if it doesn't exist
                fs.mkdirSync(document_dir, { recursive: true });

                const download_path = `${document_dir}/${document_code}.pdf`;
                const document_response = await axios.get(document_url, {
                    responseType: 'stream',
                });

                if (document_response.status === 200) {
                    document_response.data.pipe(fs.createWriteStream(download_path));
                    console.log(`Downloaded ${filename} successfully to ${download_path}`);
                } else {
                    console.error(`Failed to download the document with status code ${document_response.status}`);
                }
            } else {
                console.error('Document URL not found in the stored response.');
            }
        } else {
            console.error(`Request failed with status code ${response.status}`);
            console.error(response.data);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Input application number and document code from the user
readline.question('Enter the application number: ', (application_number) => {
    readline.question('Enter the document code: ', (document_code) => {
        readline.close();

        // Fetch access token and download documents
        fetchAccessToken().then((access_token) => {
            if (access_token) {
                downloadDocuments(access_token, application_number, document_code);
            }
        });
    });
});
