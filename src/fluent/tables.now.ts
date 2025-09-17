import { Table, Field, Choice } from '@servicenow/sdk/core'

// Employee Table
Table({
    $id: Now.ID['employee_table'],
    name: 'x_snc_offboard_employee',
    label: 'Offboarding Employee',
    extends: 'sys_user',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

// Employee Table Fields
Field({
    $id: Now.ID['emp_employee_number'],
    name: 'employee_number',
    label: 'Employee Number',
    type: 'string',
    length: 50,
    required: true,
    unique: true,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_employee_name'],
    name: 'employee_name',
    label: 'Employee Name',
    type: 'string',
    length: 100,
    required: true,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_business_title'],
    name: 'business_title',
    label: 'Business Title',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_email'],
    name: 'email',
    label: 'Work Email',
    type: 'email',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_personal_email'],
    name: 'personal_email',
    label: 'Personal Email',
    type: 'email',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_personal_phone'],
    name: 'personal_phone',
    label: 'Personal Phone',
    type: 'string',
    length: 50,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_legal_name'],
    name: 'legal_name',
    label: 'Legal Name',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_address'],
    name: 'address',
    label: 'Address',
    type: 'string',
    length: 500,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_age'],
    name: 'age',
    label: 'Age',
    type: 'integer',
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_over_40'],
    name: 'over_40',
    label: 'Over 40',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_visa_type'],
    name: 'visa_type',
    label: 'Visa Type',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_security_clearance'],
    name: 'security_clearance',
    label: 'Security Clearance',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_ca_employee'],
    name: 'ca_employee',
    label: 'CA Employee',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_employee',
})

Choice({
    $id: Now.ID['emp_country_choice'],
    name: 'employee_country',
    label: 'Employee Country',
    choices: [
        { value: 'Brazil', label: 'Brazil' },
        { value: 'United States', label: 'United States' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Costa Rica', label: 'Costa Rica' },
        { value: 'Mexico', label: 'Mexico' }
    ],
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_workday_id'],
    name: 'workday_employee_id',
    label: 'Workday Employee ID',
    type: 'string',
    length: 50,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_hire_date'],
    name: 'hire_date',
    label: 'Hire Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_years_service'],
    name: 'years_of_service',
    label: 'Years of Service',
    type: 'decimal',
    precision: 5,
    scale: 2,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_salary'],
    name: 'salary',
    label: 'Salary',
    type: 'currency',
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_department'],
    name: 'department',
    label: 'Department',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_manager'],
    name: 'manager',
    label: 'Manager',
    type: 'reference',
    reference: 'sys_user',
    table: 'x_snc_offboard_employee',
})

Field({
    $id: Now.ID['emp_active'],
    name: 'active',
    label: 'Active',
    type: 'boolean',
    default: true,
    table: 'x_snc_offboard_employee',
})

// Case Table
Table({
    $id: Now.ID['case_table'],
    name: 'x_snc_offboard_case',
    label: 'Offboarding Case',
    extends: 'task',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

// Case Table Fields
Field({
    $id: Now.ID['case_number'],
    name: 'number',
    label: 'Case Number',
    type: 'string',
    length: 40,
    auto_number: 'OFFBOARD-{YYYYMMDD}-{0001}',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_employee'],
    name: 'employee',
    label: 'Employee',
    type: 'reference',
    reference: 'x_snc_offboard_employee',
    required: true,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_notification_date'],
    name: 'notification_date',
    label: 'Notification Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_last_day'],
    name: 'last_day_of_work',
    label: 'Last Day of Work',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_termination_date'],
    name: 'termination_date',
    label: 'Termination Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_expected_last_day'],
    name: 'expected_last_day',
    label: 'Expected Last Day',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_expected_termination'],
    name: 'expected_termination_date',
    label: 'Expected Termination Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Choice({
    $id: Now.ID['case_primary_reason_choice'],
    name: 'primary_termination_reason',
    label: 'Primary Termination Reason',
    choices: [
        { value: 'Position Eliminated', label: 'Position Eliminated' },
        { value: 'Poor Job Performance', label: 'Poor Job Performance' },
        { value: 'Employee Requested', label: 'Employee Requested' },
        { value: 'Mutual Separation', label: 'Mutual Separation' },
        { value: 'Other', label: 'Other' }
    ],
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_secondary_reason'],
    name: 'secondary_termination_reason',
    label: 'Secondary Termination Reason',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_tertiary_reason'],
    name: 'tertiary_reason',
    label: 'Tertiary Reason',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_weeks_severance'],
    name: 'weeks_severance',
    label: 'Weeks Severance',
    type: 'integer',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_months_cobra'],
    name: 'months_cobra',
    label: 'Months COBRA',
    type: 'integer',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_severance_amount'],
    name: 'severance_amount',
    label: 'Severance Amount',
    type: 'currency',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_currency'],
    name: 'currency',
    label: 'Currency',
    type: 'string',
    length: 10,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_paid_cobra'],
    name: 'paid_cobra',
    label: 'Paid COBRA',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_internally_searching'],
    name: 'internally_searching',
    label: 'Internally Searching',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_email_status'],
    name: 'email_status',
    label: 'Email Status',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_hr_notes'],
    name: 'hr_partner_notes',
    label: 'HR Partner Notes',
    type: 'string',
    length: 4000,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_termination_notes'],
    name: 'termination_notes',
    label: 'Termination Notes',
    type: 'string',
    length: 4000,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_blackout_date'],
    name: 'term_on_blackout_date',
    label: 'Term on Blackout Date',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_notification_to_term'],
    name: 'notification_to_term',
    label: 'Notification to Term',
    type: 'integer',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_create_separation'],
    name: 'create_separation_agreement',
    label: 'Create Separation Agreement',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_create_exit_packet'],
    name: 'create_exit_packet',
    label: 'Create Exit Packet',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_uploaded_documents'],
    name: 'uploaded_documents',
    label: 'Uploaded Documents',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Choice({
    $id: Now.ID['case_transportation_choice'],
    name: 'create_return_transportation_form',
    label: 'Create Return Transportation Form',
    choices: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' },
        { value: 'N/A', label: 'N/A' }
    ],
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_pip_updated'],
    name: 'pip_updated',
    label: 'PIP Updated',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_stock_options'],
    name: 'ee_has_stock_options',
    label: 'Employee Has Stock Options',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_security_email'],
    name: 'security_email_sent',
    label: 'Security Email Sent',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_payroll_case'],
    name: 'payroll_case',
    label: 'Payroll Case',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_case',
})

Choice({
    $id: Now.ID['case_template_choice'],
    name: 'template',
    label: 'Template',
    choices: [
        { value: 'Over 40 NO transition', label: 'Over 40 NO transition' },
        { value: 'Over 40 w/ transition', label: 'Over 40 w/ transition' },
        { value: 'Under 40 NO transition', label: 'Under 40 NO transition' },
        { value: 'Under 40 w/ transition', label: 'Under 40 w/ transition' },
        { value: 'NO severance', label: 'NO severance' },
        { value: 'OWBPA w/ transition', label: 'OWBPA w/ transition' },
        { value: 'OWBPA NO transition', label: 'OWBPA NO transition' }
    ],
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_transition_language_choice'],
    name: 'transition_language_choice',
    label: 'Transition Language Choice',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_transition_language'],
    name: 'transition_language',
    label: 'Transition Language',
    type: 'reference',
    reference: 'x_snc_offboard_transition_language',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_compliance_flags'],
    name: 'compliance_flags',
    label: 'Compliance Flags',
    type: 'string',
    length: 1000,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_workday_upload'],
    name: 'workday_upload',
    label: 'Workday Upload',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_payroll_notified'],
    name: 'payroll_notified',
    label: 'Payroll Notified',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_submit_date'],
    name: 'submit_date',
    label: 'Submit Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

Field({
    $id: Now.ID['case_due_date'],
    name: 'due_date',
    label: 'Due Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case',
})

// Transition Language Table
Table({
    $id: Now.ID['transition_language_table'],
    name: 'x_snc_offboard_transition_language',
    label: 'Transition Language',
    extends: 'sys_metadata',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

Field({
    $id: Now.ID['tl_situation'],
    name: 'situation',
    label: 'Situation',
    type: 'string',
    length: 200,
    required: true,
    table: 'x_snc_offboard_transition_language',
})

Field({
    $id: Now.ID['tl_transition_language'],
    name: 'transition_language',
    label: 'Transition Language',
    type: 'string',
    length: 4000,
    required: true,
    table: 'x_snc_offboard_transition_language',
})

Field({
    $id: Now.ID['tl_active'],
    name: 'active',
    label: 'Active',
    type: 'boolean',
    default: true,
    table: 'x_snc_offboard_transition_language',
})

// Case Timeline Table
Table({
    $id: Now.ID['case_timeline_table'],
    name: 'x_snc_offboard_case_timeline',
    label: 'Case Timeline',
    extends: 'sys_metadata',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

Field({
    $id: Now.ID['timeline_case'],
    name: 'case',
    label: 'Case',
    type: 'reference',
    reference: 'x_snc_offboard_case',
    required: true,
    table: 'x_snc_offboard_case_timeline',
})

Choice({
    $id: Now.ID['timeline_item_choice'],
    name: 'timeline_item',
    label: 'Timeline Item',
    choices: [
        { value: 'Create Paperwork', label: 'Create Paperwork' },
        { value: 'Deliver Term Packet', label: 'Deliver Term Packet' },
        { value: 'E-Sign Setup', label: 'E-Sign Setup' },
        { value: 'Update Workday', label: 'Update Workday' },
        { value: 'Create Email Reminders', label: 'Create Email Reminders' },
        { value: 'Follow Up', label: 'Follow Up' },
        { value: 'Separation Agreement', label: 'Separation Agreement' },
        { value: 'Submit Offboard Ticket', label: 'Submit Offboard Ticket' },
        { value: 'Verify Term in Workday', label: 'Verify Term in Workday' },
        { value: 'Send Last Day Email', label: 'Send Last Day Email' },
        { value: 'Send Exhibit A&C', label: 'Send Exhibit A&C' },
        { value: 'Email Reminder for Exhibit A', label: 'Email Reminder for Exhibit A' },
        { value: 'Exhibit A', label: 'Exhibit A' },
        { value: 'Upload Sep Docs to Workday', label: 'Upload Sep Docs to Workday' },
        { value: 'Notify Payroll', label: 'Notify Payroll' },
        { value: 'Close Case', label: 'Close Case' }
    ],
    required: true,
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_due_date'],
    name: 'due_date',
    label: 'Due Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_completed'],
    name: 'completed',
    label: 'Completed',
    type: 'boolean',
    default: false,
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_completed_date'],
    name: 'completed_date',
    label: 'Completed Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_completed_by'],
    name: 'completed_by',
    label: 'Completed By',
    type: 'reference',
    reference: 'sys_user',
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_notes'],
    name: 'notes',
    label: 'Notes',
    type: 'string',
    length: 1000,
    table: 'x_snc_offboard_case_timeline',
})

Field({
    $id: Now.ID['timeline_sequence'],
    name: 'sequence',
    label: 'Sequence',
    type: 'integer',
    table: 'x_snc_offboard_case_timeline',
})

// Document Table
Table({
    $id: Now.ID['document_table'],
    name: 'x_snc_offboard_document',
    label: 'Offboarding Document',
    extends: 'sys_metadata',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

Field({
    $id: Now.ID['doc_case'],
    name: 'case',
    label: 'Case',
    type: 'reference',
    reference: 'x_snc_offboard_case',
    required: true,
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_document_name'],
    name: 'document_name',
    label: 'Document Name',
    type: 'string',
    length: 200,
    required: true,
    table: 'x_snc_offboard_document',
})

Choice({
    $id: Now.ID['doc_type_choice'],
    name: 'document_type',
    label: 'Document Type',
    choices: [
        { value: 'Termination Letter', label: 'Termination Letter' },
        { value: 'Separation Agreement', label: 'Separation Agreement' },
        { value: 'Release of Claims', label: 'Release of Claims' },
        { value: 'Benefits Information', label: 'Benefits Information' },
        { value: 'Exhibit A', label: 'Exhibit A' },
        { value: 'Exhibit C', label: 'Exhibit C' },
        { value: 'Return Transportation Form', label: 'Return Transportation Form' }
    ],
    required: true,
    table: 'x_snc_offboard_document',
})

Choice({
    $id: Now.ID['doc_status_choice'],
    name: 'status',
    label: 'Status',
    choices: [
        { value: 'Generated', label: 'Generated' },
        { value: 'Sent for Signature', label: 'Sent for Signature' },
        { value: 'Signed', label: 'Signed' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Cancelled', label: 'Cancelled' }
    ],
    required: true,
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_generated_date'],
    name: 'generated_date',
    label: 'Generated Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_sent_date'],
    name: 'sent_date',
    label: 'Sent Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_completed_date'],
    name: 'completed_date',
    label: 'Completed Date',
    type: 'glide_date_time',
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_docusign_envelope_id'],
    name: 'docusign_envelope_id',
    label: 'DocuSign Envelope ID',
    type: 'string',
    length: 100,
    table: 'x_snc_offboard_document',
})

Field({
    $id: Now.ID['doc_template_used'],
    name: 'template_used',
    label: 'Template Used',
    type: 'reference',
    reference: 'x_snc_offboard_template',
    table: 'x_snc_offboard_document',
})

// Document Template Table
Table({
    $id: Now.ID['template_table'],
    name: 'x_snc_offboard_template',
    label: 'Document Template',
    extends: 'sys_metadata',
    create_access_controls: true,
    read_access_controls: true,
    update_access_controls: true,
    delete_access_controls: true,
    extendable: true,
})

Field({
    $id: Now.ID['tpl_name'],
    name: 'name',
    label: 'Template Name',
    type: 'string',
    length: 100,
    required: true,
    table: 'x_snc_offboard_template',
})

Field({
    $id: Now.ID['tpl_description'],
    name: 'description',
    label: 'Description',
    type: 'string',
    length: 500,
    table: 'x_snc_offboard_template',
})

Choice({
    $id: Now.ID['tpl_type_choice'],
    name: 'template_type',
    label: 'Template Type',
    choices: [
        { value: 'Termination Letter', label: 'Termination Letter' },
        { value: 'Separation Agreement', label: 'Separation Agreement' },
        { value: 'Release of Claims', label: 'Release of Claims' },
        { value: 'Benefits Information', label: 'Benefits Information' },
        { value: 'Exhibit A', label: 'Exhibit A' },
        { value: 'Exhibit C', label: 'Exhibit C' },
        { value: 'Return Transportation Form', label: 'Return Transportation Form' }
    ],
    required: true,
    table: 'x_snc_offboard_template',
})

Choice({
    $id: Now.ID['tpl_region_choice'],
    name: 'region',
    label: 'Region',
    choices: [
        { value: 'North America', label: 'North America' },
        { value: 'Europe', label: 'Europe' },
        { value: 'Asia Pacific', label: 'Asia Pacific' },
        { value: 'Latin America', label: 'Latin America' }
    ],
    table: 'x_snc_offboard_template',
})

Choice({
    $id: Now.ID['tpl_language_choice'],
    name: 'language',
    label: 'Language',
    choices: [
        { value: 'English', label: 'English' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'Portuguese', label: 'Portuguese' },
        { value: 'French', label: 'French' }
    ],
    default: 'English',
    table: 'x_snc_offboard_template',
})

Field({
    $id: Now.ID['tpl_template_content'],
    name: 'template_content',
    label: 'Template Content',
    type: 'string',
    length: 100000,
    table: 'x_snc_offboard_template',
})

Field({
    $id: Now.ID['tpl_variables'],
    name: 'variables',
    label: 'Variables',
    type: 'string',
    length: 4000,
    table: 'x_snc_offboard_template',
})

Field({
    $id: Now.ID['tpl_active'],
    name: 'active',
    label: 'Active',
    type: 'boolean',
    default: true,
    table: 'x_snc_offboard_template',
})
