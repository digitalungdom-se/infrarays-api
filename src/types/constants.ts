export enum UserType {
  Applicant = "APPLICANT",
  Admin = "ADMIN",
  SuperAdmin = "SUPER_ADMIN",
}

export enum TokenType {
  Refresh = "REFRESH",
  EmailLogin = "EMAIL_LOGIN",
  CachedApplicationPDF = "CACHED_APPLICATION_PDF",
  CachedCompleteApplicationPDF = "CACHED_COMPLETE_APPLICATION_PDF",
}

export enum FileType {
  CV = "CV",
  CoverLetter = "COVER_LETTER",
  Grades = "GRADES",
  RecommendationLetter = "RECOMMENDATION_LETTER",
  Appendix = "APPENDIX",
  Essay = "ESSAY",
}

export enum FileName {
  CachedApplicationPDF = "CACHED_APPLICATION.pdf",
  CachedCompleteApplicationPDF = "CACHED_COMPLETE_APPLICATION.pdf",
}
