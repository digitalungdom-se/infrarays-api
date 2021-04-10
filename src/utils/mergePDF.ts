import { PDFDocument, PageSizes, StandardFonts, rgb, degrees } from "pdf-lib";

export async function mergePDFDocuments(documents: Array<Buffer | PDFDocument>): Promise<PDFDocument> {
  const mergedPdf = await PDFDocument.create();

  for (let document of documents) {
    if (Buffer.isBuffer(document)) {
      try {
        document = await PDFDocument.load(document);
      } catch (e) {
        document = await PDFDocument.create();
        const helvetica = {
          normal: await document.embedFont(StandardFonts.Helvetica),
          bold: await document.embedFont(StandardFonts.HelveticaBold),
        };

        const errorPage = document.addPage(PageSizes.A4);
        const pageDimensions = errorPage.getSize();

        errorPage.drawText("ERROR LOADING THIS DOCUMENT!", {
          x: 50,
          y: pageDimensions.height / 2,
          size: 50,
          font: helvetica.bold,
          color: rgb(0.95, 0.1, 0.1),
          rotate: degrees(-45),
        });
      }
    }

    const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return mergedPdf;
}
