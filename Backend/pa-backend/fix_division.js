
let fs = require("fs");
let f = "src/admin/division/division.service.ts";
let c = fs.readFileSync(f, "utf8");
c = c.replace(/templates: \{\s*include: \{\s*keyResultTemplates: true,\s*\},\s*\},\s*/g, "");
c = c.replace(/include: \{\s*templates: \{\s*include: \{\s*keyResultTemplates: true,\s*\},\s*\},\s*\},\s*/g, "");
fs.writeFileSync(f, c);

