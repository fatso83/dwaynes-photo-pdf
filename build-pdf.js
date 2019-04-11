const {
  PDFDocumentFactory,
  PDFDocumentWriter,
  StandardFonts,
  drawText,
  drawLinesOfText,
  drawRectangle,
  drawEllipse,
  drawImage
} = require("pdf-lib");

// Returns an object of shape: { width: number, height: number }
// https://github.com/Hopding/pdf-lib/issues/62#issuecomment-453847201
const getPageDimensions = page => {
  let mediaBox;

  // Check for MediaBox on the page itself
  const hasMediaBox = !!page.getMaybe("MediaBox");
  if (hasMediaBox) {
    mediaBox = page.index.lookup(page.get("MediaBox"));
  }

  // Check for MediaBox on each parent node
  page.Parent.ascend(parent => {
    const parentHasMediaBox = !!parent.getMaybe("MediaBox");
    if (!mediaBox && parentHasMediaBox) {
      mediaBox = parent.index.lookup(parent.get("MediaBox"));
    }
  }, true);

  // This should never happen in valid PDF files
  if (!mediaBox) throw new Error("Page Tree is missing MediaBox");

  // Extract and return the width and height
  return { width: mediaBox.array[2].number, height: mediaBox.array[3].number };
};

module.exports = async function buildPdf(getAsset, saveAsFile, data) {
  /* ==================== 1. Read in Fonts and Images ========================= */
  // This step is platform dependent. Node scripts can just read the assets in
  // from the file system. Browsers might need to make HTTP requests for the assets.
  const assets = {
    devPrintInt: await getAsset(
      "assets/Color_Film_Devloping_Prints_International_Shipping.pdf"
    )
  };

  /* ================ 2. Create and Setup the PDF Document ==================== */
  // This step is platform independent. The same code can be used in any
  // JavaScript runtime (e.g. Node, the browser, or React Native).

  const pdfDoc = PDFDocumentFactory.load(assets.devPrintInt);
  const pages = pdfDoc.getPages();

  // Let's define some constants that we can use to reference the fonts and
  // images later in the script.
  const HELVETICA_FONT = "Helvetica";
  const COURIER_FONT = "Courier";

  // Now we embed two standard fonts (Helvetica)
  const [helveticaFontRef, helveticaFont] = pdfDoc.embedStandardFont(
    StandardFonts.Helvetica
  );
  const [courierRef, courierFont] = pdfDoc.embedStandardFont(
    StandardFonts.Courier
  );

  /* ====================== 3. Modify Existing Page =========================== */
  // This step is platform independent. The same code can be used in any
  // JavaScript runtime (e.g. Node, the browser, or React Native).

  // Here we get an array of PDFPage objects contained in the `pdfDoc`. In this
  // case, the tax voucher we loaded has a single page. So this will be an array
  // of length one.

  // Now we'll add the Courier font dictionary and Mario PNG image object that we
  // embedded into the document earlier.
  const existingPage = pages[0].addFontDictionary(COURIER_FONT, courierRef);

  const dims = getPageDimensions(existingPage);

  console.log("First page width:", dims.width);
  console.log("First page height:", dims.height);

  // Here, we define a new "content stream" for the page. A content stream is
  // simply a sequence of PDF operators that define what we want to draw on the
  // page.

  const pdfOperators = Object.keys(data).map(key => {
    const el = data[key];

    return drawLinesOfText([el.val].map(courierFont.encodeText), {
      x: el.x,
      y: el.y,
      font: COURIER_FONT,
      size: 10,
      colorRgb: [0, 0, 0]
    });
  });

  console.log(pdfOperators);

  const newContentStream = pdfDoc.createContentStream(...pdfOperators);

  // Here we (1) register the content stream to the PDF document, and (2) add the
  // reference to the registered stream to the page's content streams.
  existingPage.addContentStreams(pdfDoc.register(newContentStream));

  /* ================= 5. Convert PDF to Bytes ================== */
  // Now we'll convert the `pdfDoc` to a `Uint8Array` containing the bytes of a
  // PDF document. This step serializes the document. You can still make changes
  // to the document after this step, but you'll have to call `saveToBytes` again
  // after doing so.
  //
  // The `Uint8Array` returned here can be used in a number of ways. What you do
  // with it largely depends on the JavaScript environment you're running in.
  const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

  /* ========================== 6. Write PDF to File ========================== */
  // Node environments can save directly to file, whereas browsers might need to
  // turn to more exotic solutions
  const fileName = "pre-filled.pdf";
  saveAsFile(fileName, pdfBytes);
};
