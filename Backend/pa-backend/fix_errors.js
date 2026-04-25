
const fs = require("fs");
// 1. Fix division.service.ts
let divFile = "src/admin/division/division.service.ts";
let divCode = fs.readFileSync(divFile, "utf8");
divCode = divCode.replace(/include: \{\s*\},\s*/g, "");
fs.writeFileSync(divFile, divCode);

// 2. Fix notification.service.ts
let notServFile = "src/notification/notification.service.ts";
let notServCode = fs.readFileSync(notServFile, "utf8");
notServCode = notServCode.replace(/receiverId:/g, "userId:");
// ADD DUMMY METHOD TO NOTIFICATION SERVICE
notServCode = notServCode.replace(/async sendReminder/g, "async scheduleSessionEndNotification(session: any, tenantId: string) {}\n  async sendReminder");
fs.writeFileSync(notServFile, notServCode);

// 3. Fix notification.controller.ts
let notCtrlFile = "src/notification/notification.controller.ts";
let notCtrlCode = fs.readFileSync(notCtrlFile, "utf8");
notCtrlCode = notCtrlCode.replace(/const \{ message, data \} =\s*await this.notificationService.markAllRead\(req\);/g, "const { message } = await this.notificationService.markAllRead(req);\n      const data = null;");
notCtrlCode = notCtrlCode.replace(/const \{ message, data \} =\s*await this.notificationService.sendReminder\(req, dto\);/g, "const { message } = await this.notificationService.sendReminder(req, dto);\n      const data = null;");
fs.writeFileSync(notCtrlFile, notCtrlCode);


