const mongoose = require('mongoose');
require('dotenv').config();

const Internship = require('./models/Internship');

const internships = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechFlow',
    companyColor: '#3B82F6',
    location: 'Remote',
    stipend: 15000,
    duration: '3 Months',
    type: 'internship',
    skills: ['React', 'CSS', 'JavaScript'],
    description: 'Looking for a passionate frontend developer intern to help build beautiful user interfaces.',
    requirements: ['Knowledge of React', 'Basic understanding of CSS/HTML'],
    applicantCount: 145,
    isActive: true
  },
  {
    title: 'Data Science Intern',
    company: 'DataCorp',
    companyColor: '#10B981',
    location: 'Bangalore',
    stipend: 25000,
    duration: '6 Months',
    type: 'internship',
    skills: ['Python', 'SQL', 'Pandas'],
    description: 'Join our data science team and work on real-world datasets to extract meaningful insights.',
    requirements: ['Proficient in Python', 'Familiarity with SQL'],
    applicantCount: 89,
    isActive: true
  },
  {
    title: 'UI/UX Design Intern',
    company: 'CreativeSpace',
    companyColor: '#F59E0B',
    location: 'Pune',
    stipend: 10000,
    duration: '2 Months',
    type: 'internship',
    skills: ['Figma', 'Prototyping', 'User Research'],
    description: 'We are seeking a creative UI/UX intern to design user-centric digital experiences.',
    requirements: ['Portfolio of design work', 'Experience with Figma'],
    applicantCount: 210,
    isActive: true
  },
  {
    title: 'Backend Node.js Intern',
    company: 'ServerTech',
    companyColor: '#8B5CF6',
    location: 'Remote',
    stipend: 20000,
    duration: '3 Months',
    type: 'internship',
    skills: ['Node.js', 'Express', 'MongoDB'],
    description: 'Help us scale our backend infrastructure using Node.js and MongoDB.',
    requirements: ['Basic understanding of APIs', 'Familiarity with Node.js'],
    applicantCount: 120,
    isActive: true
  },
  {
    title: 'Marketing & Sales Intern',
    company: 'GrowthHackers',
    companyColor: '#EC4899',
    location: 'Delhi',
    stipend: 8000,
    duration: '4 Months',
    type: 'internship',
    skills: ['SEO', 'Content Writing', 'Social Media'],
    description: 'Learn growth marketing strategies and assist with our social media campaigns.',
    requirements: ['Excellent communication skills', 'Creative thinking'],
    applicantCount: 340,
    isActive: true
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI is not set in .env file.');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected for seeding.');

    await Internship.deleteMany({});
    console.log('🗑️ Existing internships cleared.');

    await Internship.insertMany(internships);
    console.log('🌱 Mock internships successfully added.');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
