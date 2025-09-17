import { Script } from '@servicenow/sdk/core'

// Sample Data Creation Script
Script({
    $id: Now.ID['script_sample_data'],
    name: 'createSampleData',
    type: 'server',
    script: `
// Create sample document templates
function createSampleData() {
    gs.print('Creating sample data...');
    
    createDocumentTemplates();
    createSampleDocuments();
    
    gs.print('Sample data creation completed!');
}

// Create sample document templates
function createDocumentTemplates() {
    gs.print('Creating document templates...');
    
    var templates = [
        {
            name: 'Termination Letter - Standard',
            description: 'Standard termination letter template',
            template_type: 'Termination Letter',
            region: 'North America',
            language: 'English',
            template_content: '<html><body><h2>Termination Letter</h2><p>Dear {employee_name},</p><p>This letter serves as formal notice of your termination from ServiceNow, effective {termination_date}.</p><p>Reason for termination: {primary_termination_reason}</p><p>Your last day of work will be {last_day_of_work}.</p><p>Sincerely,<br/>HR Department</p></body></html>',
            variables: '["employee_name", "termination_date", "primary_termination_reason", "last_day_of_work"]',
            active: true
        },
        {
            name: 'Separation Agreement - Over 40',
            description: 'Separation agreement for employees over 40',
            template_type: 'Separation Agreement',
            region: 'North America',
            language: 'English',
            template_content: '<html><body><h2>Separation Agreement</h2><p>Dear {employee_name},</p><p>This agreement outlines the terms of your separation from ServiceNow.</p><p>Severance: {weeks_severance} weeks</p><p>COBRA: {months_cobra} months</p><p>OWBPA Disclosure: This agreement includes OWBPA disclosures as required by law.</p><p>Sincerely,<br/>HR Department</p></body></html>',
            variables: '["employee_name", "weeks_severance", "months_cobra"]',
            active: true
        },
        {
            name: 'Benefits Information',
            description: 'Benefits information for terminated employees',
            template_type: 'Benefits Information',
            region: 'North America',
            language: 'English',
            template_content: '<html><body><h2>Benefits Information</h2><p>Dear {employee_name},</p><p>This document outlines your benefits continuation options.</p><p>COBRA Coverage: {months_cobra} months</p><p>Health Insurance: Available through COBRA</p><p>Retirement: 401k options available</p><p>Sincerely,<br/>Benefits Department</p></body></html>',
            variables: '["employee_name", "months_cobra"]',
            active: true
        },
        {
            name: 'Exhibit A - Release of Claims',
            description: 'Exhibit A release of claims document',
            template_type: 'Exhibit A',
            region: 'North America',
            language: 'English',
            template_content: '<html><body><h2>Exhibit A - Release of Claims</h2><p>Dear {employee_name},</p><p>This document outlines the release of claims as part of your separation agreement.</p><p>By signing this document, you agree to release ServiceNow from all claims related to your employment.</p><p>Sincerely,<br/>Legal Department</p></body></html>',
            variables: '["employee_name"]',
            active: true
        },
        {
            name: 'Return Transportation Form',
            description: 'Return transportation form for international employees',
            template_type: 'Return Transportation Form',
            region: 'North America',
            language: 'English',
            template_content: '<html><body><h2>Return Transportation Form</h2><p>Dear {employee_name},</p><p>This form is for arranging your return transportation to your home country.</p><p>Please complete and return this form to arrange your transportation.</p><p>Sincerely,<br/>HR Department</p></body></html>',
            variables: '["employee_name"]',
            active: true
        }
    ];
    
    var successCount = 0;
    
    for (var i = 0; i < templates.length; i++) {
        var template = templates[i];
        
        try {
            var grTemplate = new GlideRecord('x_snc_offboard_template');
            grTemplate.addQuery('name', template.name);
            grTemplate.query();
            
            if (!grTemplate.hasNext()) {
                grTemplate.initialize();
                grTemplate.setValue('name', template.name);
                grTemplate.setValue('description', template.description);
                grTemplate.setValue('template_type', template.template_type);
                grTemplate.setValue('region', template.region);
                grTemplate.setValue('language', template.language);
                grTemplate.setValue('template_content', template.template_content);
                grTemplate.setValue('variables', template.variables);
                grTemplate.setValue('active', template.active);
                
                var templateId = grTemplate.insert();
                if (templateId) {
                    successCount++;
                    gs.print('Template created successfully: ' + template.name + ' (ID: ' + templateId + ')');
                }
            } else {
                gs.print('Template already exists: ' + template.name);
            }
        } catch (e) {
            gs.print('Error creating template ' + template.name + ': ' + e.message);
        }
    }
    
    gs.print('Document template creation completed. Success: ' + successCount);
}

// Create sample documents for existing cases
function createSampleDocuments() {
    gs.print('Creating sample documents for cases...');
    
    var grCases = new GlideRecord('x_snc_offboard_case');
    grCases.query();
    
    var successCount = 0;
    
    while (grCases.next()) {
        try {
            var caseId = grCases.getUniqueValue();
            var employeeName = grCases.employee.employee_name;
            
            // Create termination letter
            var grDoc1 = new GlideRecord('x_snc_offboard_document');
            grDoc1.initialize();
            grDoc1.setValue('case', caseId);
            grDoc1.setValue('document_name', 'Termination Letter - ' + employeeName);
            grDoc1.setValue('document_type', 'Termination Letter');
            grDoc1.setValue('status', 'Generated');
            grDoc1.setValue('generated_date', new GlideDateTime());
            grDoc1.insert();
            
            // Create separation agreement if severance > 0
            if (grCases.getValue('weeks_severance') > 0) {
                var grDoc2 = new GlideRecord('x_snc_offboard_document');
                grDoc2.initialize();
                grDoc2.setValue('case', caseId);
                grDoc2.setValue('document_name', 'Separation Agreement - ' + employeeName);
                grDoc2.setValue('document_type', 'Separation Agreement');
                grDoc2.setValue('status', 'Generated');
                grDoc2.setValue('generated_date', new GlideDateTime());
                grDoc2.insert();
            }
            
            // Create benefits information if COBRA > 0
            if (grCases.getValue('months_cobra') > 0) {
                var grDoc3 = new GlideRecord('x_snc_offboard_document');
                grDoc3.initialize();
                grDoc3.setValue('case', caseId);
                grDoc3.setValue('document_name', 'Benefits Information - ' + employeeName);
                grDoc3.setValue('document_type', 'Benefits Information');
                grDoc3.setValue('status', 'Generated');
                grDoc3.setValue('generated_date', new GlideDateTime());
                grDoc3.insert();
            }
            
            // Create Exhibit A if over 40
            var grEmployee = new GlideRecord('x_snc_offboard_employee');
            grEmployee.get(grCases.getValue('employee'));
            if (grEmployee.getValue('over_40') === 'true') {
                var grDoc4 = new GlideRecord('x_snc_offboard_document');
                grDoc4.initialize();
                grDoc4.setValue('case', caseId);
                grDoc4.setValue('document_name', 'Exhibit A - ' + employeeName);
                grDoc4.setValue('document_type', 'Exhibit A');
                grDoc4.setValue('status', 'Generated');
                grDoc4.setValue('generated_date', new GlideDateTime());
                grDoc4.insert();
            }
            
            successCount++;
            gs.print('Documents created for case: ' + employeeName);
            
        } catch (e) {
            gs.print('Error creating documents for case ' + grCases.getValue('number') + ': ' + e.message);
        }
    }
    
    gs.print('Sample document creation completed. Success: ' + successCount);
}

// Data validation script
function validateMigratedData() {
    gs.print('=== Data Migration Validation ===');
    
    // Count employees
    var grEmployee = new GlideRecord('x_snc_offboard_employee');
    grEmployee.query();
    gs.print('Total Employees: ' + grEmployee.getRowCount());
    
    // Count cases
    var grCase = new GlideRecord('x_snc_offboard_case');
    grCase.query();
    gs.print('Total Cases: ' + grCase.getRowCount());
    
    // Count timeline items
    var grTimeline = new GlideRecord('x_snc_offboard_case_timeline');
    grTimeline.query();
    gs.print('Total Timeline Items: ' + grTimeline.getRowCount());
    
    // Count documents
    var grDocument = new GlideRecord('x_snc_offboard_document');
    grDocument.query();
    gs.print('Total Documents: ' + grDocument.getRowCount());
    
    // Count templates
    var grTemplate = new GlideRecord('x_snc_offboard_template');
    grTemplate.query();
    gs.print('Total Templates: ' + grTemplate.getRowCount());
    
    // Count transition languages
    var grTL = new GlideRecord('x_snc_offboard_transition_language');
    grTL.query();
    gs.print('Total Transition Languages: ' + grTL.getRowCount());
    
    gs.print('=== Validation Complete ===');
}

// Run the sample data creation
createSampleData();
    `
})
