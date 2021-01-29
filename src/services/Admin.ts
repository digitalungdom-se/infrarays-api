import knex from "knex";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import _ from "lodash";

import database from "types/database";
import { UserService } from ".";
import { IAdminInput, IGradeInput } from "interfaces/IAdmin";

export class AdminService {
  private readonly db: {
    grades(): knex.QueryBuilder<database.Grades>;
    gradingOrders(): knex.QueryBuilder<database.GradingOrders>;
    surveys(): knex.QueryBuilder<database.Surveys>;
  };

  private readonly cache: {
    users: Map<string, database.Users>;
  };

  constructor(private readonly knex: knex, private readonly User: UserService) {
    this.db = {
      grades: (): knex.QueryBuilder<database.Grades> => this.knex<database.Grades>("grades"),
      gradingOrders: (): knex.QueryBuilder<database.GradingOrders> => this.knex<database.GradingOrders>("grading_orders"),
      surveys: (): knex.QueryBuilder<database.Surveys> => this.knex<database.Surveys>("surveys"),
    };

    this.cache = { users: new Map() };
  }

  public async create(adminData: IAdminInput): Promise<database.Users> {
    const admin = {
      ...adminData,
      id: uuidv4(),
      created: moment.utc().toDate(),
      verified: false,
    };
    await this.User.create(admin);

    return admin;
  }

  async grade(gradeData: IGradeInput): Promise<database.Grades> {
    const grade = { id: uuidv4(), ...gradeData };

    await this.db.grades().where({ adminId: gradeData.adminId, applicantId: gradeData.applicantId }).del();

    await this.db.grades().insert(grade);

    return grade;
  }

  async getGradesForApplicant(applicantID: string): Promise<database.Grades[]> {
    return (this.db.grades().where({ applicantId: applicantID }).select("*") as unknown) as database.Grades[];
  }

  async getSurveys(): Promise<database.Surveys[]> {
    return (this.db.surveys().select("*") as unknown) as database.Surveys[];
  }

  async randomiseGradingOrder(adminID: string): Promise<database.GradingOrders[]> {
    // eslint-disable-next-line prefer-const
    let [applicants, grades] = await Promise.all([this.User.getUsers(true), this.db.grades().select("*").where({ adminId: adminID }), this.db.gradingOrders().where({ adminId: adminID }).del()]);

    applicants = _.shuffle(applicants);

    const gradingOrder = applicants.map((applicant, index) => {
      return {
        id: uuidv4(),
        adminId: adminID,
        applicantId: applicant.id,
        order: index,
      };
    });

    await this.db.gradingOrders().insert(gradingOrder);

    const gradesMap: Map<string, database.Grades> = new Map();

    (grades as database.Grades[]).forEach(grade => {
      gradesMap.set(grade.applicantId, grade);
    });

    return gradingOrder.map(order => {
      return {
        ...order,
        done: gradesMap.has(order.applicantId),
      };
    });
  }

  async getGradingOrder(adminID: string): Promise<database.GradingOrders[]> {
    const [gradingOrder, grades] = await Promise.all([this.db.gradingOrders().where({ adminId: adminID }).select("*").orderBy("order", "asc"), this.db.grades().select("*").where({ adminId: adminID })]);

    const gradesMap: Map<string, database.Grades> = new Map();

    (grades as database.Grades[]).forEach(grade => {
      gradesMap.set(grade.applicantId, grade);
    });

    return (gradingOrder as database.GradingOrders[]).map(order => {
      return {
        ...order,
        done: gradesMap.has(order.applicantId),
      };
    });
  }
}
