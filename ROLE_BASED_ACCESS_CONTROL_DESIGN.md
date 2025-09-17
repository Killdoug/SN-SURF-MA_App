# Role-Based Access Control (RBAC) Design - Involuntary Offboarding Application

## Overview

This document defines the comprehensive role-based access control system for the involuntary offboarding application, ensuring proper security, data protection, and workflow efficiency across all user types.

## Role Hierarchy and Definitions

### 1. Submitters (Case Initiators)
**Primary Users**: Managers, Team Leads, Department Heads  
**Scope**: Limited to case creation and basic tracking

#### Permissions:
- **Create Cases**: Submit new offboarding cases
- **View Own Cases**: Access cases they submitted
- **Update Case Details**: Modify case information before assignment
- **Upload Supporting Documents**: Attach relevant files
- **View Case Status**: Track progress of their submitted cases
- **Receive Notifications**: Get updates on case status changes

#### Restrictions:
- Cannot access cases submitted by others
- Cannot modify cases after assignment to HRBP
- Cannot access employee personal data beyond basic info
- Cannot generate or view offboarding documents
- Cannot access compliance or legal information

#### ServiceNow Implementation:
```javascript
// Role: offboard_submitter
// ACL Rules:
- x_snc_offboard_case: read (requested_by = gs.getUserID())
- x_snc_offboard_case: write (requested_by = gs.getUserID() AND state = 'New')
- x_snc_offboard_employee: read (limited fields only)
- x_snc_offboard_document: none
```

### 2. Service Providers (Case Managers/HRBPs)
**Primary Users**: HR Business Partners, Regional HR Managers  
**Scope**: Full case management and processing

#### Permissions:
- **Full Case Access**: View and manage all assigned cases
- **Case Assignment**: Receive and process assigned cases
- **Employee Data Access**: View complete employee information
- **Document Generation**: Generate offboarding documents
- **Workflow Management**: Move cases through workflow states
- **Compliance Review**: Access compliance flags and requirements
- **Reporting**: Generate case reports and analytics
- **Escalation**: Escalate cases to legal or senior management

#### Restrictions:
- Cannot access cases outside their region/assignment
- Cannot modify system configuration
- Cannot access other HRBP's cases without delegation
- Cannot bypass compliance requirements

#### ServiceNow Implementation:
```javascript
// Role: offboard_service_provider
// ACL Rules:
- x_snc_offboard_case: read (assigned_to = gs.getUserID() OR region matches user region)
- x_snc_offboard_case: write (assigned_to = gs.getUserID())
- x_snc_offboard_employee: read (all fields)
- x_snc_offboard_document: read, write (for assigned cases)
- x_snc_offboard_template: read
```

### 3. Process Administrators
**Primary Users**: HR Operations, System Administrators  
**Scope**: System configuration and process management

#### Permissions:
- **System Configuration**: Modify application settings
- **Template Management**: Create and edit document templates
- **Workflow Configuration**: Modify workflow definitions
- **User Management**: Assign roles and permissions
- **Data Management**: Import/export employee data
- **Integration Management**: Configure Workday and DocuSign settings
- **Audit Access**: View system audit logs
- **Performance Monitoring**: Access system performance metrics

#### Restrictions:
- Cannot access individual case details (unless specifically authorized)
- Cannot modify employee personal data
- Cannot bypass security controls
- Cannot access legal or compliance data

#### ServiceNow Implementation:
```javascript
// Role: offboard_process_admin
// ACL Rules:
- x_snc_offboard_template: read, write, create, delete
- x_snc_offboard_region: read, write, create, delete
- x_snc_offboard_compliance: read, write, create, delete
- sys_user: read (for role assignment)
- sys_audit: read
- All tables: admin (with restrictions)
```

### 4. Legal Reviewers
**Primary Users**: Legal Team, Compliance Officers  
**Scope**: Legal review and compliance validation

#### Permissions:
- **Legal Case Review**: Access cases requiring legal review
- **Compliance Validation**: Review compliance flags and requirements
- **Document Review**: Review generated documents for legal accuracy
- **Approval Authority**: Approve or reject cases from legal perspective
- **Legal Templates**: Access and modify legal document templates
- **Compliance Reporting**: Generate compliance reports
- **Audit Trail**: Access detailed case audit information

#### Restrictions:
- Cannot modify employee data
- Cannot bypass legal requirements
- Cannot access cases not requiring legal review
- Cannot modify system configuration

#### ServiceNow Implementation:
```javascript
// Role: offboard_legal_reviewer
// ACL Rules:
- x_snc_offboard_case: read (compliance_flags contains 'legal_required')
- x_snc_offboard_case: write (state = 'Legal Review')
- x_snc_offboard_document: read (legal documents only)
- x_snc_offboard_template: read, write (legal templates only)
- sys_audit: read (case-related only)
```

### 5. Senior Management
**Primary Users**: HR Directors, VPs, C-Level Executives  
**Scope**: Oversight and reporting

#### Permissions:
- **Executive Dashboard**: Access high-level case metrics
- **Reporting**: Generate executive reports and analytics
- **Case Oversight**: View all cases (read-only)
- **Approval Authority**: Approve high-value or sensitive cases
- **Trend Analysis**: Access historical data and trends
- **Compliance Oversight**: Monitor compliance adherence

#### Restrictions:
- Cannot modify individual cases
- Cannot access detailed employee personal data
- Cannot modify system configuration
- Cannot access legal documents

#### ServiceNow Implementation:
```javascript
// Role: offboard_senior_management
// ACL Rules:
- x_snc_offboard_case: read (all cases, limited fields)
- x_snc_offboard_employee: read (limited fields only)
- x_snc_offboard_document: none
- Reporting: full access
- Analytics: full access
```

### 6. IT Administrators
**Primary Users**: ServiceNow Administrators, IT Support  
**Scope**: Technical system management

#### Permissions:
- **System Administration**: Full system access for maintenance
- **Integration Management**: Manage all integrations
- **User Support**: Assist users with technical issues
- **Data Backup/Restore**: Perform system maintenance
- **Performance Tuning**: Optimize system performance
- **Security Management**: Manage security settings

#### Restrictions:
- Cannot access employee personal data
- Cannot modify business logic
- Cannot access legal or compliance data
- Must follow change management procedures

#### ServiceNow Implementation:
```javascript
// Role: offboard_it_admin
// ACL Rules:
- All tables: admin (with data restrictions)
- sys_user: admin
- sys_audit: read
- Integration tables: admin
- Configuration tables: admin
```

## Role Assignment and Delegation

### Automatic Role Assignment
```javascript
// Business Rule: Auto-assign roles based on user attributes
// Table: sys_user
// When: after, insert/update

(function executeRule(current, previous) {
    var userId = current.getUniqueValue();
    var department = current.getValue('department');
    var title = current.getValue('title');
    var location = current.getValue('location');
    
    // Assign roles based on user attributes
    if (department === 'Human Resources') {
        if (title.contains('Business Partner') || title.contains('HRBP')) {
            assignRole(userId, 'offboard_service_provider');
        } else if (title.contains('Director') || title.contains('VP')) {
            assignRole(userId, 'offboard_senior_management');
        }
    }
    
    if (department === 'Legal') {
        assignRole(userId, 'offboard_legal_reviewer');
    }
    
    if (department === 'IT' && title.contains('ServiceNow')) {
        assignRole(userId, 'offboard_it_admin');
    }
    
    // Managers get submitter role
    if (title.contains('Manager') || title.contains('Director')) {
        assignRole(userId, 'offboard_submitter');
    }
    
})(current, previous);

function assignRole(userId, roleName) {
    var grRole = new GlideRecord('sys_user_role');
    grRole.addQuery('name', roleName);
    grRole.query();
    
    if (grRole.next()) {
        var grUserRole = new GlideRecord('sys_user_has_role');
        grUserRole.addQuery('user', userId);
        grUserRole.addQuery('role', grRole.getUniqueValue());
        grUserRole.query();
        
        if (!grUserRole.hasNext()) {
            grUserRole.initialize();
            grUserRole.setValue('user', userId);
            grUserRole.setValue('role', grRole.getUniqueValue());
            grUserRole.insert();
        }
    }
}
```

### Role Delegation
```javascript
// Table: x_snc_offboard_delegation
// Fields: delegator, delegatee, start_date, end_date, permissions, active

// Business Rule: Handle role delegation
function delegateRole(delegatorId, delegateeId, permissions, startDate, endDate) {
    var grDelegation = new GlideRecord('x_snc_offboard_delegation');
    grDelegation.initialize();
    grDelegation.setValue('delegator', delegatorId);
    grDelegation.setValue('delegatee', delegateeId);
    grDelegation.setValue('permissions', JSON.stringify(permissions));
    grDelegation.setValue('start_date', startDate);
    grDelegation.setValue('end_date', endDate);
    grDelegation.setValue('active', true);
    grDelegation.insert();
}

// ACL Rule: Check delegation permissions
function hasDelegatedAccess(userId, resource, action) {
    var grDelegation = new GlideRecord('x_snc_offboard_delegation');
    grDelegation.addQuery('delegatee', userId);
    grDelegation.addQuery('active', true);
    grDelegation.addQuery('start_date', '<=', new GlideDateTime());
    grDelegation.addQuery('end_date', '>=', new GlideDateTime());
    grDelegation.query();
    
    while (grDelegation.next()) {
        var permissions = JSON.parse(grDelegation.getValue('permissions'));
        if (permissions[resource] && permissions[resource].includes(action)) {
            return true;
        }
    }
    return false;
}
```

## Access Control Lists (ACLs)

### Case Table ACLs
```javascript
// ACL: Case Read Access
// Table: x_snc_offboard_case
// Operation: read
// Condition: 
// - User has offboard_service_provider role AND (assigned_to = gs.getUserID() OR region matches user region)
// - User has offboard_submitter role AND requested_by = gs.getUserID()
// - User has offboard_legal_reviewer role AND compliance_flags contains 'legal_required'
// - User has offboard_senior_management role
// - User has offboard_it_admin role

// ACL: Case Write Access
// Table: x_snc_offboard_case
// Operation: write
// Condition:
// - User has offboard_service_provider role AND assigned_to = gs.getUserID()
// - User has offboard_submitter role AND requested_by = gs.getUserID() AND state = 'New'
// - User has offboard_legal_reviewer role AND state = 'Legal Review'
// - User has offboard_it_admin role
```

### Employee Table ACLs
```javascript
// ACL: Employee Data Access
// Table: x_snc_offboard_employee
// Operation: read
// Condition:
// - User has offboard_service_provider role (full access)
// - User has offboard_submitter role (limited fields only)
// - User has offboard_senior_management role (limited fields only)
// - User has offboard_it_admin role (full access)

// Field-level security for sensitive data
// Fields: salary, ssn, personal_address
// Access: offboard_service_provider, offboard_legal_reviewer only
```

### Document Table ACLs
```javascript
// ACL: Document Access
// Table: x_snc_offboard_document
// Operation: read
// Condition:
// - User has offboard_service_provider role AND case.assigned_to = gs.getUserID()
// - User has offboard_legal_reviewer role AND document_type contains 'legal'
// - User has offboard_it_admin role

// ACL: Document Write Access
// Table: x_snc_offboard_document
// Operation: write
// Condition:
// - User has offboard_service_provider role AND case.assigned_to = gs.getUserID()
// - User has offboard_it_admin role
```

## Security Considerations

### Data Protection
- **PII Encryption**: Sensitive employee data encrypted at rest
- **Audit Logging**: All data access logged for compliance
- **Data Retention**: Automatic data purging based on retention policies
- **Access Monitoring**: Real-time monitoring of data access patterns

### Compliance Requirements
- **GDPR Compliance**: Right to be forgotten, data portability
- **SOX Compliance**: Segregation of duties, audit trails
- **HIPAA Compliance**: Healthcare data protection (if applicable)
- **Regional Compliance**: Local data protection laws

### Security Controls
```javascript
// Business Rule: Security Audit Logging
// Table: All tables
// When: after, read/write/delete

(function executeRule(current, previous) {
    var auditRecord = new GlideRecord('sys_audit');
    auditRecord.initialize();
    auditRecord.setValue('table_name', current.getTableName());
    auditRecord.setValue('record_id', current.getUniqueValue());
    auditRecord.setValue('user', gs.getUserID());
    auditRecord.setValue('action', 'read'); // or 'write', 'delete'
    auditRecord.setValue('timestamp', new GlideDateTime());
    auditRecord.setValue('ip_address', gs.getSession().getClientIP());
    auditRecord.insert();
})(current, previous);
```

## Role Testing and Validation

### Test Scenarios
1. **Submitter Tests**:
   - Create case with valid data
   - Attempt to access other user's cases (should fail)
   - Attempt to modify assigned case (should fail)

2. **Service Provider Tests**:
   - Access assigned cases
   - Generate documents
   - Move cases through workflow
   - Attempt to access unassigned cases (should fail)

3. **Legal Reviewer Tests**:
   - Access cases requiring legal review
   - Approve/reject cases
   - Access legal documents
   - Attempt to access non-legal cases (should fail)

4. **Administrator Tests**:
   - Modify system configuration
   - Manage templates
   - Assign roles
   - Attempt to access employee data (should fail)

### Validation Checklist
- [ ] All roles have appropriate permissions
- [ ] No role has excessive permissions
- [ ] Delegation works correctly
- [ ] Audit logging captures all access
- [ ] Data encryption is working
- [ ] Compliance requirements met
- [ ] Performance impact is acceptable

## Implementation Timeline

### Week 1: Role Definition
- [ ] Define all roles and permissions
- [ ] Create role hierarchy
- [ ] Document access requirements

### Week 2: ACL Implementation
- [ ] Implement Access Control Lists
- [ ] Create field-level security
- [ ] Test basic access controls

### Week 3: Role Assignment
- [ ] Implement automatic role assignment
- [ ] Create delegation system
- [ ] Test role assignment logic

### Week 4: Security Testing
- [ ] Comprehensive security testing
- [ ] Penetration testing
- [ ] Compliance validation

### Week 5: Documentation and Training
- [ ] Create user guides
- [ ] Train administrators
- [ ] Document security procedures

---

*This RBAC design ensures proper security, compliance, and efficient workflow management for the involuntary offboarding application.*
