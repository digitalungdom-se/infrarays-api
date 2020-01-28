import fs from 'fs-extra';
import path from 'path';
import pdfParse from 'pdf-parse';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const imageBuffer = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'images', 'star.png'));
const imageBase64 = imageBuffer.toString('base64');

async function generatePdf(docDefinition: pdfMake.TDocumentDefinitions): Promise<Buffer> {
    return new Promise(function(resolve, reject) {
        try {
            pdfMake.createPdf(docDefinition).getBuffer(function(buffer) {
                resolve(buffer);
            });
        } catch (e) {
            reject(e);
        }
    });
}

interface IUserDetails {
    email: string;
    name: string;
    birthdate: Date;
    finnish: string;
    city: string;
    school: string;
}

interface IFileDetails {
    coverLetter: Buffer;
    essay: Buffer;
}

type recommendationLettersDetails = Array<string>;

export default async function(user: IUserDetails, recommendationLetters: recommendationLettersDetails, files: IFileDetails): Promise<Buffer> {
    let wordsCoverLetter = 0;
    if (files.coverLetter) {
        wordsCoverLetter = (await pdfParse(files.coverLetter)).text.replace(/[.,?!;()"'-]/g, ' ').replace(/\s+/g, ' ').toLowerCase().split(' ').length;
    }

    let wordsEssay = 0;
    if (files.essay) {
        wordsEssay = (await pdfParse(files.essay)).text.replace(/[.,?!;()"'-]/g, ' ').replace(/\s+/g, ' ').toLowerCase().split(' ').length;
    }

    user.city = user.city || '-';
    user.school = user.school || '-';

    const toAdd = 3 - recommendationLetters.length;
    for (let i = 0; i < toAdd; i++) {
        recommendationLetters.push('-');
    }

    const description = {
        'content': [
            { 'image': 'star', 'width': 25, 'absolutePosition': { 'x': 10, 'y': 10 } },
            { 'text': [{ 'text': 'RAYS APPLICATION: ', 'bold': true, 'fontSize': 18 }] },
            { 'text': [{ 'text': 'Name: ', 'bold': true }, `${user.name}`] },
            { 'text': [{ 'text': 'Email: ', 'bold': true }, `${user.email}`] },
            { 'text': [{ 'text': 'Born: ', 'bold': true }, `${user.birthdate.toDateString()}`] },
            { 'text': [{ 'text': 'Finnish: ', 'bold': true }, `${user.finnish}`] },
            { 'text': [{ 'text': 'City: ', 'bold': true }, `${user.city}`] },
            { 'text': [{ 'text': 'School: ', 'bold': true }, `${user.school}`] },
            { 'text': [{ 'text': 'Word count cover letter~: ', 'bold': true }, ` ${wordsCoverLetter}`] },
            { 'text': [{ 'text': 'Word count essays~: ', 'bold': true }, ` ${wordsEssay}`] },
            { 'text': [{ 'text': 'Recommendation letter from:', 'bold': true }, ` ${recommendationLetters[0]}`] },
            { 'text': [{ 'text': 'Recommendation letter from:', 'bold': true }, ` ${recommendationLetters[1]}`] },
            { 'text': [{ 'text': 'Recommendation letter from:', 'bold': true }, ` ${recommendationLetters[2]}`] },
        ],
        'images': {
            'star': `data:image/png;base64,${imageBase64}`,
        },
    };
    return generatePdf(description);
}
