import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      useFactory: async () => {
        let accessTokenToken = "";
        try {
          if (process.env.REFRESH_TOKEN) {
            const accessToken = await oAuth2Client.getAccessToken();
            accessTokenToken = accessToken.token;
          } else {
            console.warn("⚠️ Warning: REFRESH_TOKEN not set in .env. Email features are disabled/mocked.");
          }
        } catch (e) {
          console.warn("⚠️ Warning: Failed to authenticate with Google OAuth. Email features disabled. Error:", e.message);
        }
        return {
          transport: {
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.MY_EMAIL,
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: accessTokenToken,
            },
          },
          defaults: {
            from: `"Onely For Artists" <${process.env.MY_EMAIL}>`,
          },
          // template adapter disabled due to package export issues
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
