# Document Access Control Updates

## Summary
Enhanced the document management system with improved access control UI for both single and bulk uploads.

## Changes Made

### 1. Frontend - AccessControlPicker Component (Enhanced)
**File:** `Frontend/pa-frontend/src/app/(dashboard)/documents/page.tsx`

**Improvements:**
- **Replaced Tab-based Search with Select Dropdowns** - More intuitive interface
- **Separate Dropdowns for:**
  - Users (individual user access)
  - Teams (team-based access)  
  - Departments (department-based access)
- **Add Buttons** - One-click to add selected users/teams/departments
- **Permission Control** - Assign view/download/manage permissions
- **Visual Indicators** - Color-coded icons for each access type
- **Deduplication** - Already-selected items are filtered out from dropdowns

### 2. Single Upload Tab - Enhanced UI
**Changes:**
- Added "Document Information" section header
- Reorganized form fields with clear visual sections
- Added "Access Control" section with helper text
- Better visual separation using borders
- Clear instruction: "Choose which users, teams, or departments can access this document and what they can do with it"

### 3. Bulk Upload Tab - Enhanced UI  
**Changes:**
- Added helper tip: "Set the document type and access control below, and they will be applied to all selected files"
- Added "Document Type" label showing "(applied to all files)"
- Added "Access Control" section with clear header
- Full access control picker available for bulk uploads
- All selected access rules apply to all files in the batch

## Features

### Access Control Levels
Each document can have multiple access entries with different target types and permissions:

**Target Types:**
- **User** - Individual user access
- **Team** - Team-wide access  
- **Department** - Department-wide access

**Permissions:**
- **View** - Can only view/read the document
- **Download** - Can download the document
- **Manage** - Can manage access and delete (enforced by backend)

### How It Works

#### Single Upload
1. Upload file
2. Fill in title, description, type, and optional employee
3. Use Access Control Picker to add users, teams, or departments
4. Set permission level for each entry
5. Click "Upload Document"

#### Bulk Upload
1. Select up to 10 files
2. Choose document type (applied to all)
3. Use Access Control Picker to set access rules (applied to all)
4. Click "Upload N File(s)"
5. All files get the same type and access control settings

## Backend Integration

The frontend sends access control data as follows:

**Single Upload:**
```json
{
  "title": "Document Title",
  "description": "Optional description",
  "type": "offer_letter",
  "employeeId": "user-id-optional",
  "access": [
    {
      "targetType": "user",
      "userId": "user-id",
      "teamId": null,
      "permission": "view"
    },
    {
      "targetType": "team",
      "userId": null,
      "teamId": "team-id",
      "permission": "download"
    },
    {
      "targetType": "department",
      "userId": null,
      "teamId": "department-id",
      "permission": "manage"
    }
  ]
}
```

**Bulk Upload:**
```json
{
  "metadata": [
    {
      "title": "file1-title",
      "type": "offer_letter",
      "access": [
        {
          "targetType": "user",
          "userId": "user-id",
          "permission": "view"
        }
      ]
    },
    // ... more files
  ]
}
```

## API Endpoints

### Upload Single Document
- **POST** `/documents/upload`
- Supports multipart form-data
- Accepts access control array
- Returns: Document object with access entries

### Upload Multiple Documents  
- **POST** `/documents/upload-bulk`
- Supports multipart form-data (up to 10 files)
- Metadata includes access rules for each file
- Returns: Success/failed results

### Get Documents
- **GET** `/documents?page=1&limit=10&search=query&type=offer_letter`
- Filtered by user's access permissions
- Includes access entries in response

### Update Document Access
- **PUT** `/documents/:id/access`
- Update existing access rules
- Body: `{ "access": [...] }`

### Get Document Access List
- **GET** `/documents/:id/access`
- Returns all access entries for a document

## User Data Requirements

For the dropdowns to work, the system fetches:

1. **Users** - From `/users?pageNo=1&limit=200`
   - Required fields: `id`, `name`, `email`

2. **Teams & Departments** - From `/team`
   - Required fields: `id`, `name`, `type` (must be "team" or "department")
   - Filtered by type to show Teams and Departments separately

## Notes

- **Department Type Handling:** Departments use the same `teamId` field as teams, differentiated by the `type` field
- **Access Validation:** Backend validates all access entries and enforces permissions
- **Deduplication:** Frontend prevents duplicate selections
- **Bulk Consistency:** All files in a bulk upload get identical access settings
- **File Size Limit:** 10MB per file
- **Max Bulk Files:** 10 files per upload
- **Supported Formats:** PDF, DOC, DOCX, XLSX, CSV, TXT, PNG, JPG, JPEG

## Testing Checklist

- [ ] Single upload with user access
- [ ] Single upload with team access  
- [ ] Single upload with department access
- [ ] Bulk upload with mixed access control
- [ ] Permission levels work correctly
- [ ] Removing access entries works
- [ ] Dropdowns filter out already-selected items
- [ ] Access control saves to database
- [ ] Access control is returned in GET requests
