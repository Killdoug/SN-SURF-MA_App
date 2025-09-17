# Technical Implementation Guide - Involuntary Offboarding App

## Prerequisites for New Developers

### Required Knowledge
- ServiceNow platform fundamentals
- JavaScript/TypeScript basics
- REST API concepts
- Basic understanding of HR processes
- Git version control

### Development Environment Setup
1. **ServiceNow Instance Access**
   - Development instance
   - Test instance
   - Production instance (read-only for developers)

2. **Development Tools**
   - ServiceNow Studio (recommended)
   - VS Code with ServiceNow extensions
   - Git client
   - Postman for API testing

## Step-by-Step Implementation

### Step 1: Application Foundation Setup

#### 1.1 Create Application Scope
```javascript
// Navigate to System Definition > Applications
// Create new application with scope: x_snc_offboard
// Name: Involuntary Offboarding
// Description: End-to-end involuntary offboarding process management
```

#### 1.2 Configure Application Properties
```javascript
// Application Properties to set:
// - app.version: 1.0.0
// - app.description: Comprehensive offboarding solution
// - app.category: Human Resources
// - app.vendor: Your Company Name
```

### Step 2: Database Schema Implementation

#### 2.1 Create Core Tables

**Case Table Creation:**
```sql
-- Navigate to System Definition > Tables
-- Create table: x_snc_offboard_case

Fields to create:
1. number (String, 40, Auto Number: OFFBOARD-{YYYYMMDD}-{0001})
2. short_description (String, 160, Required)
3. description (String, 4000)
4. state (Choice, Required)
   - New
   - In Progress
   - Pending Documents
   - Pending Signature
   - Completed
   - Cancelled
5. priority (Choice, Required)
   - 1 - Critical
   - 2 - High
   - 3 - Moderate
   - 4 - Low
6. assigned_to (Reference: sys_user)
7. requested_by (Reference: sys_user)
8. employee (Reference: x_snc_offboard_employee)
9. region (Choice)
   - North America
   - Europe
   - Asia Pacific
   - Latin America
10. termination_date (Date/Time)
11. last_working_day (Date/Time)
12. reason_code (Choice)
    - Performance
    - Misconduct
    - Restructuring
    - Other
13. compliance_flags (String, 1000) -- JSON string for flags
14. workday_employee_id (String, 50)
15. severance_amount (Currency)
16. created_date (Date/Time, Auto)
17. due_date (Date/Time)
```

**Employee Table Creation:**
```sql
-- Create table: x_snc_offboard_employee

Fields to create:
1. workday_id (String, 50, Unique)
2. employee_id (String, 50)
3. first_name (String, 100)
4. last_name (String, 100)
5. email (Email, 100)
6. manager (Reference: sys_user)
7. department (String, 100)
8. job_title (String, 100)
9. hire_date (Date/Time)
10. location (String, 100)
11. region (Choice)
12. age (Integer)
13. years_of_service (Decimal, 5,2)
14. salary (Currency)
15. employment_type (Choice)
    - Full-time
    - Part-time
    - Contractor
    - Intern
16. last_updated (Date/Time, Auto)
```

#### 2.2 Create Supporting Tables

**Document Template Table:**
```sql
-- Create table: x_snc_offboard_template

Fields:
1. name (String, 100, Required)
2. description (String, 500)
3. template_type (Choice)
   - Termination Letter
   - Severance Agreement
   - Release of Claims
   - Benefits Information
3. region (Choice)
4. language (Choice)
5. template_content (HTML, 100000)
6. variables (String, 4000) -- JSON array of variable names
7. active (True/False, Default: true)
8. created_by (Reference: sys_user)
9. created_date (Date/Time, Auto)
```

**Document Tracking Table:**
```sql
-- Create table: x_snc_offboard_document

Fields:
1. case (Reference: x_snc_offboard_case)
2. template (Reference: x_snc_offboard_template)
3. document_name (String, 200)
4. document_type (Choice)
5. status (Choice)
   - Generated
   - Sent for Signature
   - Signed
   - Failed
6. generated_date (Date/Time)
7. sent_date (Date/Time)
8. completed_date (Date/Time)
9. docusign_envelope_id (String, 100)
10. file_attachment (Attachment)
```

### Step 3: Business Rules Implementation

#### 3.1 Case Creation Business Rule
```javascript
// Business Rule: Case Auto-Assignment
// Table: x_snc_offboard_case
// When: before, insert
// Advanced: true

(function executeRule(current, previous) {
    // Auto-assign based on region
    var region = current.getValue('region');
    var assignmentMap = {
        'North America': 'hrbp.na@company.com',
        'Europe': 'hrbp.eu@company.com',
        'Asia Pacific': 'hrbp.apac@company.com',
        'Latin America': 'hrbp.latam@company.com'
    };
    
    if (assignmentMap[region]) {
        var grUser = new GlideRecord('sys_user');
        grUser.addQuery('email', assignmentMap[region]);
        grUser.query();
        if (grUser.next()) {
            current.setValue('assigned_to', grUser.getUniqueValue());
        }
    }
    
    // Set due date (7 business days from creation)
    var dueDate = new GlideDateTime();
    dueDate.addDays(7);
    current.setValue('due_date', dueDate);
    
    // Set compliance flags
    var employee = current.getValue('employee');
    if (employee) {
        setComplianceFlags(current, employee);
    }
    
})(current, previous);

function setComplianceFlags(caseRecord, employeeId) {
    var grEmployee = new GlideRecord('x_snc_offboard_employee');
    grEmployee.get(employeeId);
    
    var flags = {};
    
    // Check age for OWBPA
    var age = grEmployee.getValue('age');
    if (age && parseInt(age) >= 40) {
        flags.owbpa_required = true;
    }
    
    // Check years of service
    var yearsOfService = grEmployee.getValue('years_of_service');
    if (yearsOfService && parseFloat(yearsOfService) >= 2) {
        flags.severance_eligible = true;
    }
    
    // Check region-specific requirements
    var region = grEmployee.getValue('region');
    if (region === 'Europe') {
        flags.gdpr_required = true;
    }
    
    caseRecord.setValue('compliance_flags', JSON.stringify(flags));
}
```

#### 3.2 State Change Business Rule
```javascript
// Business Rule: State Change Notifications
// Table: x_snc_offboard_case
// When: after, update
// Advanced: true

(function executeRule(current, previous) {
    var currentState = current.getValue('state');
    var previousState = previous.getValue('state');
    
    if (currentState !== previousState) {
        sendStateChangeNotification(current, currentState, previousState);
        
        // Trigger workflow if needed
        if (currentState === 'Pending Documents') {
            generateOffboardingDocuments(current);
        }
    }
})(current, previous);

function sendStateChangeNotification(caseRecord, newState, oldState) {
    var assignedTo = caseRecord.getValue('assigned_to');
    var requestedBy = caseRecord.getValue('requested_by');
    
    var notification = new GlideRecord('sysevent');
    notification.initialize();
    notification.setValue('name', 'offboard.case.state.change');
    notification.setValue('instance', caseRecord.getUniqueValue());
    notification.setValue('parm1', newState);
    notification.setValue('parm2', oldState);
    notification.setValue('parm3', assignedTo);
    notification.setValue('parm4', requestedBy);
    notification.insert();
}
```

### Step 4: Workflow Implementation

#### 4.1 Create Main Workflow
```javascript
// Workflow: Offboarding Process
// Table: x_snc_offboard_case

// Workflow Activities:
1. Case Review (Human Task)
   - Assigned to: assigned_to
   - Due date: 2 business days
   - Form: Case Review Form

2. Document Generation (Script Activity)
   - Script: generateOffboardingDocuments()

3. Manager Approval (Human Task)
   - Assigned to: requested_by
   - Due date: 1 business day
   - Form: Document Approval Form

4. Legal Review (Conditional)
   - Condition: compliance_flags contains "legal_required"
   - Human Task assigned to legal team

5. Send for Signature (Script Activity)
   - Script: sendToDocuSign()

6. Monitor Signature (Wait Condition)
   - Wait for: document status = "Signed"

7. Upload to Workday (Script Activity)
   - Script: uploadToWorkday()

8. Close Case (Script Activity)
   - Script: closeCase()
```

#### 4.2 Document Generation Script
```javascript
function generateOffboardingDocuments(caseRecord) {
    var caseId = caseRecord.getUniqueValue();
    var employeeId = caseRecord.getValue('employee');
    var region = caseRecord.getValue('region');
    
    // Get employee data
    var grEmployee = new GlideRecord('x_snc_offboard_employee');
    grEmployee.get(employeeId);
    
    // Get applicable templates
    var grTemplates = new GlideRecord('x_snc_offboard_template');
    grTemplates.addQuery('region', region);
    grTemplates.addQuery('active', true);
    grTemplates.query();
    
    while (grTemplates.next()) {
        var document = generateDocument(caseId, grTemplates, grEmployee);
        if (document) {
            gs.info('Generated document: ' + document.getValue('document_name'));
        }
    }
}

function generateDocument(caseId, template, employee) {
    var grDocument = new GlideRecord('x_snc_offboard_document');
    grDocument.initialize();
    grDocument.setValue('case', caseId);
    grDocument.setValue('template', template.getUniqueValue());
    grDocument.setValue('document_name', template.getValue('name') + '_' + employee.getValue('employee_id'));
    grDocument.setValue('document_type', template.getValue('template_type'));
    grDocument.setValue('status', 'Generated');
    grDocument.setValue('generated_date', new GlideDateTime());
    
    // Generate PDF content
    var content = processTemplate(template.getValue('template_content'), employee);
    var pdfContent = generatePDF(content);
    
    // Attach PDF to document record
    var attachment = new GlideSysAttachment();
    attachment.write(grDocument, 'document.pdf', 'application/pdf', pdfContent);
    
    grDocument.insert();
    return grDocument;
}

function processTemplate(templateContent, employee) {
    // Replace template variables with employee data
    var processedContent = templateContent;
    
    // Common variables
    processedContent = processedContent.replace(/\{first_name\}/g, employee.getValue('first_name'));
    processedContent = processedContent.replace(/\{last_name\}/g, employee.getValue('last_name'));
    processedContent = processedContent.replace(/\{employee_id\}/g, employee.getValue('employee_id'));
    processedContent = processedContent.replace(/\{hire_date\}/g, employee.getValue('hire_date'));
    processedContent = processedContent.replace(/\{job_title\}/g, employee.getValue('job_title'));
    processedContent = processedContent.replace(/\{department\}/g, employee.getValue('department'));
    
    return processedContent;
}
```

### Step 5: Workday Integration

#### 5.1 REST Message Configuration
```javascript
// Create REST Message: Workday Employee API
// Endpoint: https://your-workday-instance.com/ccx/api/v1/employees
// Authentication: OAuth 2.0

// REST Message Function: getEmployeeData
function getEmployeeData(workdayId) {
    var r = new sn_ws.RESTMessageV2('Workday Employee API', 'getEmployeeData');
    r.setStringParameter('employee_id', workdayId);
    
    var response = r.execute();
    var responseBody = response.getBody();
    var httpStatus = response.getStatusCode();
    
    if (httpStatus === 200) {
        var employeeData = JSON.parse(responseBody);
        return employeeData;
    } else {
        gs.error('Workday API Error: ' + httpStatus + ' - ' + responseBody);
        return null;
    }
}

// Scheduled Job: Sync Employee Data
function syncEmployeeData() {
    var grEmployees = new GlideRecord('x_snc_offboard_employee');
    grEmployees.addQuery('last_updated', '<', gs.daysAgo(1));
    grEmployees.query();
    
    while (grEmployees.next()) {
        var workdayId = grEmployees.getValue('workday_id');
        var employeeData = getEmployeeData(workdayId);
        
        if (employeeData) {
            updateEmployeeRecord(grEmployees, employeeData);
        }
    }
}

function updateEmployeeRecord(employeeRecord, workdayData) {
    employeeRecord.setValue('first_name', workdayData.firstName);
    employeeRecord.setValue('last_name', workdayData.lastName);
    employeeRecord.setValue('email', workdayData.email);
    employeeRecord.setValue('department', workdayData.department);
    employeeRecord.setValue('job_title', workdayData.jobTitle);
    employeeRecord.setValue('salary', workdayData.salary);
    employeeRecord.setValue('last_updated', new GlideDateTime());
    employeeRecord.update();
}
```

### Step 6: DocuSign Integration

#### 6.1 DocuSign REST Message
```javascript
// Create REST Message: DocuSign API
// Endpoint: https://demo.docusign.net/restapi/v2.1/accounts/{accountId}
// Authentication: OAuth 2.0

function sendDocumentForSignature(caseId, documentId) {
    var grDocument = new GlideRecord('x_snc_offboard_document');
    grDocument.get(documentId);
    
    var grCase = new GlideRecord('x_snc_offboard_case');
    grCase.get(caseId);
    
    var grEmployee = new GlideRecord('x_snc_offboard_employee');
    grEmployee.get(grCase.getValue('employee'));
    
    // Prepare DocuSign envelope
    var envelope = {
        "emailSubject": "Offboarding Documents - " + grEmployee.getValue('first_name') + " " + grEmployee.getValue('last_name'),
        "documents": [{
            "documentId": "1",
            "name": grDocument.getValue('document_name'),
            "documentBase64": getDocumentBase64(grDocument)
        }],
        "recipients": {
            "signers": [{
                "email": grEmployee.getValue('email'),
                "name": grEmployee.getValue('first_name') + " " + grEmployee.getValue('last_name'),
                "recipientId": "1",
                "tabs": {
                    "signHereTabs": [{
                        "documentId": "1",
                        "pageNumber": "1",
                        "xPosition": "100",
                        "yPosition": "100"
                    }]
                }
            }]
        },
        "status": "sent"
    };
    
    var r = new sn_ws.RESTMessageV2('DocuSign API', 'sendEnvelope');
    r.setStringParameter('envelope', JSON.stringify(envelope));
    
    var response = r.execute();
    var responseBody = response.getBody();
    var httpStatus = response.getStatusCode();
    
    if (httpStatus === 201) {
        var result = JSON.parse(responseBody);
        grDocument.setValue('docusign_envelope_id', result.envelopeId);
        grDocument.setValue('status', 'Sent for Signature');
        grDocument.setValue('sent_date', new GlideDateTime());
        grDocument.update();
        
        return result.envelopeId;
    } else {
        gs.error('DocuSign API Error: ' + httpStatus + ' - ' + responseBody);
        return null;
    }
}

function getDocumentBase64(documentRecord) {
    var attachment = new GlideSysAttachment();
    var attachments = attachment.getAttachments('x_snc_offboard_document', documentRecord.getUniqueValue());
    
    if (attachments.hasNext()) {
        var attachment = attachments.next();
        var inputStream = attachment.getInputStream();
        var base64 = GlideStringUtil.base64Encode(inputStream);
        return base64;
    }
    return null;
}
```

### Step 7: User Interface Development

#### 7.1 Service Portal Configuration
```javascript
// Create Service Portal: Offboarding Portal
// Theme: Custom HR theme
// Pages:
// 1. Manager Dashboard
// 2. HRBP Dashboard
// 3. Case Creation Form
// 4. Case Details
// 5. Document Management

// Widget: Case Creation Form
// Widget ID: offboard-case-creation

// HTML Template:
<div class="panel panel-default">
    <div class="panel-heading">
        <h4 class="panel-title">Create Offboarding Case</h4>
    </div>
    <div class="panel-body">
        <form name="caseForm" ng-submit="submitCase()">
            <div class="form-group">
                <label>Employee</label>
                <sn-record-picker field="employee" table="x_snc_offboard_employee" 
                                 display-field="first_name" 
                                 value-field="sys_id" 
                                 search-fields="first_name,last_name,employee_id">
                </sn-record-picker>
            </div>
            <div class="form-group">
                <label>Termination Date</label>
                <input type="date" class="form-control" ng-model="c.termination_date" required>
            </div>
            <div class="form-group">
                <label>Reason</label>
                <select class="form-control" ng-model="c.reason_code" required>
                    <option value="Performance">Performance</option>
                    <option value="Misconduct">Misconduct</option>
                    <option value="Restructuring">Restructuring</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" ng-model="c.description" rows="4"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Case</button>
        </form>
    </div>
</div>

// Client Script:
function($scope, $http, spUtil) {
    $scope.c = {};
    
    $scope.submitCase = function() {
        var data = {
            table: 'x_snc_offboard_case',
            short_description: 'Offboarding Case - ' + $scope.c.employee_display,
            description: $scope.c.description,
            employee: $scope.c.employee,
            termination_date: $scope.c.termination_date,
            reason_code: $scope.c.reason_code,
            requested_by: g_user.userID,
            state: 'New'
        };
        
        $http.post('/api/now/table/x_snc_offboard_case', data)
        .then(function(response) {
            spUtil.addInfoMessage('Case created successfully: ' + response.data.result.number);
            $scope.c = {};
        })
        .catch(function(error) {
            spUtil.addErrorMessage('Error creating case: ' + error.data.error.message);
        });
    };
}
```

### Step 8: Testing Implementation

#### 8.1 Automated Test Framework (ATF) Tests
```javascript
// Test Suite: Offboarding Application Tests

// Test 1: Case Creation
// Test Name: Test Case Creation
// Test Type: Server Side Test

var testCase = new GlideRecord('x_snc_offboard_case');
testCase.initialize();
testCase.setValue('short_description', 'Test Case');
testCase.setValue('description', 'Test Description');
testCase.setValue('state', 'New');
testCase.setValue('priority', '3');
testCase.insert();

var testCaseId = testCase.getUniqueValue();
assertTrue('Case should be created', testCaseId !== null);

// Test 2: Document Generation
// Test Name: Test Document Generation
// Test Type: Server Side Test

var testEmployee = new GlideRecord('x_snc_offboard_employee');
testEmployee.initialize();
testEmployee.setValue('workday_id', 'TEST001');
testEmployee.setValue('first_name', 'Test');
testEmployee.setValue('last_name', 'Employee');
testEmployee.setValue('email', 'test@company.com');
testEmployee.insert();

var testCase = new GlideRecord('x_snc_offboard_case');
testCase.initialize();
testCase.setValue('short_description', 'Test Case');
testCase.setValue('employee', testEmployee.getUniqueValue());
testCase.setValue('state', 'Pending Documents');
testCase.insert();

// Trigger document generation
generateOffboardingDocuments(testCase);

var grDocuments = new GlideRecord('x_snc_offboard_document');
grDocuments.addQuery('case', testCase.getUniqueValue());
grDocuments.query();

assertTrue('Documents should be generated', grDocuments.hasNext());
```

### Step 9: Deployment Checklist

#### 9.1 Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] User acceptance testing completed
- [ ] Documentation updated

#### 9.2 Deployment Steps
1. **Development to Test**
   - Export application from development
   - Import to test instance
   - Run test suite
   - Validate integrations

2. **Test to Production**
   - Final testing in test environment
   - Export application from test
   - Schedule maintenance window
   - Import to production
   - Validate production functionality

#### 9.3 Post-Deployment
- [ ] Monitor system performance
- [ ] Validate all integrations
- [ ] Check error logs
- [ ] User training completion
- [ ] Go-live support

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Integration Failures
**Problem**: Workday API calls failing
**Solution**: 
- Check authentication credentials
- Verify API endpoint URLs
- Review network connectivity
- Check API rate limits

#### 2. Document Generation Issues
**Problem**: PDFs not generating correctly
**Solution**:
- Verify template syntax
- Check employee data completeness
- Review PDF generation service
- Validate file permissions

#### 3. Workflow Stuck
**Problem**: Cases not progressing through workflow
**Solution**:
- Check workflow conditions
- Verify user assignments
- Review business rule logic
- Check for system locks

## Best Practices

### Development
1. **Code Organization**: Use consistent naming conventions
2. **Error Handling**: Implement comprehensive error handling
3. **Logging**: Use appropriate logging levels
4. **Performance**: Optimize database queries
5. **Security**: Follow security best practices

### Testing
1. **Unit Testing**: Test all business logic
2. **Integration Testing**: Test all external integrations
3. **User Testing**: Validate user workflows
4. **Performance Testing**: Test under load

### Maintenance
1. **Regular Updates**: Keep integrations current
2. **Monitoring**: Set up proper monitoring
3. **Documentation**: Maintain up-to-date documentation
4. **Backup**: Regular backup procedures

---

*This guide should be used in conjunction with the main development plan and updated as the implementation progresses.*
