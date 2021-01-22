import knex from "knex";
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib";
import path from "path";
import fs from "fs-extra";
import moment from "moment";
import pdfParse from "pdf-parse";
import { v4 as uuidv4 } from "uuid";

import database from "types/database";
import { IApplicantInput, ISurveyInput } from "interfaces";
import { UserService, StorageService } from "./";
import { FileTypes, UserType } from "types";
import { mergePDFDocuments, randomBase62String, generateSimpleEmail } from "utils";
import { Config } from "configs";
import { MailService } from "@sendgrid/mail";

const raysStarPath = path.join(__dirname, "..", "..", "assets", "images", "star.png");
const duLogoPath = path.join(__dirname, "..", "..", "assets", "images", "du_logo.png");

export class ApplicationService {
  private readonly db: {
    applications(): knex.QueryBuilder<database.Applications>;
    recommendations(): knex.QueryBuilder<database.Recommendations>;
    surveys(): knex.QueryBuilder<database.Surveys>;
  };

  constructor(private readonly knex: knex, private readonly User: UserService, private readonly Storage: StorageService, private readonly Mail: MailService, private readonly config: typeof Config) {
    this.db = {
      applications: (): knex.QueryBuilder<database.Applications> => this.knex<database.Applications>("applications"),
      recommendations: (): knex.QueryBuilder<database.Recommendations> => this.knex<database.Recommendations>("recommendations"),
      surveys: (): knex.QueryBuilder<database.Surveys> => this.knex<database.Surveys>("surveys"),
    };
  }

  public async getByUserID(userID: string): Promise<database.Applications | undefined> {
    return this.db.applications().where({ userId: userID }).select("*").first();
  }

  public async getPDF(userID: string, opts?: { includeRecommendationLetters?: boolean }): Promise<Buffer> {
    const [files, userApplication, recommendations] = await Promise.all([
      this.Storage.getForUser(userID),
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
        })
        .where("applications.userId", userID)
        .fullOuterJoin("surveys", "applications.userId", "surveys.userId")
        .fullOuterJoin("users", "applications.userId", "users.id")
        .first(),
      this.db.recommendations().where({ userId: userID }).select("*"),
    ]);

    const recommendationEmails = (recommendations as database.Recommendations[]).map(recommendation => {
      if (recommendation.received) {
        return recommendation.email;
      } else {
        return "";
      }
    });

    const fileObject: any = {};
    fileObject[FileTypes.Appendix] = [];

    if (opts?.includeRecommendationLetters) {
      fileObject[FileTypes.RecommendationLetter] = [];
    }

    await Promise.all(
      files.map(async file => {
        if (file.type === FileTypes.RecommendationLetter && opts?.includeRecommendationLetters) {
          fileObject[file.type].push(await fs.readFile(file.path));
        } else if (file.type === FileTypes.Appendix) {
          fileObject[file.type].push(await fs.readFile(file.path));
        } else {
          fileObject[file.type] = await fs.readFile(file.path);
        }
      }),
    );

    const wordCounts = { coverLetter: 0, essay: 0 };

    if (fileObject[FileTypes.CoverLetter]) {
      wordCounts.coverLetter = (await pdfParse(fileObject[FileTypes.CoverLetter])).text
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ").length;
    }

    if (fileObject[FileTypes.Essay]) {
      wordCounts.essay = (await pdfParse(fileObject[FileTypes.Essay])).text
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ").length;
    }

    const pages = [];

    const introDoc = await PDFDocument.create();
    const timesRoman = {
      normal: await introDoc.embedFont(StandardFonts.TimesRoman),
      bold: await introDoc.embedFont(StandardFonts.TimesRomanBold),
    };

    const introPage = introDoc.addPage(PageSizes.A4);
    const pageDimensions = introPage.getSize();

    const starImage = await introDoc.embedPng(await fs.readFile(raysStarPath));
    introPage.drawImage(starImage, { x: 10, y: pageDimensions.height - 60, width: 40, height: 40 });

    const duLogoImage = await introDoc.embedPng(await fs.readFile(duLogoPath));
    introPage.drawImage(duLogoImage, { x: pageDimensions.width - 80, y: pageDimensions.height - 65, width: 55, height: 55 });

    const fontSizes = { title: 30, text: 16 };

    introPage.drawText("RAYS APPLICATION", {
      x: (pageDimensions.width - timesRoman.normal.widthOfTextAtSize("RAYS APPLICATION", fontSizes.title)) / 2,
      y: pageDimensions.height - fontSizes.title * 2,
      size: fontSizes.title,
      font: timesRoman.normal,
      color: rgb(0, 0, 0),
    });

    let index = 0;
    function createSubTitles(title: string, value: string | undefined): void {
      value = value || "";

      introPage.drawText(title, {
        x: 20,
        y: pageDimensions.height - (100 + (fontSizes.text + 3) * index),
        size: fontSizes.text,
        font: timesRoman.bold,
        color: rgb(0, 0, 0),
      });

      introPage.drawText(value, {
        x: 20 + 5 + timesRoman.bold.widthOfTextAtSize(title, fontSizes.text),
        y: pageDimensions.height - (100 + (fontSizes.text + 3) * index),
        size: fontSizes.text,
        font: timesRoman.normal,
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
      x: (pageDimensions.width - timesRoman.normal.widthOfTextAtSize("Utvecklat av Digital Ungdom", 12)) / 2,
      y: 25,
      size: 12,
      font: timesRoman.normal,
      color: rgb(0, 0, 0),
    });

    pages.push(introDoc);

    if (fileObject[FileTypes.CV]) {
      pages.push(fileObject[FileTypes.CV]);
    }
    if (fileObject[FileTypes.CoverLetter]) {
      pages.push(fileObject[FileTypes.CoverLetter]);
    }
    if (fileObject[FileTypes.Essay]) {
      pages.push(fileObject[FileTypes.Essay]);
    }
    if (fileObject[FileTypes.Grades]) {
      pages.push(fileObject[FileTypes.Grades]);
    }

    if (opts?.includeRecommendationLetters) {
      pages.push(...fileObject[FileTypes.RecommendationLetter]);
    }

    pages.push(...fileObject[FileTypes.Appendix]);

    return Buffer.from(await mergePDFDocuments(pages));
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

  public async getRecommendationsForUser(userID: string): Promise<database.Recommendations[]> {
    return (this.db.recommendations().where({ userId: userID }).select("*") as unknown) as database.Recommendations[];
  }

  public async getRecommendationByCode(code: string): Promise<any | undefined> {
    return this.db
      .recommendations()
      .where({ code })
      .select({
        id: "recommendations.id",
        code: "recommendations.code",
        email: "recommendations.email",
        lastSent: "recommendations.lastSent",
        received: "recommendations.received",

        userId: "users.id",
        userEmail: "users.email",
        userFirstName: "users.firstName",
        userLastName: "users.lastName",

        fileId: "files.id",
        fileType: "files.type",
        fileCreated: "files.created",
        fileName: "files.name",
        fileMime: "files.mime",
      })
      .fullOuterJoin("users", "recommendations.userId", "users.id")
      .fullOuterJoin("files", "recommendations.fileId", "files.id")
      .first();
  }

  public async deleteRecommendationByUserID(userID: string, index: number): Promise<void> {
    const fileID = (await this.db.recommendations().where({ userId: userID, index }).del().returning("fileId"))[0];

    if (fileID) {
      await this.Storage.del(fileID);
    }
  }

  public async sendRecommendationRequest(userID: string, index: number, email: string): Promise<database.Recommendations> {
    const [recommendationExits, user] = await Promise.all([this.db.recommendations().where({ userId: userID, index }).select("*").first(), this.User.getByID(userID)]);
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
        userId: userID,
        email,
        lastSent: moment.utc().toDate(),
        received: null,
        fileId: null,
        index,
      };

      await this.db.recommendations().insert(recommendation);
    }

    const emailData = generateSimpleEmail(email, this.config.sendGrid.emailTemplates.recommendationRequest, { code: recommendation.code, applicant_first_name: user!.firstName, applicant_last_name: user!.lastName, applicant_email: user!.email });

    await this.Mail.send(emailData);

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

    const [user, file] = await Promise.all([this.User.getByID(recommendation.userId), this.Storage.create(recommendation.userId, { ...fileData })]);

    await this.db.recommendations().where({ id: recommendation.id }).update({ received: moment.utc().toDate(), fileId: file.id });

    const recommendationReceivedSender = generateSimpleEmail(
      recommendation.email,
      this.config.sendGrid.emailTemplates.recommendationReceivedSender,
      {
        code: recommendation.code,
        applicant_first_name: user!.firstName,
        applicant_last_name: user!.lastName,
      },
      [{ content: (await fs.readFile(file.path)).toString("base64"), filename: file.name, type: file.mime, disposition: "attachment" }],
    );

    const recommendationReceivedApplicant = generateSimpleEmail(recommendation.email, this.config.sendGrid.emailTemplates.recommendationReceivedApplicant, {
      sender_email: recommendation.email,
    });

    await Promise.all([this.Mail.send(recommendationReceivedSender), this.Mail.send(recommendationReceivedApplicant)]);

    return file;
  }

  public async getSurveyByUserID(userID: string): Promise<database.Surveys | undefined> {
    return this.db.surveys().where({ userId: userID }).select("*").first();
  }

  public async saveSurvey(userID: string, surveyData: ISurveyInput): Promise<database.Surveys> {
    await this.db.surveys().where({ userId: userID }).del();

    const survey = { userId: userID, ...surveyData, created: moment.utc().toDate() };
    await this.db.surveys().insert(survey);

    return survey;
  }
}
