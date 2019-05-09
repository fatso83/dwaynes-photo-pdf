const buildPdf = require("./build-pdf");
const PDFObject = require("pdfobject");
const pdfElements = {};

/**
 * @param {String} name the element name
 * @param {Number[]} geometry where to place the element
 */
function addPdfElement(name, x, y, value = null) {
  pdfElements[name] = {
    value,
    x,
    y
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/** @returns {Uint8Array} the asset as an array of unsigned bytes */
async function getAsset(path) {
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

const embedTarget = document.getElementById("embed-pdf");
const a = document.getElementById("save-btn");

a.style = "display: none";

let blobUrl;
async function saveAsFile(fileName, pdfBytes) {
  // Revoke the previous to url to free the blob
  if (blobUrl) {
    window.URL.revokeObjectURL(blobUrl);
  }

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  blobUrl = URL.createObjectURL(blob);

  // embed preview
  try {
    PDFObject.embed(blobUrl, embedTarget);
  } catch (err) {
    console.error(err);
  }

  // set up for download
  a.href = blobUrl;
  a.download = fileName;
  a.style = "display: inline";
}

function initKey(map, key) {
  map[key] = map[key] || {};
  map[key].pos = map[key].pos || {};
}

const el = document.getElementById("input-form");
function initEventHandlers() {
  el.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    var dataMap = pdfElements;

    buildPdf(getAsset, saveAsFile, dataMap);
  });

  el.addEventListener("focus", () => {
    a.style = "display: none";
  });
}

initEventHandlers();

addPdfElement("name", 280, 733, "John Doe");
addPdfElement("address", 280, 717, "Kirkeveien 90D");
addPdfElement("city", 280, 701, "Oslo");
addPdfElement("zip", 280, 686, "0370");
addPdfElement("phone", 280, 673, "+47 40065078");
addPdfElement("email", 280, 658, "carlerik@gmail.com");
