/* tslint:disable */

/**
 * AUTO-GENERATED FILE @ 2021-01-22 10:46:43 - DO NOT EDIT!
 *
 * This file was automatically generated by schemats v.3.0.3
 * $ schemats generate -c postgres://username:password@localhost:5432/infrarays -C -t grading_order -t recommendations -t knex_migrations_lock -t knex_migrations -t surveys -t applications -t users -t tokens -t grades -t files -s public
 *
 */

export namespace GradingOrderFields {
  export type id = string;
  export type adminId = string;
  export type userId = string;
  export type order = number;
}

export interface GradingOrder {
  id: GradingOrderFields.id;
  adminId: GradingOrderFields.adminId;
  userId: GradingOrderFields.userId;
  order: GradingOrderFields.order;
}

export namespace RecommendationsFields {
  export type id = string;
  export type code = string;
  export type userId = string;
  export type email = string;
  export type lastSent = Date;
  export type received = Date | null;
  export type fileId = string | null;
  export type index = number;
}

export interface Recommendations {
  id: RecommendationsFields.id;
  code: RecommendationsFields.code;
  userId: RecommendationsFields.userId;
  email: RecommendationsFields.email;
  lastSent: RecommendationsFields.lastSent;
  received: RecommendationsFields.received;
  fileId: RecommendationsFields.fileId;
  index: RecommendationsFields.index;
}

export namespace KnexMigrationsLockFields {
  export type index = number;
  export type isLocked = number | null;
}

export interface KnexMigrationsLock {
  index: KnexMigrationsLockFields.index;
  isLocked: KnexMigrationsLockFields.isLocked;
}

export namespace KnexMigrationsFields {
  export type id = number;
  export type name = string | null;
  export type batch = number | null;
  export type migrationTime = Date | null;
}

export interface KnexMigrations {
  id: KnexMigrationsFields.id;
  name: KnexMigrationsFields.name;
  batch: KnexMigrationsFields.batch;
  migrationTime: KnexMigrationsFields.migrationTime;
}

export namespace SurveysFields {
  export type userId = string;
  export type city = string;
  export type school = string;
  export type gender = string;
  export type applicationPortal = number;
  export type applicationProcess = number;
  export type improvement = string;
  export type informant = string;
  export type created = Date;
}

export interface Surveys {
  userId: SurveysFields.userId;
  city: SurveysFields.city;
  school: SurveysFields.school;
  gender: SurveysFields.gender;
  applicationPortal: SurveysFields.applicationPortal;
  applicationProcess: SurveysFields.applicationProcess;
  improvement: SurveysFields.improvement;
  informant: SurveysFields.informant;
  created: SurveysFields.created;
}

export namespace ApplicationsFields {
  export type userId = string;
  export type birthdate = Date;
  export type finnish = boolean;
}

export interface Applications {
  userId: ApplicationsFields.userId;
  birthdate: ApplicationsFields.birthdate;
  finnish: ApplicationsFields.finnish;
}

export namespace UsersFields {
  export type id = string;
  export type email = string;
  export type firstName = string;
  export type lastName = string;
  export type type = string;
  export type verified = boolean;
  export type created = Date;
}

export interface Users {
  id: UsersFields.id;
  email: UsersFields.email;
  firstName: UsersFields.firstName;
  lastName: UsersFields.lastName;
  type: UsersFields.type;
  verified: UsersFields.verified;
  created: UsersFields.created;
}

export namespace TokensFields {
  export type value = string;
  export type type = string;
  export type expires = Date | null;
  export type userId = string;
}

export interface Tokens {
  value: TokensFields.value;
  type: TokensFields.type;
  expires: TokensFields.expires;
  userId: TokensFields.userId;
}

export namespace GradesFields {
  export type id = string;
  export type adminId = string;
  export type userId = string;
  export type cv = number;
  export type coverLetter = number;
  export type essay = number;
  export type grade = number;
  export type recommendation = number;
  export type overall = number;
  export type comment = string | null;
}

export interface Grades {
  id: GradesFields.id;
  adminId: GradesFields.adminId;
  userId: GradesFields.userId;
  cv: GradesFields.cv;
  coverLetter: GradesFields.coverLetter;
  essay: GradesFields.essay;
  grade: GradesFields.grade;
  recommendation: GradesFields.recommendation;
  overall: GradesFields.overall;
  comment: GradesFields.comment;
}

export namespace FilesFields {
  export type id = string;
  export type userId = string;
  export type type = string;
  export type created = Date;
  export type name = string;
  export type mime = string;
  export type path = string;
}

export interface Files {
  id: FilesFields.id;
  userId: FilesFields.userId;
  type: FilesFields.type;
  created: FilesFields.created;
  name: FilesFields.name;
  mime: FilesFields.mime;
  path: FilesFields.path;
}
