import { PDFDocument } from "pdf-lib";

export async function mergePDFDocuments(documents: Array<Buffer | PDFDocument>): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (let document of documents) {
    if (Buffer.isBuffer(document)) {
      document = await PDFDocument.load(document);
    }

    const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}
