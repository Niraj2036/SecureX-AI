# Cloudinary Signature Error - Fix Guide

## Problem
```
Upload failed
Invalid Signature bb852c324a2324bcde6ee47e9bb6333f
'allowed_formats=pdf,doc,docx,png,jpg.jpeg,xlsx,csv,txt&f
```

This error means Cloudinary rejected your upload due to invalid authentication credentials.

## Root Causes & Solutions

### 1. **API Secret is Incorrect or Expired** ⚠️
The most common cause - your Cloudinary API secret may have been regenerated.

**Fix:**
1. Go to https://cloudinary.com/console/settings/api-keys
2. Copy your **API Secret**
3. Update `.env` file:
   ```
   CLOUDINARY_API_SECRET=your_new_secret_here
   ```
4. Restart backend server

### 2. **API Key or Cloud Name Mismatch**
Verify these match your Cloudinary account:

**In Cloudinary Console:**
- Cloud Name: Find at https://cloudinary.com/console
- API Key: Find at https://cloudinary.com/console/settings/api-keys

**In `.env`:**
```
CLOUDINARY_CLOUD_NAME=db2eubwvd
CLOUDINARY_API_KEY=517981978921165
CLOUDINARY_API_SECRET=PFNMwGtlMvQSJnY6NXqp_FbjyEI
```

### 3. **Environment Variables Not Loaded**
Backend might not be reading the `.env` file.

**Fix:**
```bash
# Stop the backend
# Make sure .env is in: Backend/pa-backend/.env
# Restart backend
npm run start:dev
```

### 4. **Credentials Exposed in Git** 🔒
Your credentials are visible in `.env`. For security:

1. **Never commit `.env` to git:**
   ```bash
   # Check if .env is in gitignore
   cat .gitignore | grep ".env"
   ```

2. **If already committed, regenerate credentials:**
   - Go to Cloudinary console
   - Generate new API Secret
   - Update `.env`
   - Commit `.gitignore` (not `.env`)

### 5. **File Format/Size Issues**
Even with valid credentials, upload can fail if:
- File is > 10MB
- File format not in whitelist (PDF, DOC, DOCX, PNG, JPG, JPEG, XLSX, CSV, TXT)

**Check Controller Validation:**
```typescript
// Backend/pa-backend/src/document/document.controller.ts line 26-52
const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
];
```

## Quick Fix Checklist

### Step 1: Verify Credentials
```bash
# SSH into backend
# Check if env vars are set
printenv | grep CLOUDINARY
# Should show:
# CLOUDINARY_CLOUD_NAME=db2eubwvd
# CLOUDINARY_API_KEY=517981978921165
# CLOUDINARY_API_SECRET=PFNMwGtlMvQSJnY6NXqp_FbjyEI
```

### Step 2: Test Cloudinary Connection
```bash
# Add this to test-cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'db2eubwvd',
  api_key: '517981978921165',
  api_secret: 'PFNMwGtlMvQSJnY6NXqp_FbjyEI',
});

cloudinary.api.resources({}, (err, result) => {
  if (err) {
    console.error('❌ Cloudinary Error:', err);
  } else {
    console.log('✅ Cloudinary Connected!');
    console.log('Resources:', result.resources.length);
  }
});
```

### Step 3: Restart Backend
```bash
cd Backend/pa-backend
npm install  # If dependencies missing
npm run start:dev
```

### Step 4: Try Upload Again
1. Go to Documents tab
2. Select file
3. Fill in details
4. Click Upload
5. Check browser console for errors

## Detailed Troubleshooting

### If error persists:

1. **Check Backend Logs**
   ```bash
   # Look for error messages
   npm run start:dev 2>&1 | grep -i cloudinary
   ```

2. **Verify File Size**
   ```bash
   # Files must be < 10MB
   ls -lh your_file.pdf
   ```

3. **Check File Type**
   ```bash
   # File MIME type must be in whitelist
   file your_file.pdf
   ```

4. **Test with cURL**
   ```bash
   curl -X POST http://localhost:4000/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@your_file.pdf" \
     -F "title=Test" \
     -F "type=other" \
     -F "access=[]"
   ```

### If Cloudinary credentials are compromised:

1. **Go to Cloudinary Console**
2. **Settings → API Keys → Regenerate API Secret**
3. **Update `.env` immediately**
4. **Restart backend**
5. **No one should access your Cloudinary account**

## Environment Setup for Production

**DO NOT commit `.env` with real credentials!**

Instead:
1. Create `.env.example` with placeholder values
2. Add `.env` to `.gitignore`
3. Use environment variables in production:

```bash
# During deployment
export CLOUDINARY_CLOUD_NAME="your-cloud-name"
export CLOUDINARY_API_KEY="your-api-key"
export CLOUDINARY_API_SECRET="your-api-secret"
npm run start
```

## Success Indicators

✅ Upload successful when you see:
- File appears in Documents table
- Access control settings saved
- Document can be downloaded
- File visible in Cloudinary Console (https://cloudinary.com/console/media_library)

## Security Best Practices

- 🔐 Never commit `.env` to git
- 🔐 Regenerate API Secret if exposed
- 🔐 Use different credentials for dev/staging/prod
- 🔐 Restrict Cloudinary API access by IP if possible
- 🔐 Rotate API Secret periodically

## Still Having Issues?

1. Check Cloudinary dashboard for API activity
2. Verify account isn't rate-limited
3. Check network connection to Cloudinary
4. Ensure file upload size doesn't exceed limit
5. Verify all three credentials (cloud name, API key, API secret) are correct

## Contact Cloudinary Support

If issue persists after all fixes:
- Visit https://cloudinary.com/console/help
- Check API error documentation
- Review Cloudinary status page
