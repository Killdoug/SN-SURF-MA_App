import { BusinessRule, Script } from '@servicenow/sdk/core'

// Business Rule: Employee Age Calculation
BusinessRule({
    $id: Now.ID['br_employee_age'],
    name: 'Calculate Employee Age',
    table: 'x_snc_offboard_employee',
    when: 'before',
    action: ['insert', 'update'],
    script: Script({
        $id: Now.ID['script_employee_age'],
        name: 'calculateEmployeeAge',
        type: 'server',
        script: `
(function executeRule(current, previous) {
    var birthDate = current.getValue('birth_date');
    if (birthDate) {
        var age = GlideDateTime.subtract(new GlideDateTime(), new GlideDateTime(birthDate));
        current.setValue('age', Math.floor(age.getDayPart() / 365));
        current.setValue('over_40', current.getValue('age') >= 40);
    }
})(current, previous);
        `
    }),
    active: true,
    order: 100,
})

// Business Rule: Case Auto-Assignment
BusinessRule({
    $id: Now.ID['br_case_auto_assignment'],
    name: 'Case Auto-Assignment',
    table: 'x_snc_offboard_case',
    when: 'before',
    action: ['insert'],
    script: Script({
        $id: Now.ID['script_case_auto_assignment'],
        name: 'caseAutoAssignment',
        type: 'server',
        script: `
(function executeRule(current, previous) {
    // Auto-assign based on region
    var employee = current.getValue('employee');
    if (employee) {
        var grEmployee = new GlideRecord('x_snc_offboard_employee');
        grEmployee.get(employee);
        
        var region = grEmployee.getValue('employee_country');
        var assignmentMap = {
            'United States': 'hrbp.na@company.com',
            'Canada': 'hrbp.na@company.com',
            'Brazil': 'hrbp.latam@company.com',
            'Costa Rica': 'hrbp.latam@company.com',
            'Mexico': 'hrbp.latam@company.com'
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
        setComplianceFlags(current, grEmployee);
    }
})(current, previous);

function setComplianceFlags(caseRecord, employeeRecord) {
    var flags = {};
    
    // Check age for OWBPA
    var age = employeeRecord.getValue('age');
    if (age && parseInt(age) >= 40) {
        flags.owbpa_required = true;
    }
    
    // Check years of service
    var yearsOfService = employeeRecord.getValue('years_of_service');
    if (yearsOfService && parseFloat(yearsOfService) >= 2) {
        flags.severance_eligible = true;
    }
    
    // Check region-specific requirements
    var region = employeeRecord.getValue('employee_country');
    if (region === 'Canada') {
        flags.ca_requirements = true;
    }
    
    caseRecord.setValue('compliance_flags', JSON.stringify(flags));
}
        `
    }),
    active: true,
    order: 100,
})

// Business Rule: Case State Change Notifications
BusinessRule({
    $id: Now.ID['br_case_state_change'],
    name: 'Case State Change Notifications',
    table: 'x_snc_offboard_case',
    when: 'after',
    action: ['update'],
    script: Script({
        $id: Now.ID['script_case_state_change'],
        name: 'caseStateChangeNotifications',
        type: 'server',
        script: `
(function executeRule(current, previous) {
    var currentState = current.getValue('state');
    var previousState = previous.getValue('state');
    
    if (currentState !== previousState) {
        sendStateChangeNotification(current, currentState, previousState);
        
        // Trigger workflow if needed
        if (currentState === 'Pending Documents') {
            generateOffboardingDocuments(current);
        }
        
        // Generate timeline if case is new
        if (currentState === 'In Progress' && previousState === 'New') {
            generateCaseTimeline(current);
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
        `
    }),
    active: true,
    order: 200,
})

// Business Rule: Generate Case Timeline
BusinessRule({
    $id: Now.ID['br_generate_timeline'],
    name: 'Generate Case Timeline',
    table: 'x_snc_offboard_case',
    when: 'after',
    action: ['insert'],
    script: Script({
        $id: Now.ID['script_generate_timeline'],
        name: 'generateCaseTimeline',
        type: 'server',
        script: `
(function executeRule(current, previous) {
    generateCaseTimeline(current);
})(current, previous);

function generateCaseTimeline(caseRecord) {
    var caseId = caseRecord.getUniqueValue();
    var notificationDate = new GlideDateTime(caseRecord.getValue('notification_date'));
    
    // Define timeline items with days from notification
    var timelineItems = [
        {item: 'Create Paperwork', days: 1, sequence: 1},
        {item: 'Deliver Term Packet', days: 2, sequence: 2},
        {item: 'E-Sign Setup', days: 3, sequence: 3},
        {item: 'Update Workday', days: 5, sequence: 4},
        {item: 'Separation Agreement', days: 7, sequence: 5},
        {item: 'Submit Offboard Ticket', days: 10, sequence: 6},
        {item: 'Verify Term in Workday', days: 12, sequence: 7},
        {item: 'Send Last Day Email', days: 14, sequence: 8},
        {item: 'Upload Sep Docs to Workday', days: 16, sequence: 9},
        {item: 'Notify Payroll', days: 18, sequence: 10},
        {item: 'Close Case', days: 20, sequence: 11}
    ];
    
    // Create timeline records
    for (var i = 0; i < timelineItems.length; i++) {
        var timeline = new GlideRecord('x_snc_offboard_case_timeline');
        timeline.initialize();
        timeline.setValue('case', caseId);
        timeline.setValue('timeline_item', timelineItems[i].item);
        timeline.setValue('sequence', timelineItems[i].sequence);
        
        var dueDate = new GlideDateTime(notificationDate);
        dueDate.addDays(timelineItems[i].days);
        timeline.setValue('due_date', dueDate);
        
        timeline.insert();
    }
}
        `
    }),
    active: true,
    order: 300,
})

// Business Rule: Document Generation
BusinessRule({
    $id: Now.ID['br_document_generation'],
    name: 'Document Generation',
    table: 'x_snc_offboard_case',
    when: 'after',
    action: ['update'],
    script: Script({
        $id: Now.ID['script_document_generation'],
        name: 'documentGeneration',
        type: 'server',
        script: `
(function executeRule(current, previous) {
    var currentState = current.getValue('state');
    var previousState = previous.getValue('state');
    
    if (currentState === 'Pending Documents' && previousState !== 'Pending Documents') {
        generateOffboardingDocuments(current);
    }
})(current, previous);

function generateOffboardingDocuments(caseRecord) {
    var caseId = caseRecord.getUniqueValue();
    var employeeId = caseRecord.getValue('employee');
    var region = caseRecord.getValue('employee_country');
    
    // Get employee data
    var grEmployee = new GlideRecord('x_snc_offboard_employee');
    grEmployee.get(employeeId);
    
    // Generate termination letter
    createDocument(caseId, 'Termination Letter', grEmployee, caseRecord);
    
    // Generate separation agreement if severance > 0
    if (caseRecord.getValue('weeks_severance') > 0) {
        createDocument(caseId, 'Separation Agreement', grEmployee, caseRecord);
    }
    
    // Generate benefits information if COBRA > 0
    if (caseRecord.getValue('months_cobra') > 0) {
        createDocument(caseId, 'Benefits Information', grEmployee, caseRecord);
    }
}

function createDocument(caseId, documentType, employee, caseRecord) {
    var grDocument = new GlideRecord('x_snc_offboard_document');
    grDocument.initialize();
    grDocument.setValue('case', caseId);
    grDocument.setValue('document_name', documentType + '_' + employee.getValue('employee_name'));
    grDocument.setValue('document_type', documentType);
    grDocument.setValue('status', 'Generated');
    grDocument.setValue('generated_date', new GlideDateTime());
    
    grDocument.insert();
}
        `
    }),
    active: true,
    order: 400,
})
