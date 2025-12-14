import { User, UserRole, LeaveRequest, AdjustmentRequest, RequestStatus, TimeEntry, TimeEntryType, Payslip, LeaveType, LeaveBalance, Deduction, Announcement, ExpenseRequest, ProfileUpdateRequest, Company, CompanyStatus, UserStatus } from './types';

export const SUPER_ADMIN_USER: User = {
    id: 'sa_01',
    name: 'Super Admin',
    email: 'admin@vpena.com',
    password: 'superadminpassword',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://picsum.photos/seed/superadmin/100/100',
    team: 'Platform',
    basicSalary: 0,
    hireDate: new Date('2020-01-01'),
    lastLogin: new Date(),
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date(),
};

export const COMPANIES: Company[] = [
    {
        id: 'c1',
        name: 'Vertex Innovations Ltd.',
        licenseCount: 50,
        usedLicenses: 7,
        status: CompanyStatus.ACTIVE,
        modules: { payroll: true, leave: true, expenses: true, reports: true, announcements: true },
        description: 'Leading tech innovation company specializing in software solutions.',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-12-01'),
        adminId: '3'
    },
    {
        id: 'c2',
        name: 'Summit Solutions Inc.',
        licenseCount: 10,
        usedLicenses: 3,
        status: CompanyStatus.ACTIVE,
        modules: { payroll: true, leave: true, expenses: false, reports: true, announcements: false },
        description: 'Consulting and solutions provider for enterprise clients.',
        createdAt: new Date('2022-06-20'),
        updatedAt: new Date('2024-11-15'),
        adminId: '7'
    },
    {
        id: 'c3',
        name: 'TechCorp Ghana',
        licenseCount: 25,
        usedLicenses: 12,
        status: CompanyStatus.ACTIVE,
        modules: { payroll: true, leave: false, expenses: true, reports: true, announcements: true },
        description: 'Ghana-based technology corporation.',
        createdAt: new Date('2023-08-10'),
        updatedAt: new Date('2024-10-20'),
        adminId: '8'
    }
];

// Dummy data with emails and passwords for domain-based login
export const USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@vertex.com', password: 'password123', role: UserRole.EMPLOYEE, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/alice/100/100', team: 'Frontend', companyId: 'c1', basicSalary: 8000, hireDate: new Date('2022-05-15'), mobileMoneyNumber: '0240123456', lastLogin: new Date('2024-12-10'), createdAt: new Date('2022-05-15'), updatedAt: new Date('2024-12-10') },
  { id: '2', name: 'Bob Williams', email: 'bob@vertex.com', password: 'password123', role: UserRole.EMPLOYEE, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/bob/100/100', team: 'Frontend', companyId: 'c1', basicSalary: 6000, hireDate: new Date('2024-06-15'), mobileMoneyNumber: '0551234567', lastLogin: new Date('2024-12-12'), createdAt: new Date('2024-06-15'), updatedAt: new Date('2024-12-12') },
  { id: '3', name: 'Charlie Brown', email: 'charlie@summit.inc', password: 'password123', role: UserRole.ADMIN, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/charlie/100/100', team: 'Management', companyId: 'c2', basicSalary: 70000, hireDate: new Date('2020-01-20'), mobileMoneyNumber: '0272345678', lastLogin: new Date('2024-12-13'), createdAt: new Date('2020-01-20'), updatedAt: new Date('2024-12-13') },
  { id: '4', name: 'Diana Prince', email: 'diana@vertex.com', password: 'password123', role: UserRole.EMPLOYEE, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/diana/100/100', team: 'Backend', companyId: 'c1', basicSalary: 3500, hireDate: new Date('2023-08-01'), mobileMoneyNumber: '0503456789', lastLogin: new Date('2024-12-11'), createdAt: new Date('2023-08-01'), updatedAt: new Date('2024-12-11') },
  { id: '5', name: 'Eva Green', email: 'eva@vertex.com', password: 'password123', role: UserRole.HR, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/eva/100/100', team: 'HR', companyId: 'c1', basicSalary: 12000, hireDate: new Date('2021-03-10'), mobileMoneyNumber: '0201112222', lastLogin: new Date('2024-12-14'), createdAt: new Date('2021-03-10'), updatedAt: new Date('2024-12-14') },
  { id: '6', name: 'Frank Miller', email: 'frank@vertex.com', password: 'password123', role: UserRole.OPERATIONS, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/frank/100/100', team: 'Operations', companyId: 'c1', basicSalary: 11000, hireDate: new Date('2021-07-22'), mobileMoneyNumber: '0543334444', lastLogin: new Date('2024-12-09'), createdAt: new Date('2021-07-22'), updatedAt: new Date('2024-12-09') },
  { id: '7', name: 'Grace Jones', email: 'grace@summit.inc', password: 'password123', role: UserRole.PAYMENTS, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/grace/100/100', team: 'Finance', companyId: 'c2', basicSalary: 15000, hireDate: new Date('2019-11-01'), mobileMoneyNumber: '0265556666', lastLogin: new Date('2024-12-08'), createdAt: new Date('2019-11-01'), updatedAt: new Date('2024-12-08') },
  { id: '8', name: 'Henry Wilson', email: 'henry@techcorp.gh', password: 'password123', role: UserRole.ADMIN, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/henry/100/100', team: 'IT', companyId: 'c3', basicSalary: 25000, hireDate: new Date('2023-08-10'), mobileMoneyNumber: '0577778888', lastLogin: new Date('2024-12-13'), createdAt: new Date('2023-08-10'), updatedAt: new Date('2024-12-13') },
  { id: '9', name: 'Ivy Chen', email: 'ivy@techcorp.gh', password: 'password123', role: UserRole.EMPLOYEE, status: UserStatus.ACTIVE, avatarUrl: 'https://picsum.photos/seed/ivy/100/100', team: 'Development', companyId: 'c3', basicSalary: 8500, hireDate: new Date('2023-09-15'), mobileMoneyNumber: '0599990000', lastLogin: new Date('2024-12-12'), createdAt: new Date('2023-09-15'), updatedAt: new Date('2024-12-12') },
  { id: '10', name: 'Jack Thompson', email: 'jack@techcorp.gh', password: 'password123', role: UserRole.HR, status: UserStatus.INACTIVE, avatarUrl: 'https://picsum.photos/seed/jack/100/100', team: 'HR', companyId: 'c3', basicSalary: 14000, hireDate: new Date('2023-10-01'), mobileMoneyNumber: '0511112222', lastLogin: new Date('2024-11-20'), createdAt: new Date('2023-10-01'), updatedAt: new Date('2024-11-20') },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'h1', userId: '1', leaveType: LeaveType.ANNUAL, startDate: new Date('2024-08-10'), endDate: new Date('2024-08-15'), reason: 'Family vacation', status: RequestStatus.APPROVED },
  { id: 'h2', userId: '2', leaveType: LeaveType.SICK, startDate: new Date('2024-09-01'), endDate: new Date('2024-09-03'), reason: 'Short trip', status: RequestStatus.PENDING },
];

export const LEAVE_BALANCES: LeaveBalance[] = [
    { userId: '1', annual: 15, maternity: 0, sick: 10 },
    { userId: '2', annual: 0, maternity: 0, sick: 8 }, // Not yet eligible for annual leave
    { userId: '3', annual: 15, maternity: 0, sick: 10 },
    { userId: '4', annual: 15, maternity: 12, sick: 5 },
    { userId: '5', annual: 15, maternity: 0, sick: 10 },
    { userId: '6', annual: 15, maternity: 0, sick: 10 },
    { userId: '7', annual: 15, maternity: 0, sick: 10 },
];


export const ADJUSTMENT_REQUESTS: AdjustmentRequest[] = [
    { id: 'a1', userId: '4', date: new Date(), adjustedTime: '09:05 Clock In', reason: 'Forgot to clock in on time.', status: RequestStatus.PENDING },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export const TIME_ENTRIES: TimeEntry[] = [
  // Alice Johnson's entries for today
  { id: 'te1', userId: '1', type: TimeEntryType.CLOCK_IN, timestamp: new Date(new Date().setHours(9, 1, 15)), location: '123 Main St, Anytown, USA', photoUrl: 'https://picsum.photos/seed/alice_in/400/400', synced: true },
  { id: 'te4', userId: '1', type: TimeEntryType.CLOCK_OUT, timestamp: new Date(new Date().setHours(17, 32, 10)), location: '123 Main St, Anytown, USA', photoUrl: 'https://picsum.photos/seed/alice_out/400/400', synced: true },

  // Alice Johnson's entries for yesterday (less than 8 hours)
  { id: 'te_y1', userId: '1', type: TimeEntryType.CLOCK_IN, timestamp: new Date(new Date(yesterday).setHours(9, 0, 5)), location: '123 Main St, Anytown, USA', photoUrl: 'https://picsum.photos/seed/alice_in_y/400/400', synced: true },
  { id: 'te_y2', userId: '1', type: TimeEntryType.CLOCK_OUT, timestamp: new Date(new Date(yesterday).setHours(15, 3, 20)), location: '123 Main St, Anytown, USA', photoUrl: 'https://picsum.photos/seed/alice_out_y/400/400', synced: true },


  // Bob Williams' entries for today
  { id: 'te5', userId: '2', type: TimeEntryType.CLOCK_IN, timestamp: new Date(new Date().setHours(8, 55, 20)), location: '456 Oak Ave, Anytown, USA', photoUrl: 'https://picsum.photos/seed/bob_in/400/400', synced: true },

  // Diana Prince's entries for today (related to her adjustment request)
  { id: 'te8', userId: '4', type: TimeEntryType.CLOCK_OUT, timestamp: new Date(new Date().setHours(18, 2, 30)), location: '789 Pine Ln, Anytown, USA', photoUrl: 'https://picsum.photos/seed/diana_out/400/400', synced: true },
];

// Mock payslip data for history list. Full details are fetched from server.
export const PAYSCLIP_HISTORY: Partial<Payslip>[] = USERS.flatMap(user => {
     const today = new Date();
     const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
     const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() -1, 0);
     return [
        { id: `ps-${user.id}-${lastMonth.getTime()}`, userId: user.id, payDate: lastMonth },
        { id: `ps-${user.id}-${twoMonthsAgo.getTime()}`, userId: user.id, payDate: twoMonthsAgo },
     ];
});


export const ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann1', title: 'Public Holiday Announcement', content: 'Please be reminded that this coming Friday is a public holiday. The office will be closed. Enjoy the long weekend!', author: 'Charlie Brown', date: new Date(new Date().setDate(new Date().getDate() - 1)), isRead: false },
    { id: 'ann2', title: 'End of Year Party', content: 'Get ready for our annual end-of-year party! More details to follow next week.', author: 'Charlie Brown', date: new Date('2023-12-01'), isRead: true },
];

export const EXPENSE_REQUESTS: ExpenseRequest[] = [
    { id: 'ex1', userId: '1', description: 'Client Lunch Meeting', amount: 150.75, date: new Date(new Date().setDate(new Date().getDate() - 5)), status: RequestStatus.APPROVED, receiptUrl: 'https://picsum.photos/seed/receipt1/400/600' },
    { id: 'ex2', userId: '4', description: 'Transport to UPSA Campus', amount: 50.00, date: new Date(new Date().setDate(new Date().getDate() - 2)), status: RequestStatus.PENDING, receiptUrl: 'https://picsum.photos/seed/receipt2/400/600' },
];

export const PROFILE_UPDATE_REQUESTS: ProfileUpdateRequest[] = [
    { id: 'pu1', userId: '2', fields: { mobileMoneyNumber: '024 new number' }, status: RequestStatus.PENDING },
];