import { Script, ScheduledJob } from '@servicenow/sdk/core'

// Data Migration Script - Migrate SharePoint Data to ServiceNow
Script({
    $id: Now.ID['script_data_migration'],
    name: 'migrateSharePointData',
    type: 'server',
    script: `
// Main migration function
function migrateSharePointData() {
    gs.print('Starting SharePoint data migration...');
    
    // First, migrate employees
    migrateEmployees();
    
    // Then, migrate cases
    migrateCases();
    
    // Finally, migrate transition language
    migrateTransitionLanguage();
    
    gs.print('SharePoint data migration completed!');
}

// Migrate employee data from SharePoint
function migrateEmployees() {
    gs.print('Migrating employee data...');
    
    var employees = [
        {
            employee_number: '1',
            employee_name: 'test employee',
            business_title: 'engineer',
            email: 'test@company.com',
            personal_email: 'doug.menger@gmail.com',
            age: 33,
            over_40: false,
            employee_country: 'United States',
            address: '123 qwe Street, NY 12345',
            security_clearance: true,
            ca_employee: false
        },
        {
            employee_number: '2',
            employee_name: 'test 2',
            business_title: 'somthing here',
            email: 'an email.com',
            personal_email: '',
            age: null,
            over_40: false,
            employee_country: '',
            address: '',
            security_clearance: true,
            ca_employee: false
        },
        {
            employee_number: '123',
            employee_name: 'Test for demo',
            business_title: 'Test for demo',
            email: 'Test for demo',
            personal_email: 'Test for demo',
            age: null,
            over_40: true,
            employee_country: '',
            address: 'Test for demo',
            security_clearance: true,
            ca_employee: false
        },
        {
            employee_number: '30694',
            employee_name: 'Michael Borden',
            business_title: 'Sr Account Executive',
            email: 'michael.borden@servicenow.com',
            personal_email: 'mborden1973@gmail.com',
            age: 7,
            over_40: true,
            employee_country: 'United States',
            address: '10921 Lansdowne Court Midlothian, VA 23113',
            security_clearance: false,
            ca_employee: false
        },
        {
            employee_number: '25141',
            employee_name: 'Joel Gonzalez',
            business_title: 'Sr Staff TSE, Integrations',
            email: 'joel.gonzalez@servicenow.com',
            personal_email: 'jegonzalez12@gmail.com',
            age: 6,
            over_40: true,
            employee_country: 'United States',
            address: '1208 Stratford Road Kansas City, MO 64113 United States of America',
            security_clearance: false,
            ca_employee: false,
            personal_phone: '+1 650-833-9526'
        },
        {
            employee_number: '29166',
            employee_name: 'D.J Carmickle',
            business_title: 'Senior Platform Architect',
            email: 'dennis.carmickle@servicenow.com',
            personal_email: 'dennis.carmickle@gmail.com',
            age: 22,
            over_40: true,
            employee_country: 'United States',
            address: '508 N Forrest St Ranson, WV 25438 United States of America',
            security_clearance: true,
            ca_employee: false
        },
        {
            employee_number: '20896',
            employee_name: 'Rick Calixte',
            business_title: 'Staff Software Engineer',
            email: '',
            personal_email: 'r.calixte@gmail.com',
            age: 32,
            over_40: false,
            employee_country: 'United States',
            address: '82 Taunton Avenue Boston, MA 02136 United States of America',
            security_clearance: false,
            ca_employee: false
        },
        {
            employee_number: '42047',
            employee_name: 'Michele Ludwig',
            business_title: 'Principal Engagement Manager',
            email: 'michele.ludwig@servicenow.com',
            personal_email: 'mich0921@gmail.com',
            age: 25,
            over_40: true,
            employee_country: 'United States',
            address: '1240 Garden Grove Road Joplin, MO 64801',
            security_clearance: false,
            ca_employee: false
        }
    ];
    
    var successCount = 0;
    var errorCount = 0;
    
    for (var i = 0; i < employees.length; i++) {
        var emp = employees[i];
        
        try {
            // Check if employee already exists
            var grEmployee = new GlideRecord('x_snc_offboard_employee');
            grEmployee.addQuery('employee_number', emp.employee_number);
            grEmployee.query();
            
            if (!grEmployee.hasNext()) {
                grEmployee.initialize();
                grEmployee.setValue('employee_number', emp.employee_number);
                grEmployee.setValue('employee_name', emp.employee_name);
                grEmployee.setValue('business_title', emp.business_title);
                grEmployee.setValue('email', emp.email);
                grEmployee.setValue('personal_email', emp.personal_email);
                grEmployee.setValue('age', emp.age);
                grEmployee.setValue('over_40', emp.over_40);
                grEmployee.setValue('employee_country', emp.employee_country);
                grEmployee.setValue('address', emp.address);
                grEmployee.setValue('security_clearance', emp.security_clearance);
                grEmployee.setValue('ca_employee', emp.ca_employee);
                grEmployee.setValue('personal_phone', emp.personal_phone || '');
                grEmployee.setValue('active', true);
                
                var employeeId = grEmployee.insert();
                if (employeeId) {
                    successCount++;
                    gs.print('Employee migrated successfully: ' + emp.employee_name + ' (ID: ' + employeeId + ')');
                } else {
                    errorCount++;
                    gs.print('Error migrating employee: ' + emp.employee_name);
                }
            } else {
                gs.print('Employee already exists: ' + emp.employee_name);
            }
        } catch (e) {
            errorCount++;
            gs.print('Error migrating employee ' + emp.employee_name + ': ' + e.message);
        }
    }
    
    gs.print('Employee migration completed. Success: ' + successCount + ', Errors: ' + errorCount);
}

// Migrate case data from SharePoint
function migrateCases() {
    gs.print('Migrating case data...');
    
    var cases = [
        {
            employee_number: '1',
            notification_date: '7/30/2025',
            last_day_of_work: '8/12/2025',
            termination_date: '9/1/2025',
            primary_termination_reason: 'Position Eliminated',
            secondary_termination_reason: 'Mutual Separation',
            weeks_severance: 15,
            months_cobra: 1,
            severance_amount: 35481,
            currency: 'USD',
            paid_cobra: false,
            internally_searching: true,
            email_status: false,
            template: 'Over 40 w/ transition',
            request_status: 'In Process'
        },
        {
            employee_number: '30694',
            notification_date: '7/3/2025',
            last_day_of_work: '7/3/2025',
            termination_date: '7/10/2025',
            primary_termination_reason: 'Poor Job Performance',
            secondary_termination_reason: '',
            weeks_severance: 6,
            months_cobra: 3,
            severance_amount: null,
            currency: '',
            paid_cobra: false,
            internally_searching: false,
            email_status: false,
            template: '',
            request_status: 'Requested'
        },
        {
            employee_number: '25141',
            notification_date: '3/4/2025',
            last_day_of_work: '3/4/2025',
            termination_date: '3/10/2025',
            primary_termination_reason: 'Poor Job Performance',
            secondary_termination_reason: '',
            weeks_severance: 8,
            months_cobra: 3,
            severance_amount: null,
            currency: '',
            paid_cobra: false,
            internally_searching: true,
            email_status: false,
            template: '',
            request_status: 'Requested'
        },
        {
            employee_number: '29166',
            notification_date: '7/15/2025',
            last_day_of_work: '7/15/2025',
            termination_date: '8/6/2025',
            primary_termination_reason: 'Poor Job Performance',
            secondary_termination_reason: '',
            weeks_severance: 6,
            months_cobra: 3,
            severance_amount: null,
            currency: '',
            paid_cobra: false,
            internally_searching: false,
            email_status: false,
            template: '',
            request_status: 'Requested'
        },
        {
            employee_number: '20896',
            notification_date: '8/1/2025',
            last_day_of_work: '8/8/2025',
            termination_date: '9/2/2025',
            primary_termination_reason: 'Poor Job Performance',
            secondary_termination_reason: '',
            weeks_severance: 8,
            months_cobra: 6,
            severance_amount: 29031,
            currency: 'USD',
            paid_cobra: true,
            internally_searching: false,
            email_status: false,
            template: '',
            request_status: 'Requested'
        },
        {
            employee_number: '42047',
            notification_date: '8/8/2025',
            last_day_of_work: '8/8/2025',
            termination_date: '9/2/2025',
            primary_termination_reason: 'Poor Job Performance',
            secondary_termination_reason: '',
            weeks_severance: 4,
            months_cobra: 3,
            severance_amount: 13231,
            currency: 'USD',
            paid_cobra: true,
            internally_searching: false,
            email_status: false,
            template: '',
            request_status: 'Requested'
        }
    ];
    
    var successCount = 0;
    var errorCount = 0;
    
    for (var i = 0; i < cases.length; i++) {
        var caseData = cases[i];
        
        try {
            // Find the employee record
            var grEmployee = new GlideRecord('x_snc_offboard_employee');
            grEmployee.addQuery('employee_number', caseData.employee_number);
            grEmployee.query();
            
            if (grEmployee.next()) {
                var employeeId = grEmployee.getUniqueValue();
                
                // Check if case already exists
                var grCase = new GlideRecord('x_snc_offboard_case');
                grCase.addQuery('employee', employeeId);
                grCase.addQuery('notification_date', caseData.notification_date);
                grCase.query();
                
                if (!grCase.hasNext()) {
                    grCase.initialize();
                    grCase.setValue('employee', employeeId);
                    grCase.setValue('short_description', 'Offboarding - ' + grEmployee.getValue('employee_name'));
                    grCase.setValue('notification_date', caseData.notification_date);
                    grCase.setValue('last_day_of_work', caseData.last_day_of_work);
                    grCase.setValue('termination_date', caseData.termination_date);
                    grCase.setValue('primary_termination_reason', caseData.primary_termination_reason);
                    grCase.setValue('secondary_termination_reason', caseData.secondary_termination_reason);
                    grCase.setValue('weeks_severance', caseData.weeks_severance);
                    grCase.setValue('months_cobra', caseData.months_cobra);
                    grCase.setValue('severance_amount', caseData.severance_amount);
                    grCase.setValue('currency', caseData.currency);
                    grCase.setValue('paid_cobra', caseData.paid_cobra);
                    grCase.setValue('internally_searching', caseData.internally_searching);
                    grCase.setValue('email_status', caseData.email_status);
                    grCase.setValue('template', caseData.template);
                    grCase.setValue('state', mapRequestStatus(caseData.request_status));
                    grCase.setValue('priority', '3'); // Default to Moderate
                    grCase.setValue('submit_date', new GlideDateTime());
                    
                    var caseId = grCase.insert();
                    if (caseId) {
                        successCount++;
                        gs.print('Case migrated successfully: ' + grEmployee.getValue('employee_name') + ' (Case ID: ' + caseId + ')');
                    } else {
                        errorCount++;
                        gs.print('Error migrating case for: ' + grEmployee.getValue('employee_name'));
                    }
                } else {
                    gs.print('Case already exists for: ' + grEmployee.getValue('employee_name'));
                }
            } else {
                errorCount++;
                gs.print('Employee not found for case: ' + caseData.employee_number);
            }
        } catch (e) {
            errorCount++;
            gs.print('Error migrating case for employee ' + caseData.employee_number + ': ' + e.message);
        }
    }
    
    gs.print('Case migration completed. Success: ' + successCount + ', Errors: ' + errorCount);
}

// Migrate transition language data
function migrateTransitionLanguage() {
    gs.print('Migrating transition language data...');
    
    var transitionLanguages = [
        {
            situation: "Commercial Account Exec; Working Transition",
            transition_language: "TRANSITION PERIOD. Between now and the Separation Date (the \\"Transition Period\\"), you will continue to use your best efforts to perform your currently assigned duties and responsibilities, and to transition these duties and responsibilities, as requested by the Company (the \\"Transition Services\\"). Specifically, the agreed upon Transition Services are expected to include but are not limited to: collaborating with management to communicate the change in coverage through transition calls, providing customer write-ups for each account to the new Sales Representative covering said account(s) and conducting de-briefing calls with the Representative(s) assigned to any additional or miscellaneous prospects and/or projects."
        },
        {
            situation: "Sales VP; Working Transition",
            transition_language: "TRANSITION PERIOD. Between now and the Separation Date (the \\"Transition Period\\"), you will continue to use your best efforts to your currently assigned duties and responsibilities, and to transition these duties and responsibilities, as requested by the Company (the \\"Transition Services\\"). Specifically, the agreed upon Transition Services are expected to include but are not limited to: collaborating with management to communicate the change in coverage through transition calls, participating in all activities associated with insuring a smooth transition and health of the West Enterprise area and ramping of new hire if joining prior to last day. You must continue to comply with all of your contractual and legal obligations to the Company, and comply with the Company's policies and procedures during the Transition Period. During the Transition Period, you will continue to receive your current base salary, subject to standard withholdings and deductions, and you will continue to be eligible for the Company's standard benefits, subject to the terms of such plans and programs."
        },
        {
            situation: "Customer Success; Working Transition",
            transition_language: "TRANSITION PERIOD. Between now and the Separation Date (the \\"Transition Period\\"), you will continue to use your best efforts to your currently assigned duties and responsibilities, and to transition these duties and responsibilities, as requested by the Company (the \\"Transition Services\\"). Specifically, the agreed upon Transition Services are expected to include but are not limited to: collaborating with management to communicate the change in coverage through transition calls, partnering with leadership to adapt Customer Success methodology to support MSP partners as well as refine success packaging and developing the detailed field enablement materials for global rollout. You must continue to comply with all of your contractual and legal obligations to the Company, and comply with the Company's policies and procedures during the Transition Period. During the Transition Period, you will continue to receive your current base salary, subject to standard withholdings and deductions, and you will continue to be eligible for the Company's standard benefits, subject to the terms of such plans and programs."
        },
        {
            situation: "No Working Transition; Available for Questions",
            transition_language: "TRANSITION PERIOD. Between now and the Separation Date (the \\"Transition Period\\"), you will use your best efforts to transition your duties and responsibilities, as requested by the Company (the \\"Transition Services\\"). You are expected to be available for questions during the Transition Period, but you are not expected to report to any Company office or event during the Transition Period. You must continue to comply with all of your contractual and legal obligations to the Company, and comply with the Company's policies and procedures during the Transition Period. During the Transition Period, you will continue to receive your current base salary, subject to standard withholdings and deductions and you will continue to be eligible for the Company's standard benefits, subject to the terms of such plans and programs."
        },
        {
            situation: "Technology Consultant; Working Transition",
            transition_language: "TRANSITION PERIOD. Between now and the Separation Date (the \\"Transition Period\\"), you will continue to use your best efforts to perform your currently assigned duties and responsibilities, and to transition these duties and responsibilities, as requested by the Company (the \\"Transition Services\\"). During the next two weeks, you will be expected to work with Paul Rice and any other team members as necessary to provide up to date status and documentation on your current activities. You must continue to comply with all of your contractual and legal obligations to the Company, and comply with the Company's policies and procedures during the Transition Period. During the Transition Period, you will continue to receive your current base salary, subject to standard withholdings and deductions, and you will continue to be eligible for the Company's standard benefits, subject to the terms of such plans and programs."
        }
    ];
    
    var successCount = 0;
    
    for (var i = 0; i < transitionLanguages.length; i++) {
        var tl = transitionLanguages[i];
        
        try {
            var grTL = new GlideRecord('x_snc_offboard_transition_language');
            grTL.addQuery('situation', tl.situation);
            grTL.query();
            
            if (!grTL.hasNext()) {
                grTL.initialize();
                grTL.setValue('situation', tl.situation);
                grTL.setValue('transition_language', tl.transition_language);
                grTL.setValue('active', true);
                
                var tlId = grTL.insert();
                if (tlId) {
                    successCount++;
                    gs.print('Transition language imported: ' + tl.situation);
                }
            } else {
                gs.print('Transition language already exists: ' + tl.situation);
            }
        } catch (e) {
            gs.print('Error importing transition language ' + tl.situation + ': ' + e.message);
        }
    }
    
    gs.print('Transition language migration completed. Success: ' + successCount);
}

// Helper function to map request status
function mapRequestStatus(status) {
    var statusMap = {
        'Requested': 'New',
        'In Process': 'In Progress',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled',
        'Return to Sender': 'Cancelled'
    };
    return statusMap[status] || 'New';
}

// Run the migration
migrateSharePointData();
    `
})

// Scheduled Job to run data migration (optional)
ScheduledJob({
    $id: Now.ID['job_data_migration'],
    name: 'SharePoint Data Migration',
    script: 'migrateSharePointData',
    run: 'once',
    active: false, // Set to true when ready to run
})
