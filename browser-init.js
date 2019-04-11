const buildPdf = require("./build-pdf");

/** @returns {Uint8Array} the asset as an array of unsigned bytes */
async function getAsset(path) {
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function saveAsFile(fileName, pdfBytes) {
  const blob = new Blob([pdfBytes]);
  const blobUrl = URL.createObjectURL(blob);

  // trigger download - alternatively you could create a link
  // using the fileName passed in as an attribute on the link
  // See https://stackoverflow.com/a/25911218/200987
  //window.location.replace(blobUrl);
  window.open(blobUrl);
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
}

initEventHandlers();
