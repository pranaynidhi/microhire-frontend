// Test users for different roles and scenarios
export const testUsers = {
  // Student users
  students: [
    {
      id: 'student-1',
      email: 'john.student@test.com',
      password: 'password123',
      fullName: 'John Doe',
      role: 'student',
      phone: '+977-9841234567',
      location: 'kathmandu',
      dateOfBirth: '2000-05-15',
      bio: 'Computer Science student passionate about web development and AI. Looking for internship opportunities to gain practical experience.',
      skills: ['JavaScript', 'React', 'Python', 'Node.js', 'MongoDB'],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'Tribhuvan University',
          startYear: 2020,
          endYear: 2024,
          grade: '3.8 GPA'
        }
      ],
      avatar: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-15T08:00:00Z',
      lastLogin: '2024-12-20T10:30:00Z'
    },
    {
      id: 'student-2',
      email: 'priya.sharma@test.com',
      password: 'password123',
      fullName: 'Priya Sharma',
      role: 'student',
      phone: '+977-9851234567',
      location: 'pokhara',
      dateOfBirth: '2001-08-22',
      bio: 'Marketing student with a passion for digital marketing and content creation. Experienced in social media management.',
      skills: ['Digital Marketing', 'Content Writing', 'Social Media', 'Photoshop', 'Analytics'],
      education: [
        {
          degree: 'Bachelor of Business Administration',
          institution: 'Pokhara University',
          startYear: 2021,
          endYear: 2025,
          grade: '3.9 GPA'
        }
      ],
      avatar: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-02-10T09:15:00Z',
      lastLogin: '2024-12-20T14:20:00Z'
    },
    {
      id: 'student-3',
      email: 'ram.thapa@test.com',
      password: 'password123',
      fullName: 'Ram Thapa',
      role: 'student',
      phone: '+977-9861234567',
      location: 'chitwan',
      dateOfBirth: '1999-12-03',
      bio: 'Engineering student specializing in mechanical engineering. Interested in manufacturing and automation.',
      skills: ['AutoCAD', 'SolidWorks', 'Manufacturing', 'Quality Control', 'Project Management'],
      education: [
        {
          degree: 'Bachelor of Mechanical Engineering',
          institution: 'Kathmandu University',
          startYear: 2019,
          endYear: 2023,
          grade: '3.7 GPA'
        }
      ],
      avatar: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-20T11:00:00Z',
      lastLogin: '2024-12-19T16:45:00Z'
    }
  ],

  // Business users
  businesses: [
    {
      id: 'business-1',
      email: 'hr@technepal.com',
      password: 'password123',
      fullName: 'Tech Nepal HR',
      role: 'business',
      companyName: 'Tech Nepal Pvt. Ltd.',
      phone: '+977-01-4567890',
      location: 'kathmandu',
      website: 'https://technepal.com',
      industry: 'technology',
      companySize: '51-200',
      companyDescription: 'Leading technology company in Nepal specializing in software development, web applications, and digital solutions for businesses.',
      founded: '2018',
      avatar: null,
      companyLogo: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-05T10:00:00Z',
      lastLogin: '2024-12-20T09:00:00Z'
    },
    {
      id: 'business-2',
      email: 'careers@himalayabank.com',
      password: 'password123',
      fullName: 'Himalaya Bank Careers',
      role: 'business',
      companyName: 'Himalaya Bank Ltd.',
      phone: '+977-01-4411234',
      location: 'kathmandu',
      website: 'https://himalayabank.com',
      industry: 'finance',
      companySize: '200+',
      companyDescription: 'One of Nepal\'s leading commercial banks providing comprehensive banking services and financial solutions.',
      founded: '1993',
      avatar: null,
      companyLogo: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-08T12:30:00Z',
      lastLogin: '2024-12-20T11:15:00Z'
    },
    {
      id: 'business-3',
      email: 'internships@creativenepal.com',
      password: 'password123',
      fullName: 'Creative Nepal Team',
      role: 'business',
      companyName: 'Creative Nepal Agency',
      phone: '+977-01-5567890',
      location: 'pokhara',
      website: 'https://creativenepal.com',
      industry: 'marketing',
      companySize: '11-50',
      companyDescription: 'Full-service digital marketing agency helping businesses grow through creative campaigns and digital strategies.',
      founded: '2020',
      avatar: null,
      companyLogo: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-12T14:00:00Z',
      lastLogin: '2024-12-20T13:30:00Z'
    }
  ],

  // Admin users
  admins: [
    {
      id: 'admin-1',
      email: 'admin@microhire.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '+977-01-1234567',
      location: 'kathmandu',
      avatar: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-12-20T08:00:00Z'
    },
    {
      id: 'admin-2',
      email: 'support@microhire.com',
      password: 'admin123',
      fullName: 'Support Team',
      role: 'admin',
      phone: '+977-01-1234568',
      location: 'kathmandu',
      avatar: null,
      status: 'active',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-12-20T07:30:00Z'
    }
  ]
}

// Test internships
export const testInternships = [
  {
    id: 'internship-1',
    title: 'Frontend Developer Intern',
    companyId: 'business-1',
    companyName: 'Tech Nepal Pvt. Ltd.',
    companyLogo: null,
    category: 'technology',
    type: 'full-time',
    location: 'kathmandu',
    description: 'Join our frontend team to work on exciting web applications using React, TypeScript, and modern development tools. You\'ll collaborate with experienced developers and contribute to real projects.',
    requirements: 'Basic knowledge of HTML, CSS, JavaScript, and React. Familiarity with Git and responsive design principles.',
    responsibilities: 'Develop user interfaces, implement responsive designs, collaborate with backend developers, participate in code reviews, and contribute to project planning.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Git'],
    stipend: 25000,
    duration: 3,
    deadline: '2025-01-31T23:59:59Z',
    startDate: '2025-02-15T00:00:00Z',
    endDate: '2025-05-15T00:00:00Z',
    status: 'active',
    applicationsCount: 23,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'internship-2',
    title: 'Digital Marketing Intern',
    companyId: 'business-3',
    companyName: 'Creative Nepal Agency',
    companyLogo: null,
    category: 'marketing',
    type: 'part-time',
    location: 'pokhara',
    description: 'Learn digital marketing strategies, social media management, and content creation while working on real client campaigns.',
    requirements: 'Interest in digital marketing, basic understanding of social media platforms, good communication skills.',
    responsibilities: 'Create social media content, assist with campaign planning, analyze marketing metrics, support client communications.',
    skills: ['Social Media Marketing', 'Content Creation', 'Analytics', 'Photoshop', 'Communication'],
    stipend: 18000,
    duration: 4,
    deadline: '2025-02-15T23:59:59Z',
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-07-01T00:00:00Z',
    status: 'active',
    applicationsCount: 15,
    createdAt: '2024-12-05T11:30:00Z',
    updatedAt: '2024-12-18T09:15:00Z'
  },
  {
    id: 'internship-3',
    title: 'Banking Operations Intern',
    companyId: 'business-2',
    companyName: 'Himalaya Bank Ltd.',
    companyLogo: null,
    category: 'finance',
    type: 'full-time',
    location: 'kathmandu',
    description: 'Gain hands-on experience in banking operations, customer service, and financial analysis in Nepal\'s leading bank.',
    requirements: 'Business or Finance background, strong analytical skills, customer service orientation.',
    responsibilities: 'Assist with daily banking operations, support customer inquiries, help with financial reporting, learn compliance procedures.',
    skills: ['Financial Analysis', 'Customer Service', 'MS Excel', 'Communication', 'Attention to Detail'],
    stipend: 30000,
    duration: 6,
    deadline: '2025-01-20T23:59:59Z',
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-08-01T00:00:00Z',
    status: 'active',
    applicationsCount: 42,
    createdAt: '2024-11-28T13:00:00Z',
    updatedAt: '2024-12-19T16:20:00Z'
  },
  {
    id: 'internship-4',
    title: 'Backend Developer Intern',
    companyId: 'business-1',
    companyName: 'Tech Nepal Pvt. Ltd.',
    companyLogo: null,
    category: 'technology',
    type: 'full-time',
    location: 'kathmandu',
    description: 'Work with our backend team to develop APIs, manage databases, and build scalable server-side applications.',
    requirements: 'Knowledge of Node.js, Python, or Java. Understanding of databases and RESTful APIs.',
    responsibilities: 'Develop REST APIs, work with databases, implement authentication systems, write unit tests.',
    skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Git'],
    stipend: 28000,
    duration: 4,
    deadline: '2025-02-28T23:59:59Z',
    startDate: '2025-03-15T00:00:00Z',
    endDate: '2025-07-15T00:00:00Z',
    status: 'active',
    applicationsCount: 18,
    createdAt: '2024-12-10T15:45:00Z',
    updatedAt: '2024-12-20T10:00:00Z'
  }
]

// Test applications
export const testApplications = [
  {
    id: 'application-1',
    internshipId: 'internship-1',
    internshipTitle: 'Frontend Developer Intern',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john.student@test.com',
    companyId: 'business-1',
    companyName: 'Tech Nepal Pvt. Ltd.',
    coverLetter: 'I am excited to apply for the Frontend Developer Intern position. With my strong foundation in React and JavaScript, I believe I can contribute effectively to your team while learning from experienced developers.',
    status: 'pending',
    appliedAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z'
  },
  {
    id: 'application-2',
    internshipId: 'internship-2',
    internshipTitle: 'Digital Marketing Intern',
    studentId: 'student-2',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.sharma@test.com',
    companyId: 'business-3',
    companyName: 'Creative Nepal Agency',
    coverLetter: 'As a marketing student with hands-on experience in social media management, I am eager to join your team and contribute to creative campaigns while expanding my digital marketing skills.',
    status: 'reviewing',
    appliedAt: '2024-12-12T14:20:00Z',
    updatedAt: '2024-12-18T09:15:00Z'
  },
  {
    id: 'application-3',
    internshipId: 'internship-3',
    internshipTitle: 'Banking Operations Intern',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john.student@test.com',
    companyId: 'business-2',
    companyName: 'Himalaya Bank Ltd.',
    coverLetter: 'I am interested in gaining experience in the banking sector. My analytical skills and attention to detail make me a good fit for this operations internship.',
    status: 'rejected',
    appliedAt: '2024-12-08T11:45:00Z',
    updatedAt: '2024-12-16T13:30:00Z'
  },
  {
    id: 'application-4',
    internshipId: 'internship-4',
    internshipTitle: 'Backend Developer Intern',
    studentId: 'student-3',
    studentName: 'Ram Thapa',
    studentEmail: 'ram.thapa@test.com',
    companyId: 'business-1',
    companyName: 'Tech Nepal Pvt. Ltd.',
    coverLetter: 'Although my background is in mechanical engineering, I have been learning programming and am passionate about backend development. I would love the opportunity to transition into tech.',
    status: 'interviewing',
    appliedAt: '2024-12-14T16:00:00Z',
    updatedAt: '2024-12-19T10:20:00Z'
  }
]

// Test messages/conversations
export const testConversations = [
  {
    id: 'conversation-1',
    participants: ['student-1', 'business-1'],
    otherUser: {
      id: 'business-1',
      fullName: 'Tech Nepal HR',
      avatar: null,
      isOnline: true
    },
    lastMessage: {
      id: 'message-1',
      content: 'Thank you for your application. We would like to schedule an interview.',
      senderId: 'business-1',
      createdAt: '2024-12-19T14:30:00Z'
    },
    unreadCount: 1,
    updatedAt: '2024-12-19T14:30:00Z'
  },
  {
    id: 'conversation-2',
    participants: ['student-2', 'business-3'],
    otherUser: {
      id: 'business-3',
      fullName: 'Creative Nepal Team',
      avatar: null,
      isOnline: false
    },
    lastMessage: {
      id: 'message-2',
      content: 'We loved your portfolio! When can you start?',
      senderId: 'business-3',
      createdAt: '2024-12-18T11:15:00Z'
    },
    unreadCount: 0,
    updatedAt: '2024-12-18T11:15:00Z'
  }
]

// Test notifications
export const testNotifications = [
  {
    id: 'notification-1',
    userId: 'student-1',
    title: 'Application Status Update',
    message: 'Your application for Frontend Developer Intern has been reviewed.',
    type: 'application_update',
    read: false,
    createdAt: '2024-12-19T15:00:00Z'
  },
  {
    id: 'notification-2',
    userId: 'student-2',
    title: 'New Message',
    message: 'You have a new message from Creative Nepal Agency.',
    type: 'new_message',
    read: false,
    createdAt: '2024-12-18T11:16:00Z'
  },
  {
    id: 'notification-3',
    userId: 'business-1',
    title: 'New Application',
    message: 'John Doe has applied for your Frontend Developer Intern position.',
    type: 'new_application',
    read: true,
    createdAt: '2024-12-15T10:31:00Z'
  }
]

// Login credentials for easy testing
export const testCredentials = {
  students: [
    { email: 'john.student@test.com', password: 'password123', role: 'student' },
    { email: 'priya.sharma@test.com', password: 'password123', role: 'student' },
    { email: 'ram.thapa@test.com', password: 'password123', role: 'student' }
  ],
  businesses: [
    { email: 'hr@technepal.com', password: 'password123', role: 'business' },
    { email: 'careers@himalayabank.com', password: 'password123', role: 'business' },
    { email: 'internships@creativenepal.com', password: 'password123', role: 'business' }
  ],
  admins: [
    { email: 'admin@microhire.com', password: 'admin123', role: 'admin' },
    { email: 'support@microhire.com', password: 'admin123', role: 'admin' }
  ]
}

// Helper function to get user by email
export const getUserByEmail = (email) => {
  const allUsers = [...testUsers.students, ...testUsers.businesses, ...testUsers.admins]
  return allUsers.find(user => user.email === email)
}

// Helper function to get user by ID
export const getUserById = (id) => {
  const allUsers = [...testUsers.students, ...testUsers.businesses, ...testUsers.admins]
  return allUsers.find(user => user.id === id)
}

// Helper function to get internships by company
export const getInternshipsByCompany = (companyId) => {
  return testInternships.filter(internship => internship.companyId === companyId)
}

// Helper function to get applications by student
export const getApplicationsByStudent = (studentId) => {
  return testApplications.filter(application => application.studentId === studentId)
}

// Helper function to get applications by company
export const getApplicationsByCompany = (companyId) => {
  return testApplications.filter(application => application.companyId === companyId)
}