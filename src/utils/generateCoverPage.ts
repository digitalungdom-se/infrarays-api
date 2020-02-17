import fs from "fs-extra";
import path from "path";
import pdfParse from "pdf-parse";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const raysStarBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "assets", "images", "star.png"));
const raysStarBase64 = raysStarBuffer.toString("base64");

const duLogoBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "assets", "images", "du_logo.png"));
const duLogoBase64 = duLogoBuffer.toString("base64");

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

interface UserDetails {
    email: string;
    name: string;
    birthdate: Date;
    finnish: string;
    city: string;
    school: string;
}

interface FileDetails {
    coverLetter: Buffer;
    essay: Buffer;
}

type recommendationLettersDetails = Array<string>;

export default async function(user: UserDetails, recommendationLetters: recommendationLettersDetails, files: FileDetails): Promise<Buffer> {
    user.name = user.name
        .toLowerCase()
        .split(" ")
        .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ");

    let wordsCoverLetter = 0;
    if (files.coverLetter) {
        wordsCoverLetter = (await pdfParse(files.coverLetter)).text
            .replace(/[.,?!;()"'-]/g, " ")
            .replace(/\s+/g, " ")
            .toLowerCase()
            .split(" ").length;
    }

    let wordsEssay = 0;
    if (files.essay) {
        wordsEssay = (await pdfParse(files.essay)).text
            .replace(/[.,?!;()"'-]/g, " ")
            .replace(/\s+/g, " ")
            .toLowerCase()
            .split(" ").length;
    }

    if (user.city) {
        user.city = user.city
            .toLowerCase()
            .split(" ")
            .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ");
    } else {
        user.city = "-";
    }

    if (user.school) {
        user.school =
            user.school
                .toLowerCase()
                .split(" ")
                .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(" ") || "-";
    } else {
        user.school = "-";
    }

    const toAdd = 3 - recommendationLetters.length;
    for (let i = 0; i < toAdd; i++) {
        recommendationLetters.push("-");
    }

    const finnish = user.finnish ? "Yes" : "No";

    const description = {
        content: [
            { image: "star", width: 25, absolutePosition: { x: 10, y: 10 } },
            { image: "duLogo", width: 65, absolutePosition: { x: 515, y: 5 } },
            { text: [{ text: "RAYS APPLICATION: ", bold: true, fontSize: 18 }] },
            { text: [{ text: "Name: ", bold: true }, `${user.name}`] },
            { text: [{ text: "Email: ", bold: true }, `${user.email}`] },
            { text: [{ text: "Born: ", bold: true }, `${user.birthdate.toDateString()}`] },
            { text: [{ text: "Application through Finland: ", bold: true }, `${finnish}`] },
            { text: [{ text: "City: ", bold: true }, `${user.city}`] },
            { text: [{ text: "School: ", bold: true }, `${user.school}`] },
            { text: [{ text: "Word count cover letter~: ", bold: true }, ` ${wordsCoverLetter}`] },
            { text: [{ text: "Word count essays~: ", bold: true }, ` ${wordsEssay}`] },
            { text: [{ text: "Recommendation letter from:", bold: true }, ` ${recommendationLetters[0]}`] },
            { text: [{ text: "Recommendation letter from:", bold: true }, ` ${recommendationLetters[1]}`] },
            { text: [{ text: "Recommendation letter from:", bold: true }, ` ${recommendationLetters[2]}`] },
            { text: "Utvecklat av Digital Ungdom", absolutePosition: { x: 225, y: 775 } },
        ],
        images: {
            star: `data:image/png;base64,${raysStarBase64}`,
            duLogo: `data:image/png;base64,${duLogoBase64}`,
        },
    };
    return generatePdf(description);
}
