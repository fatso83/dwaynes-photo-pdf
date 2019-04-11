# Pre-fill Dwayne's Photo Order Forms
> I really hate filling them out, OK?

## Work in progress
This is just a POC as it stands. 
I need to 
- get all/some existing order forms
- find all the offsets for the inputs in each document 
- add calculaton logic, taking values from input form
- etc

Also, would be nice to [embed it on the page as a preview](https://pdfobject.com)

## Demo
[https://dwayne-photo-prefill.fatso83.now.sh](https://dwayne-photo-prefill.fatso83.now.sh)

## Running the Example
```bash
git clone https://github.com/fatso83/dwaynes-photo-pdf
npm install
npm start
```

This will open a webserver [running on port 8080](http://localhost:8080). 
When you fill out the form and press the button on the website the pdf will be generated and
subsequently opened in your browser.

