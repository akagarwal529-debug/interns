require('dotenv').config();
const mongoose   = require('mongoose');
const User       = require('../models/User');
const Internship = require('../models/Internship');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed data
    await Internship.deleteMany({});
    console.log('🗑️  Cleared existing internships');

    // Create a recruiter account
    let recruiter = await User.findOne({ email: 'recruiter@demo.com' });
    if (!recruiter) {
      recruiter = await User.create({
        firstName: 'Demo', lastName: 'Recruiter',
        email: 'recruiter@demo.com', password: 'Demo@1234',
        role: 'recruiter', companyName: 'InternSaathi HQ', designation: 'HR Manager'
      });
      console.log('👤 Demo recruiter created → recruiter@demo.com / Demo@1234');
    }

    // Create a student account
    let student = await User.findOne({ email: 'student@demo.com' });
    if (!student) {
      student = await User.create({
        firstName: 'Demo', lastName: 'Student',
        email: 'student@demo.com', password: 'Demo@1234',
        role: 'student', college: 'IIT Delhi', degree: 'B.Tech CSE'
      });
      console.log('🎓 Demo student created → student@demo.com / Demo@1234');
    }

    // Seed internships
    const internships = [
      {
        title: 'Full Stack Developer Intern', company: 'Stripe', companyColor: '#635BFF',
        location: 'Remote (WFH)', city: 'Remote', type: 'online',
        stipend: 28000, stipendText: '₹28,000/month', duration: '3 Months',
        description: 'Work with our engineering team on next-gen payment infrastructure. You will build React components, Node.js APIs, and work closely with senior engineers on real production code.',
        skills: ['React', 'Node.js', 'MongoDB', 'REST APIs'], category: 'Technology',
        isFeatured: true, openings: 3, postedBy: recruiter._id, deadline: new Date(Date.now() + 30 * 86400000)
      },
      {
        title: 'Product Management Intern', company: 'Linkd', companyColor: '#0A66C2',
        location: 'Bengaluru', city: 'Bengaluru', type: 'hybrid',
        stipend: 30000, stipendText: '₹30,000/month', duration: '6 Months',
        description: 'Join our product team to define features, work with designers and engineers, and analyze user data to improve the platform for millions of users.',
        skills: ['Product Strategy', 'Analytics', 'Figma', 'SQL'], category: 'Operations',
        isFeatured: true, openings: 2, postedBy: recruiter._id, deadline: new Date(Date.now() + 25 * 86400000)
      },
      {
        title: 'UI/UX Design Intern', company: 'CreativeX Studio', companyColor: '#6366F1',
        location: 'Mumbai (Remote)', city: 'Mumbai', type: 'online',
        stipend: 15000, stipendText: '₹15,000/month', duration: '3 Months',
        description: 'Design beautiful and intuitive interfaces for web and mobile apps. You will work with Figma, conduct user research, and present designs to clients.',
        skills: ['Figma', 'UI Design', 'User Research', 'Prototyping'], category: 'Design',
        isFeatured: false, openings: 1, postedBy: recruiter._id, deadline: new Date(Date.now() + 20 * 86400000)
      },
      {
        title: 'Digital Marketing Intern', company: 'GrowthHive', companyColor: '#EC4899',
        location: 'Delhi', city: 'Delhi', type: 'hybrid',
        stipend: 12000, stipendText: '₹12,000/month', duration: '2 Months',
        description: 'Plan and execute social media campaigns, create content, analyze marketing metrics and grow brand presence across Instagram, LinkedIn, and YouTube.',
        skills: ['Social Media', 'SEO', 'Content Writing', 'Analytics'], category: 'Marketing',
        isFeatured: false, openings: 2, postedBy: recruiter._id, deadline: new Date(Date.now() + 15 * 86400000)
      },
      {
        title: 'Business Analyst Intern', company: 'DataLens', companyColor: '#F59E0B',
        location: 'Pune', city: 'Pune', type: 'online',
        stipend: 18000, stipendText: '₹18,000/month', duration: '4 Months',
        description: 'Analyze business data, create dashboards in Excel and Power BI, and provide actionable insights to help leadership make better decisions.',
        skills: ['Excel', 'Power BI', 'SQL', 'Data Analysis'], category: 'Finance',
        isFeatured: false, openings: 2, postedBy: recruiter._id, deadline: new Date(Date.now() + 18 * 86400000)
      },
      {
        title: 'Content Writing Intern', company: 'WordCraft', companyColor: '#10B981',
        location: 'Remote', city: 'Remote', type: 'online',
        stipend: 8000, stipendText: '₹8,000/month', duration: '3 Months',
        description: 'Write engaging blog posts, website copy, and marketing content. You will research topics, work with the SEO team, and produce high-quality written content.',
        skills: ['Content Writing', 'SEO', 'Research', 'Copywriting'], category: 'Content',
        isFeatured: false, openings: 3, postedBy: recruiter._id, deadline: new Date(Date.now() + 22 * 86400000)
      },
      {
        title: 'Machine Learning Intern', company: 'TechAI Labs', companyColor: '#8B5CF6',
        location: 'Hyderabad', city: 'Hyderabad', type: 'hybrid',
        stipend: 25000, stipendText: '₹25,000/month', duration: '6 Months',
        description: 'Work on real ML models using Python, TensorFlow, and Scikit-learn. You will train models, work on NLP projects, and present findings to the research team.',
        skills: ['Python', 'TensorFlow', 'NLP', 'Scikit-learn'], category: 'Technology',
        isFeatured: false, openings: 2, postedBy: recruiter._id, deadline: new Date(Date.now() + 28 * 86400000)
      },
      {
        title: 'HR Intern', company: 'PeopleFirst', companyColor: '#F472B6',
        location: 'Mumbai', city: 'Mumbai', type: 'offline',
        stipend: 10000, stipendText: '₹10,000/month', duration: '3 Months',
        description: 'Support the HR team in recruitment, onboarding, and employee engagement activities. Gain hands-on experience in talent acquisition and people operations.',
        skills: ['Communication', 'MS Office', 'Recruitment', 'HR Tools'], category: 'HR',
        isFeatured: false, openings: 1, postedBy: recruiter._id, deadline: new Date(Date.now() + 12 * 86400000)
      },
    ];

    const created = await Internship.insertMany(internships);
    console.log(`\n✅ Seeded ${created.length} internships successfully!\n`);
    console.log('─────────────────────────────────────────');
    console.log('🔐 Demo Login Credentials:');
    console.log('   Student  → student@demo.com  / Demo@1234');
    console.log('   Recruiter→ recruiter@demo.com / Demo@1234');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err);
    process.exit(1);
  }
};

seed();
