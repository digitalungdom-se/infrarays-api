import bcrypt from "bcryptjs";
import Hogan from "hogan.js";
import knex from "knex";
import pdfjs from "pdfjs";

import { generateCoverPage, generateID, shuffleArray, mapOrder, sendMail } from "utils";

import database from "types/database";

export default class Admin {
    private knex: knex;
    private db: {
        admins(): knex.QueryBuilder<database.admins>;
        emails(): knex.QueryBuilder<database.emails>;
        files(): knex.QueryBuilder<database.files>;
        grades(): knex.QueryBuilder<database.grades>;
        surveys(): knex.QueryBuilder<database.surveys>;
        tokens(): knex.QueryBuilder<database.tokens>;
        users(): knex.QueryBuilder<database.users>;
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            admins: () => this.knex<database.admins>("admins"),
            emails: () => this.knex<database.emails>("emails"),
            files: () => this.knex<database.files>("files"),
            grades: () => this.knex<database.grades>("grades"),
            surveys: () => this.knex<database.surveys>("surveys"),
            tokens: () => this.knex<database.tokens>("tokens"),
            users: () => this.knex<database.users>("users"),
        };
    }

    public async addAdmin(adminData: Omit<database.admins, "id" | "password" | "grading_order">) {
        const admin: database.admins = {
            id: generateID(16),
            password: null,
            grading_order: [],
            ...adminData,
        };

        const templateData = (
            await this.db
                .emails()
                .select("content")
                .where({ type: "admin_create" })
                .first()
        ).content;
        const template = Hogan.compile(templateData);
        const body = template.render({ token: admin.id });

        await Promise.all([this.db.admins().insert(admin), sendMail(admin.email, "Skapa ditt admin konto", body)]);
    }

    public async setPassword(adminID: string, password: string) {
        password = await bcrypt.hash(password, 12);

        await this.db
            .admins()
            .update({ password })
            .where({ id: adminID });
    }

    public async getApplications(): Promise<Array<database.users>> {
        const users = await this.knex
            .select("users.id", "users.email", "users.name", "users.finnish")
            .from("users")
            .fullOuterJoin("grades", "users.id", "grades.user_id")
            .avg({
                cv: "grades.cv",
                coverLetter: "grades.coverLetter",
                essay: "grades.essay",
                grade: "grades.grade",
                recommendation: "grades.recommendation",
                overall: "grades.overall",
            })
            .groupBy("users.id");

        return users;
    }

    public async gradeApplication(
        adminID: string,
        userID: string,
        gradeData: {
            cv: number;
            coverLetter: number;
            essay: number;
            grade: number;
            recommendation: number;
            overall: number;
            comment: string;
        },
    ) {
        const grade = {
            id: generateID(16),
            admin_id: adminID,
            user_id: userID,
            ...gradeData,
        };

        const exists = await this.db
            .grades()
            .select("id")
            .where({ admin_id: adminID, user_id: userID })
            .first();

        if (exists?.id) {
            grade.id = exists.id;
            await this.db
                .grades()
                .update(grade)
                .where({ id: exists.id });

            return;
        }

        await this.db.grades().insert(grade);
    }

    public async getApplicationGrades(userID: string) {
        return this.db
            .grades()
            .select(
                "admins.name",
                "grades.cv",
                "grades.coverLetter",
                "grades.essay",
                "grades.grade",
                "grades.recommendation",
                "grades.overall",
                "grades.comment",
            )
            .where({ user_id: userID })
            .fullOuterJoin("admins", "grades.admin_id", "admins.id");
    }

    public async randomiseGradingOrder(
        adminID: string,
    ): Promise<Array<{ email: string; finnish: boolean; id: string; name: string; done: boolean }>> {
        const files = await this.db.files().select("user_id", "type");

        const users: { [index: string]: number } = {};

        files.forEach((file: { user_id: string; type: "cv" | "coverLetter" | "essay" | "grades" | "recommendation" }) => {
            if (file.type === "recommendation") {
                return;
            }

            if (!users[file.user_id]) {
                users[file.user_id] = 1;
                return;
            }

            users[file.user_id]++;
        });

        let usersDone: Array<string> = [];

        Object.keys(users).forEach(user => {
            if (users[user] === 4) {
                usersDone.push(user);
            }
        });

        usersDone = shuffleArray(usersDone);

        await this.db
            .admins()
            .update({ grading_order: usersDone })
            .where({ id: adminID });

        return this.getApplicationOrder(adminID);
    }

    public async getApplicationOrder(
        adminID: string,
    ): Promise<Array<{ email: string; finnish: boolean; id: string; name: string; done: boolean }>> {
        const [admin, grades] = await Promise.all([
            this.db
                .admins()
                .select("grading_order")
                .where({ id: adminID })
                .first(),
            this.db
                .grades()
                .select("id", "user_id")
                .where({ admin_id: adminID }),
        ]);

        if (!admin.grading_order) {
            return [];
        }

        const users = await this.db
            .users()
            .select("email", "finnish", "id", "name")
            .whereIn("id", admin.grading_order);

        grades.forEach(function(grade: database.grades) {
            const foundIndex = users.findIndex((user: database.users) => user.id === grade.user_id);

            users[foundIndex].done = true;
        });

        return mapOrder(users, admin.grading_order, "id");
    }

    public async getApplication(userID: string): Promise<Buffer> {
        const [files, user, survey] = await Promise.all([
            this.db
                .files()
                .select("type", "file")
                .where({ user_id: userID }),
            this.db
                .users()
                .select("*")
                .where({ id: userID })
                .first(),
            this.db
                .surveys()
                .select("city", "school")
                .where({ user_id: userID })
                .first(),
        ]);

        const recommendationLetters: Array<string> = [];

        console.log(user);

        for (const letter of user.recommendations) {
            if (letter.received) {
                recommendationLetters.push(letter.email);
            }
        }

        const coverLetterEssay: any = {};
        files.forEach(function(file: any) {
            if (file.type === "coverLetter" || file.type === "essay") {
                coverLetterEssay[file.type] = file.file;
            }
        });

        if (survey) {
            user.city = survey.city;
            user.school = survey.school;
        }

        const coverPage = await generateCoverPage(user, recommendationLetters, coverLetterEssay);

        const pdfs: Array<Buffer> = [coverPage];
        for (const type of ["cv", "coverLetter", "essay", "grades"]) {
            const index = files.findIndex((file: database.files) => file.type === type);
            if (index > -1) {
                pdfs.push(files[index].file);
            }
        }

        files.forEach(function(file: any) {
            if (file.type === "recommendation") {
                pdfs.push(file.file);
            }
        });

        const doc = new pdfjs.Document();

        for (const pdf of pdfs) {
            const ext = new pdfjs.ExternalDocument(pdf);
            doc.addPagesOf(ext);
        }

        return doc.asBuffer();
    }

    public async getSurveys() {
        return this.db.surveys().select();
    }
}
