import { param } from 'express-validator';
import fileType from 'file-type';

const uploadPDF = [
    param('fileType')
        .isString()
        .isIn(['cv', 'coverLetter', 'essay', 'grades'])
        .custom(async function(fileTypeParam, { req }) {
            const file = req.files.file;

            if (!file || !file.data) {
                throw new Error('no file');
            }

            if (file.truncated) {
                throw new Error('too large');
            }

            const buffer = file.data;

            if (buffer == null || buffer.byteLength < 512) {
                throw new Error('no data');
            }

            if (((await fileType.fromBuffer(buffer) || { 'mime': '' }).mime) !== 'application/pdf') {
                throw new Error('not pdf');
            }

            return true;
        }),
];

export { uploadPDF };
