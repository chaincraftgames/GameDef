// Fetch data from URL, file path, or string
import axios, { AxiosResponse } from 'axios';
// import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const fetchData = async (input: string): Promise<string> => {
    // Check if input is a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
        // const response = await fetch(input);
        // return await response.text();
        return await axios.get(input)
            .then((response: AxiosResponse) => {
                return response.data;
            })
            .catch((error: Error) => {
                console.error(`Error fetching data from ${input}`, error);
            });
    } 
    // Check if input is a file path
    else if (fs.existsSync(input)) {
        return fs.readFileSync(input, 'utf8');
    } 
    // Check if input is a file path relative to the current file
    else if (fs.existsSync(path.resolve(__dirname, input))) {
        return fs.readFileSync(path.resolve(__dirname, input), 'utf8');
    }
    // Assume input is a string
    else {
        return input;
    }
}