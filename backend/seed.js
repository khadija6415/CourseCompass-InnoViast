require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Topic = require('./models/Topic');
const Resource = require('./models/Resource');

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Topic.deleteMany({}),
    Resource.deleteMany({}),
  ]);

  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await User.create({
    name: 'Khadija Wazeer',
    email: 'admin@coursecompass.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('Creating courses...');
  const dataStructures = await Course.create({ name: 'Data Structures', slug: 'data-structures', description: 'Core data structures used in computer science' });
  const oop = await Course.create({ name: 'Object Oriented Programming (C++)', slug: 'oop-cpp', description: 'OOP concepts using C++' });
  const python = await Course.create({ name: 'Python Programming', slug: 'python', description: 'Python fundamentals and applications' });

  console.log('Creating topics...');
  const trees = await Topic.create({ course: dataStructures._id, name: 'Trees', slug: 'trees', description: 'Binary trees, BST, traversal methods' });
  const linkedLists = await Topic.create({ course: dataStructures._id, name: 'Linked Lists', slug: 'linked-lists', description: 'Singly and doubly linked lists' });
  const pointers = await Topic.create({ course: oop._id, name: 'Pointers', slug: 'pointers', description: 'Pointer basics, pointer arithmetic, dynamic memory' });
  const loopsFunctions = await Topic.create({ course: python._id, name: 'Loops and Functions', slug: 'loops-functions', description: 'Control flow and function fundamentals in Python' });

  console.log('Creating resources...');
  await Resource.create([
    { topic: trees._id, title: 'Binary Tree in Data Structures Tutorial', url: 'https://www.youtube.com/watch?v=qH-9dhptjXE', source: 'YouTube', durationMinutes: 25, matchStatus: 'match', covers: ['Binary tree basics', 'Tree traversal', 'BST operations'], missing: [], notes: 'Clean explanation, matches syllabus closely', addedBy: admin._id },
    { topic: trees._id, title: 'Types of Binary Trees Explained | Full, Complete, Perfect, Balanced', url: 'https://www.youtube.com/watch?v=n3xQt-VF69Y', source: 'YouTube', durationMinutes: 45, matchStatus: 'extra', covers: ['Trees', 'Tree traversal'], missing: [], notes: 'Good content but goes deep into tree variants not required by the syllabus', addedBy: admin._id },
    { topic: trees._id, title: 'Binary Trees Tutorial - Introduction + Traversals + Code', url: 'https://www.youtube.com/watch?v=4s1Tcvm00pA', source: 'YouTube', durationMinutes: 30, matchStatus: 'missing', covers: ['Tree traversal code'], missing: ['BST fundamentals', 'Basic terminology'], notes: 'Assumes prior BST knowledge, jumps straight to traversal code', addedBy: admin._id },

    { topic: linkedLists._id, title: 'Linked List in Data Structure Tutorial | Singly & Doubly', url: 'https://www.youtube.com/watch?v=dO_3dzCntbg', source: 'YouTube', durationMinutes: 28, matchStatus: 'match', covers: ['Singly linked list', 'Doubly linked list', 'Insertion', 'Deletion'], missing: [], notes: 'Covers exactly what the course syllabus requires, well paced', addedBy: admin._id },
    { topic: linkedLists._id, title: 'Linked List Tutorial - Singly + Doubly + Circular', url: 'https://www.youtube.com/watch?v=58YbpRDc4yw', source: 'YouTube', durationMinutes: 90, matchStatus: 'extra', covers: ['Singly linked list', 'Doubly linked list'], missing: [], notes: 'Also covers circular linked lists in depth, which this course does not require', addedBy: admin._id },
    { topic: linkedLists._id, title: 'Introduction to Doubly Linked List', url: 'https://www.youtube.com/watch?v=nquQ_fYGGA4', source: 'YouTube', durationMinutes: 16, matchStatus: 'missing', covers: ['Doubly linked list basics'], missing: ['Singly linked list fundamentals', 'Insertion/deletion operations'], notes: 'Only covers doubly linked lists, skips singly linked list basics entirely', addedBy: admin._id },

    { topic: pointers._id, title: 'C++ Pointers Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=85kQNHye71o', source: 'YouTube', durationMinutes: 18, matchStatus: 'match', covers: ['Pointer declaration', 'Pointer arithmetic', 'Pointers and arrays'], missing: [], notes: 'Directly matches course sequence', addedBy: admin._id },
    { topic: pointers._id, title: 'C++ Pointers Full Course - Beginner to Advanced', url: 'https://www.youtube.com/watch?v=kiUGf_Z08RQ', source: 'YouTube', durationMinutes: 150, matchStatus: 'extra', covers: ['Pointers', 'Memory management', 'Smart pointers'], missing: [], notes: 'Covers pointers thoroughly but includes 1+ hour on smart pointers not in syllabus', addedBy: admin._id },
    { topic: pointers._id, title: 'C++ Pointers and References Full Guide', url: 'https://www.youtube.com/watch?v=iNlmsLrzGD4', source: 'YouTube', durationMinutes: 35, matchStatus: 'missing', covers: ['References', 'Function pointers'], missing: ['Basic pointer declaration', 'Pointer arithmetic fundamentals'], notes: 'Assumes basics already covered, starts at intermediate level', addedBy: admin._id },

    { topic: loopsFunctions._id, title: 'Python Tutorial for Beginners: Loops and Iterations', url: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ', source: 'YouTube', durationMinutes: 20, matchStatus: 'match', covers: ['For loops', 'While loops', 'Iterations'], missing: [], notes: 'Matches course structure well', addedBy: admin._id },
    { topic: loopsFunctions._id, title: 'Learn Python - Full Course for Beginners', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', source: 'YouTube', durationMinutes: 270, matchStatus: 'extra', covers: ['Loops', 'Functions'], missing: [], notes: 'Relevant sections are only about 30 minutes out of a 4.5-hour video', addedBy: admin._id },
    { topic: loopsFunctions._id, title: 'Python Decorators in 15 Minutes', url: 'https://www.youtube.com/watch?v=r7Dtus7N4pI', source: 'YouTube', durationMinutes: 15, matchStatus: 'missing', covers: ['Decorators'], missing: ['Basic function syntax', 'Loop fundamentals'], notes: 'Advanced topic, assumes basics are already understood', addedBy: admin._id },
  ]);

  console.log('Seed complete!');
  console.log('Admin login: admin@coursecompass.com / Admin@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});