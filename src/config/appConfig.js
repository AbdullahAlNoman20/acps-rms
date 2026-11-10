// App-wide settings. A backend developer only needs to change SEED_BASE / the api.js functions.
export const APP_NAME = "ACPS ResultHub";
export const APP_FULL_NAME = "ACPS ResultHub";
export const SCHOOL_SHORT = "ACPS";
export const STORAGE_PREFIX = "acps_rms:";
export const SEED_VERSION = "2026-11-08-v2"; // change this to force browsers to reload the sample JSON
export const SEED_BASE = "/data";
export const DEMO_PASSWORD = "Demo@123";

// Every data collection used by the app (each one is /public/data/<name>.json at the start).
export const COLLECTIONS = [
  "settings", "labels", "customFields", "branches", "versions", "programs", "groups", "shifts", "sections", "sessions",
  "courses", "curriculum", "markDistributions", "gradeTables", "statusCodes", "ruleParams", "ruleFormulas", "ruleConditions",
  "examSchemes", "exams", "students", "teachers", "users", "batches", "marks", "submissions", "attendance", "extensions",
  "corrections", "grace", "boardResults", "smsTemplates", "smsLog", "tickets", "audit", "permissions", "yearEnd",
];
