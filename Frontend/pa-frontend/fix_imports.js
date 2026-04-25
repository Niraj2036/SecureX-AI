
const fs = require("fs");
function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

replaceInFile("src/app/(dashboard)/employee/page.tsx", /import CreateObjective from "@\/components\/objective\/create-objective";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/employee/page.tsx", /<CreateObjective \/>/g, "");

replaceInFile("src/app/(dashboard)/employee/teams/page.tsx", /import CreateObjective from "@\/components\/objective\/create-objective";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/employee/teams/page.tsx", /<CreateObjective \/>/g, "");

replaceInFile("src/app/(dashboard)/setting/(other)/profiles/page.tsx", /import CreateObjective from "@\/components\/objective\/create-objective";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/setting/(other)/profiles/page.tsx", /import Template from "@\/components\/dashboard\/okr-template";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/setting/(other)/profiles/page.tsx", /<CreateObjective \/>/g, "");
replaceInFile("src/app/(dashboard)/setting/(other)/profiles/page.tsx", /<Template \/>/g, "");

replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /import Checkin from ".*";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /import InitiativeTask from "@\/components\/user-profiles-components\/initiative-task";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /import OkrAchievement from "@\/components\/objective\/okrachievement";\r?\n/g, "");
replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /<TabsContent value="check-ins">[\s\S]*?<\/TabsContent>/g, "");
replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /<InitiativeTask \/>/g, "");
replaceInFile("src/app/(dashboard)/user-profiles/page.tsx", /<OkrAchievement \/>/g, "");

replaceInFile("src/components/custom-form/RecognitionSection.tsx", /import SelectBadge from "..\/okr\/select-badge";\r?\n/g, "");
replaceInFile("src/components/custom-form/RecognitionSection.tsx", /<SelectBadge[^>]*\/>/g, "");

