import knex from "knex";
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib";
import path from "path";
import fs from "fs-extra";
import moment from "moment";
import pdfParse from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import hasha from "hasha";

import database from "types/database";
import { IApplicantInput, ISurveyInput, IRecommendationByCode, IRecommendationForUser } from "interfaces";
import { UserService, StorageService, TokenService, MailService } from "./";
import { FileName, FileType, UserType } from "types";
import { mergePDFDocuments, randomBase62String } from "utils";
import { Config } from "configs";

const raysStarPath = path.join(__dirname, "..", "..", "assets", "images", "star.png");
const duLogoPath = path.join(__dirname, "..", "..", "assets", "images", "du_logo.png");

export class ApplicationService {
  private readonly db: {
    applications(): knex.QueryBuilder<database.Applications>;
    recommendations(): knex.QueryBuilder<database.Recommendations>;
    surveys(): knex.QueryBuilder<database.Surveys>;
  };

  constructor(private readonly knex: knex, private readonly User: UserService, private readonly Storage: StorageService, private readonly Mail: MailService, private readonly Token: TokenService, private readonly config: typeof Config) {
    this.db = {
      applications: (): knex.QueryBuilder<database.Applications> => this.knex<database.Applications>("applications"),
      recommendations: (): knex.QueryBuilder<database.Recommendations> => this.knex<database.Recommendations>("recommendations"),
      surveys: (): knex.QueryBuilder<database.Surveys> => this.knex<database.Surveys>("surveys"),
    };
  }

  public async getByUserID(userID: string): Promise<database.Applications | undefined> {
    return this.db.applications().where({ userId: userID }).select("*").first();
  }

  public async getPDF(applicantID: string, opts?: { includeRecommendationLetters?: boolean }): Promise<Buffer> {
    const [allFiles, userApplication, recommendations] = await Promise.all([
      this.Storage.getForApplicant(applicantID, { includeRecommendationLetters: true }),
      this.db
        .applications()
        .select({
          id: "applications.userId",
          email: "users.email",
          firstName: "users.firstName",
          lastName: "users.lastName",

          finnish: "applications.finnish",
          birthdate: "applications.birthdate",

          city: "surveys.city",
          school: "surveys.school",
          surveyCreated: "surveys.created",
        })
        .where("applications.userId", applicantID)
        .fullOuterJoin("surveys", "applications.userId", "surveys.applicantId")
        .fullOuterJoin("users", "applications.userId", "users.id")
        .first(),
      this.db.recommendations().where({ applicantId: applicantID }).select("*"),
    ]);

    const datesHash = await hasha.async(
      allFiles
        .map(file => {
          return file.created.valueOf().toString();
        })
        .join() + userApplication.surveyCreated?.valueOf().toString(),
      { encoding: "base64" },
    );

    const cachedFileName = opts?.includeRecommendationLetters ? FileName.CachedCompleteApplicationPDF : FileName.CachedApplicationPDF;
    const cachedFilePath = path.join(this.config.server.store, applicantID, cachedFileName);

    let prevDatesHash;
    if (opts?.includeRecommendationLetters) {
      prevDatesHash = await this.Token.getCachedCompleteApplicationPDFToken(applicantID);
    } else {
      prevDatesHash = await this.Token.getCachedApplicationPDFToken(applicantID);
    }

    if (prevDatesHash === datesHash) {
      return fs.readFile(cachedFilePath);
    }

    const files = allFiles.filter(file => {
      if (file.type === FileType.RecommendationLetter && !opts?.includeRecommendationLetters) {
        return false;
      }

      return true;
    });

    const recommendationEmails = (recommendations as database.Recommendations[]).map(recommendation => {
      if (recommendation.received) {
        return recommendation.email;
      } else {
        return "";
      }
    });

    const fileObject: any = {};
    fileObject[FileType.Appendix] = [];

    if (opts?.includeRecommendationLetters) {
      fileObject[FileType.RecommendationLetter] = [];
    }

    await Promise.all(
      files.map(async file => {
        if (file.type === FileType.RecommendationLetter && opts?.includeRecommendationLetters) {
          fileObject[file.type].push(await fs.readFile(file.path));
        } else if (file.type === FileType.Appendix) {
          fileObject[file.type].push(await fs.readFile(file.path));
        } else {
          fileObject[file.type] = await fs.readFile(file.path);
        }
      }),
    );

    const wordCounts = { coverLetter: 0, essay: 0 };

    if (fileObject[FileType.CoverLetter]) {
      wordCounts.coverLetter = (await pdfParse(fileObject[FileType.CoverLetter])).text
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ").length;
    }

    if (fileObject[FileType.Essay]) {
      wordCounts.essay = (await pdfParse(fileObject[FileType.Essay])).text
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ").length;
    }

    const pages = [];

    const introDoc = await PDFDocument.create();
    const helvetica = {
      normal: await introDoc.embedFont(StandardFonts.Helvetica),
      bold: await introDoc.embedFont(StandardFonts.HelveticaBold),
    };

    const introPage = introDoc.addPage(PageSizes.A4);
    const pageDimensions = introPage.getSize();

    const starImage = await introDoc.embedPng(await fs.readFile(raysStarPath));
    introPage.drawImage(starImage, { x: 10, y: pageDimensions.height - 60, width: 40, height: 40 });

    const duLogoImage = await introDoc.embedPng(await fs.readFile(duLogoPath));
    introPage.drawImage(duLogoImage, { x: pageDimensions.width - 80, y: pageDimensions.height - 65, width: 55, height: 55 });

    const fontSizes = { title: 30, text: 16 };

    introPage.drawText("RAYS APPLICATION", {
      x: (pageDimensions.width - helvetica.normal.widthOfTextAtSize("RAYS APPLICATION", fontSizes.title)) / 2,
      y: pageDimensions.height - fontSizes.title * 2,
      size: fontSizes.title,
      font: helvetica.normal,
      color: rgb(0, 0, 0),
    });

    let index = 0;
    function createSubTitles(title: string, value: string | undefined): void {
      value = value || "";

      introPage.drawText(title, {
        x: 20,
        y: pageDimensions.height - (100 + (fontSizes.text + 3) * index),
        size: fontSizes.text,
        font: helvetica.bold,
        color: rgb(0, 0, 0),
      });

      introPage.drawText(value, {
        x: 20 + 5 + helvetica.bold.widthOfTextAtSize(title, fontSizes.text),
        y: pageDimensions.height - (100 + (fontSizes.text + 3) * index),
        size: fontSizes.text,
        font: helvetica.normal,
        color: rgb(0, 0, 0),
      });

      index++;
    }

    createSubTitles("Name:", `${userApplication.firstName} ${userApplication.lastName}`);
    createSubTitles("Email:", userApplication.email);
    createSubTitles("Birthdate:", `${moment.utc(userApplication.birthdate).format("YYYY-MM-DD")} (${moment.utc().diff(userApplication.birthdate, "years")})`);
    createSubTitles("Application through Finland:", `${userApplication.finnish ? "yes" : "no"}`);
    createSubTitles("City:", userApplication.city);
    createSubTitles("School:", userApplication.school);
    createSubTitles("Word count cover letter:", `~ ${wordCounts.coverLetter}`);
    createSubTitles("Word count essay:", `~ ${wordCounts.essay}`);
    createSubTitles("Recommendation letter from:", recommendationEmails[0]);
    createSubTitles("Recommendation letter from:", recommendationEmails[1]);
    createSubTitles("Recommendation letter from:", recommendationEmails[2]);

    introPage.drawText("Utvecklat av Digital Ungdom", {
      x: (pageDimensions.width - helvetica.normal.widthOfTextAtSize("Utvecklat av Digital Ungdom", 12)) / 2,
      y: 25,
      size: 12,
      font: helvetica.normal,
      color: rgb(0, 0, 0),
    });

    pages.push(introDoc);

    if (fileObject[FileType.CV]) {
      pages.push(fileObject[FileType.CV]);
    }
    if (fileObject[FileType.CoverLetter]) {
      pages.push(fileObject[FileType.CoverLetter]);
    }
    if (fileObject[FileType.Essay]) {
      pages.push(fileObject[FileType.Essay]);
    }
    if (fileObject[FileType.Grades]) {
      pages.push(fileObject[FileType.Grades]);
    }

    pages.push(...fileObject[FileType.Appendix]);

    if (opts?.includeRecommendationLetters) {
      pages.push(...fileObject[FileType.RecommendationLetter]);
    }

    const applicationBuffer = Buffer.from(await (await mergePDFDocuments(pages)).save());
    await fs.outputFile(cachedFilePath, applicationBuffer);

    if (opts?.includeRecommendationLetters) {
      await this.Token.createCachedCompleteApplicationPDFToken(applicantID, datesHash);
    } else {
      await this.Token.createCachedApplicationPDFToken(applicantID, datesHash);
    }

    return applicationBuffer;
  }

  public async create(applicantData: IApplicantInput): Promise<database.Users> {
    const userData = {
      email: applicantData.email,
      firstName: applicantData.firstName,
      lastName: applicantData.lastName,
      type: UserType.Applicant,
    };

    const user = await this.User.create(userData);

    const applicationData = {
      userId: user.id,
      birthdate: applicantData.birthdate,
      finnish: applicantData.finnish,
    };

    await this.db.applications().insert(applicationData);

    return user;
  }

  public async getRecommendationsForApplicant(applicantID: string): Promise<database.Recommendations[]> {
    return (this.db.recommendations().where({ applicantId: applicantID }).select("*") as unknown) as database.Recommendations[];
  }

  public async getRecommendationByCode(code: string): Promise<IRecommendationByCode | undefined> {
    return this.db
      .recommendations()
      .where({ code })
      .select({
        id: "recommendations.id",
        code: "recommendations.code",
        email: "recommendations.email",
        lastSent: "recommendations.lastSent",
        received: "recommendations.received",

        applicantId: "users.id",
        applicantEmail: "users.email",
        applicantFirstName: "users.firstName",
        applicantLastName: "users.lastName",

        fileId: "files.id",
        fileType: "files.type",
        fileCreated: "files.created",
        fileName: "files.name",
        fileMime: "files.mime",
      })
      .fullOuterJoin("users", "recommendations.applicantId", "users.id")
      .fullOuterJoin("files", "recommendations.fileId", "files.id")
      .first();
  }

  public async deleteRecommendationByApplicantID(applicantID: string, index: number): Promise<void> {
    const fileID = (await this.db.recommendations().where({ applicantId: applicantID, index }).del().returning("fileId"))[0];

    if (fileID) {
      await this.Storage.del(fileID);
    }
  }

  public async sendRecommendationRequest(applicantID: string, index: number, email: string): Promise<database.Recommendations> {
    const [recommendationExits, user] = await Promise.all([this.db.recommendations().where({ applicantId: applicantID, index }).select("*").first(), this.User.getByID(applicantID)]);
    let recommendation;

    if (recommendationExits && recommendationExits.email === email) {
      const now = moment.utc().toDate();
      recommendation = (await this.db.recommendations().where({ id: recommendationExits.id }).update({ lastSent: now }).returning("*"))[0];
    } else {
      if (recommendationExits) {
        await this.db.recommendations().where({ id: recommendationExits.id }).del();
      }

      recommendation = {
        id: uuidv4(),
        code: randomBase62String(32),
        applicantId: applicantID,
        email,
        lastSent: moment.utc().toDate(),
        received: null,
        fileId: null,
        index,
      };

      await this.db.recommendations().insert(recommendation);
    }

    await this.Mail.sendRecommendationRequest(email, { code: recommendation.code, applicant_first_name: user!.firstName, applicant_last_name: user!.lastName, applicant_email: user!.email });

    return recommendation;
  }

  public async uploadRecommendation(
    recommendationCode: string,
    fileData: {
      name: string;
      path: string;
      mime: string;
      type: string;
    },
  ): Promise<database.Files> {
    const recommendation = (await this.db.recommendations().where({ code: recommendationCode }).select("*").first())!;

    const fileID = recommendation.fileId || undefined; // overwrite existing recommendation if exists

    const [user, file] = await Promise.all([this.User.getByID(recommendation.applicantId), this.Storage.create(recommendation.applicantId, { ...fileData, id: fileID })]);

    await this.db.recommendations().where({ id: recommendation.id }).update({ received: moment.utc().toDate(), fileId: file.id });

    await Promise.all([
      this.Mail.sendRecommendationReceivedSender(
        recommendation.email,
        { code: recommendation.code, applicant_first_name: user!.firstName, applicant_last_name: user!.lastName },
        { content: (await fs.readFile(file.path)).toString("base64"), filename: file.name, type: file.mime },
      ),
      this.Mail.sendRecommendationReceivedApplicant(user!.email, { sender_email: recommendation.email }),
    ]);

    return file;
  }

  public async getSurveyByUserID(applicantID: string): Promise<database.Surveys | undefined> {
    return this.db.surveys().where({ applicantId: applicantID }).select("*").first();
  }

  public async saveSurvey(applicantID: string, surveyData: ISurveyInput): Promise<database.Surveys> {
    await this.db.surveys().where({ applicantId: applicantID }).del();

    const survey = { applicantId: applicantID, ...surveyData, created: moment.utc().toDate() };
    await this.db.surveys().insert(survey);

    return survey;
  }

  public toRecommendationForUser(recommendation: database.Recommendations): IRecommendationForUser {
    return {
      id: recommendation.id,
      applicantId: recommendation.applicantId,
      email: recommendation.email,
      lastSent: recommendation.lastSent,
      received: recommendation.received,
      index: recommendation.index,
    };
  }
}
