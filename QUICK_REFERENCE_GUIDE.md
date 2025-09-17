# Quick Reference Guide - Involuntary Offboarding App

## Application Overview
**Scope**: `x_snc_offboard`  
**Name**: Involuntary Offboarding  
**Version**: 1.0.0  

## Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `x_snc_offboard_case` | Main case record | number, state, employee, assigned_to |
| `x_snc_offboard_employee` | Employee data | workday_id, first_name, last_name, region |
| `x_snc_offboard_document` | Document tracking | case, template, status, docusign_envelope_id |
| `x_snc_offboard_template` | Document templates | name, template_type, region, template_content |

## Workflow States

| State | Description | Next Actions |
|-------|-------------|--------------|
| New | Case created | Auto-assign, set compliance flags |
| In Progress | Under review | Generate documents |
| Pending Documents | Documents generated | Send for signature |
| Pending Signature | Sent to DocuSign | Monitor completion |
| Completed | Process finished | Upload to Workday |
| Cancelled | Process cancelled | Archive case |

## Key Business Rules

### Case Auto-Assignment
- **Trigger**: Before insert
- **Logic**: Assign based on employee region
- **Assignment Map**:
  - North America → hrbp.na@company.com
  - Europe → hrbp.eu@company.com
  - Asia Pacific → hrbp.apac@company.com
  - Latin America → hrbp.latam@company.com

### Compliance Flags
- **OWBPA Required**: Age ≥ 40
- **Severance Eligible**: Years of service ≥ 2
- **GDPR Required**: Region = Europe
- **Legal Review**: High-value severance or complex case

## Integration Endpoints

### Workday API
- **Base URL**: `https://your-workday-instance.com/ccx/api/v1/`
- **Authentication**: OAuth 2.0
- **Key Endpoints**:
  - `/employees/{id}` - Get employee data
  - `/employees/{id}/documents` - Upload documents

### DocuSign API
- **Base URL**: `https://demo.docusign.net/restapi/v2.1/`
- **Authentication**: OAuth 2.0
- **Key Endpoints**:
  - `/accounts/{accountId}/envelopes` - Send for signature
  - `/accounts/{accountId}/envelopes/{envelopeId}` - Get status

## Common Scripts

### Generate Documents
```javascript
generateOffboardingDocuments(caseRecord);
// Generates all applicable documents for a case
```

### Send to DocuSign
```javascript
sendDocumentForSignature(caseId, documentId);
// Sends document for electronic signature
```

### Sync Employee Data
```javascript
syncEmployeeData();
// Syncs employee data from Workday
```

## Service Portal Pages

| Page | URL | Purpose |
|------|-----|---------|
| Manager Dashboard | `/offboard/dashboard` | Case overview for managers |
| Create Case | `/offboard/create` | New case creation form |
| Case Details | `/offboard/case/{id}` | Case details and actions |
| Document Center | `/offboard/documents` | Document management |

## Widgets

| Widget | ID | Purpose |
|--------|----|---------| 
| Case Creation Form | `offboard-case-creation` | Create new cases |
| Case List | `offboard-case-list` | Display cases |
| Document Viewer | `offboard-document-viewer` | View documents |
| Status Tracker | `offboard-status-tracker` | Track case progress |

## REST APIs

### Case Management
- `GET /api/now/table/x_snc_offboard_case` - List cases
- `POST /api/now/table/x_snc_offboard_case` - Create case
- `PUT /api/now/table/x_snc_offboard_case/{id}` - Update case

### Document Management
- `GET /api/now/table/x_snc_offboard_document` - List documents
- `POST /api/now/table/x_snc_offboard_document` - Create document
- `GET /api/now/table/x_snc_offboard_document/{id}/file` - Download document

## Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Employee Data Sync | Daily at 2 AM | Sync employee data from Workday |
| Compliance Check | Weekly | Update compliance rules |
| Document Cleanup | Monthly | Archive old documents |

## Security Roles

| Role | Users | Permissions |
|------|-------|-------------|
| `offboard_submitter` | Managers, Team Leads | Create cases, view own cases, basic tracking |
| `offboard_service_provider` | HRBPs, Regional HR | Full case management, document generation, employee data access |
| `offboard_process_admin` | HR Operations, System Admins | System configuration, template management, user management |
| `offboard_legal_reviewer` | Legal Team, Compliance | Legal review, compliance validation, document approval |
| `offboard_senior_management` | HR Directors, VPs, C-Level | Executive oversight, reporting, case approval |
| `offboard_it_admin` | ServiceNow Admins, IT Support | Technical system management, integration management |

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| OFB001 | Employee not found in Workday | Verify employee ID |
| OFB002 | DocuSign envelope failed | Check DocuSign configuration |
| OFB003 | Document generation failed | Verify template syntax |
| OFB004 | Compliance check failed | Review compliance rules |

## Monitoring & Alerts

### Key Metrics
- Case processing time
- Document generation success rate
- DocuSign completion rate
- System uptime

### Alert Conditions
- Case stuck in state > 24 hours
- Document generation failure rate > 5%
- DocuSign failure rate > 10%
- Integration API errors

## Troubleshooting Commands

### Check Case Status
```javascript
var gr = new GlideRecord('x_snc_offboard_case');
gr.addQuery('number', 'OFFBOARD-20240101-0001');
gr.query();
if (gr.next()) {
    gs.print('State: ' + gr.getValue('state'));
    gs.print('Assigned to: ' + gr.getValue('assigned_to'));
}
```

### Check Document Status
```javascript
var gr = new GlideRecord('x_snc_offboard_document');
gr.addQuery('case', caseId);
gr.query();
while (gr.next()) {
    gs.print('Document: ' + gr.getValue('document_name') + 
             ' Status: ' + gr.getValue('status'));
}
```

### Test Workday Connection
```javascript
var r = new sn_ws.RESTMessageV2('Workday Employee API', 'getEmployeeData');
r.setStringParameter('employee_id', 'TEST001');
var response = r.execute();
gs.print('Status: ' + response.getStatusCode());
```

## Development Environment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `https://dev-instance.service-now.com` | Development work |
| Test | `https://test-instance.service-now.com` | Testing and validation |
| Production | `https://prod-instance.service-now.com` | Live system |

## Contact Information

| Role | Contact |
|------|---------|
| Development Lead | dev-lead@company.com |
| HR Business Partner | hrbp@company.com |
| Legal Team | legal@company.com |
| IT Support | it-support@company.com |

---

*Last Updated: [Current Date]*  
*Version: 1.0.0*
