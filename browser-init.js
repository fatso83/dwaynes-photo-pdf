const buildPdf = require("./build-pdf");
const PDFObject = require("pdfobject");

/**
 * Track mouse relative to some element
 *
 * TODO: Add preview/embed functionality and use the preview
 * to get exact pixel offsets for the input boxes
 * Typically, some kind of hover effect for the mouse showing (X,Y)
 */
function getRelativeCoordinates(event, element) {
  const position = {
    x: event.pageX,
    y: event.pageY
  };

  const offset = {
    left: element.offsetLeft,
    top: element.offsetTop
  };

  let reference = element.offsetParent;

  while (reference != null) {
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent;
  }

  return {
    x: position.x - offset.left,
    y: position.y - offset.top
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
//const a = document.createElement("a");
//document.body.appendChild(a);
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

function initEventHandlers() {
  const el = document.getElementById("input-form");
  el.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // builds a map of the value and where to put it
    var dataMap = {};
    for (const entry of formData.entries()) {
      const [key, val] = entry;
      const match = key.match(/([^-]*)(-([xy]))?/);
      if (match) {
        var keyName = match[1];
        initKey(dataMap, keyName);

        const posXY = match[3];
        if (posXY) dataMap[keyName][posXY] = Number(val);
        else dataMap[keyName].val = val;
      }
    }

    buildPdf(getAsset, saveAsFile, dataMap);
  });

  el.addEventListener("focus", () => {
    a.style = "display: none";
  });
}

initEventHandlers();
