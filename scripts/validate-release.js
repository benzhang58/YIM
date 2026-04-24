const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "app.json",
  "eas.json",
  ".env.example",
  "LAUNCH_CHECKLIST.md",
  "supabase/schema.sql",
  "supabase/policies.sql",
  "store/metadata/en-US/listing.md",
  "store/privacy/data-safety.md"
];

const errors = [];
const warnings = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

for (const file of requiredFiles) {
  if (!exists(file)) {
    errors.push(`Missing required release file: ${file}`);
  }
}

const app = readJson("app.json").expo;
const eas = readJson("eas.json");
const packageJson = readJson("package.json");

if (!app.name || !app.slug || !app.scheme) {
  errors.push("app.json must include expo.name, expo.slug, and expo.scheme.");
}

if (!app.ios?.bundleIdentifier) {
  errors.push("app.json must include expo.ios.bundleIdentifier.");
}

if (!app.android?.package) {
  errors.push("app.json must include expo.android.package.");
}

if (app.ios?.bundleIdentifier === "com.gymbusy.app") {
  warnings.push("iOS bundle identifier is still the placeholder com.gymbusy.app.");
}

if (app.android?.package === "com.gymbusy.app") {
  warnings.push("Android package is still the placeholder com.gymbusy.app.");
}

if (!eas.build?.production) {
  errors.push("eas.json must include a production build profile.");
}

if (!eas.submit?.production) {
  errors.push("eas.json must include a production submit profile.");
}

if (!packageJson.scripts?.typecheck) {
  errors.push("package.json must include a typecheck script.");
}

if (!packageJson.scripts?.["validate:release"]) {
  errors.push("package.json must include a validate:release script.");
}

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
for (const key of ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"]) {
  if (!envExample.includes(key)) {
    errors.push(`.env.example must document ${key}.`);
  }
}

const schema = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8");
for (const table of ["user_profiles", "busyness_reports", "reviews", "gym_submission_requests", "content_reports", "account_deletion_requests"]) {
  if (!schema.includes(`create table if not exists ${table}`)) {
    errors.push(`supabase/schema.sql is missing table ${table}.`);
  }
}

const policies = fs.readFileSync(path.join(root, "supabase/policies.sql"), "utf8");
for (const table of ["user_profiles", "busyness_reports", "reviews", "gym_submission_requests", "content_reports", "account_deletion_requests"]) {
  if (!policies.includes(`on ${table}`)) {
    errors.push(`supabase/policies.sql is missing policies for ${table}.`);
  }
}

if (warnings.length) {
  console.warn("Release validation warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length) {
  console.error("Release validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Release validation passed.");
