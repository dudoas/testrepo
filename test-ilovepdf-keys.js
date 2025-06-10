// test-ilovepdf-keys.js

require('dotenv').config(); // For loading environment variables
const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Your iLovePDF API Credentials
// IMPORTANT: Replace 'YOUR_PUBLIC_KEY_HERE' and 'YOUR_SECRET_KEY_HERE'
// with the actual keys you are using on Render.
const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC_KEY || 'project_public_b6af284ba4657b765bda9642fa52c9de_5RQddad3276adf8db49d3a930eb02c8c02b5f';
const SECRET_KEY = process.env.ILOVEPDF_SECRET_KEY || 'secret_key_2a0217fc266e99caf40058ae2a7de552_Ryavie511fe4fe744a1ce6bc9968355440b53';

async function testIlovepdfKeys() {
    console.log("Starting iLovePDF API key test...");
    console.log("Using Public Key (first 10 chars):", PUBLIC_KEY.substring(0, 10) + '...');

    let tempFilePaths = [];

    try {
        // 1. Create dummy PDF files for testing
        // Minimal valid PDF content (can be replaced with actual tiny PDFs if preferred)
        const dummyPdfContent1 = Buffer.from(
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\ntrailer<</Size 4/Root 1 0 R>>startxref\n165\n%%EOF", 'ascii'
        );
        const dummyPdfContent2 = Buffer.from(
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\ntrailer<</Size 4/Root 1 0 R>>startxref\n165\n%%EOF", 'ascii'
        );

        const dummyFileName1 = `dummy1_${Date.now()}.pdf`;
        const dummyFileName2 = `dummy2_${Date.now()}.pdf`;

        const tempPath1 = path.join(os.tmpdir(), dummyFileName1);
        const tempPath2 = path.join(os.tmpdir(), dummyFileName2);
        const outputPath = path.join(os.tmpdir(), `merged_test_${Date.now()}.pdf`);

        await fs.writeFile(tempPath1, dummyPdfContent1);
        await fs.writeFile(tempPath2, dummyPdfContent2);
        
        tempFilePaths.push(tempPath1, tempPath2, outputPath); // Add to cleanup list

        console.log(`Created dummy PDF 1 at: ${tempPath1}`);
        console.log(`Created dummy PDF 2 at: ${tempPath2}`);

        // 2. Initialize iLovePDF API instance and task
        const instance = new ILovePDFApi(PUBLIC_KEY, SECRET_KEY);
        const task = instance.newTask('merge');
        console.log("iLovePDF merge task created.");

        // 3. Start the task
        await task.start();
        console.log("iLovePDF merge task started.");

        // 4. Add files
        await task.addFile(new ILovePDFFile(tempPath1));
        await task.addFile(new ILovePDFFile(tempPath2));
        console.log("Dummy files added to task.");

        // 5. Process the task
        await task.process();
        console.log("Task processing initiated.");

        // 6. Download the result
        const resultBuffer = await task.download();
        await fs.writeFile(outputPath, resultBuffer);
        console.log(`Successfully downloaded merged PDF to: ${outputPath}`);

        await task.delete(); // Clean up task on iLovePDF server
        console.log("iLovePDF task completed successfully. Your API keys are working!");
        console.log("You can check the merged file at:", outputPath);

    } catch (error) {
        console.error("iLovePDF API Test FAILED!");
        console.error("=========================");
        
        let detailedError = "No specific error details from iLovePDF API.";

        if (error.response && error.response.data) {
            console.error("iLovePDF API Response Data:", error.response.data);
            detailedError = error.response.data.error_description || error.response.data.error || detailedError;
        } else if (error.message) {
            detailedError = error.message;
        }

        console.error(`Error: ${detailedError}`);
        console.error("This usually means your API keys are incorrect, expired, or you've hit a usage limit.");
        console.error("Please double-check your PUBLIC_KEY and SECRET_KEY in the script/environment variables.");

    } finally {
        // Clean up temporary files
        for (const filePath of tempFilePaths) {
            try {
                await fs.unlink(filePath);
                console.log(`Cleaned up temporary file: ${filePath}`);
            } catch (cleanupError) {
                // console.error(`Failed to clean up temporary file ${filePath}:`, cleanupError.message);
                // Suppress cleanup error logging, as it's not critical for the test itself
            }
        }
        console.log("Test script finished.");
    }
}

testIlovepdfKeys();
