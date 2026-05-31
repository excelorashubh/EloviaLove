import React from 'react';
import { Link, useParams } from 'react-router-dom';

const sections = {
  home: {
    title: 'Sales Dashboard',
    description: 'Monitor prospects, follow-ups, and conversions from a unified Excelora Classes sales hub.',
  },
  leads: {
    title: 'Leads',
    description: 'View and manage new student leads, outreach history, and next steps.',
  },
  'follow-ups': {
    title: 'Follow-ups',
    description: 'Track pending conversations and schedule follow-up actions for each inquiry.',
  },
  admissions: {
    title: 'Admissions',
    description: 'Review enrolled students, application status, and admissions workflows.',
  },
  students: {
    title: 'Students',
    description: 'Manage your student list and see active learners across courses and programs.',
  },
  reports: {
    title: 'Reports',
    description: 'View sales performance, conversion metrics, and enrollment trends.',
  },
  notifications: {
    title: 'Sales Notifications',
    description: 'Stay updated on new messages, registrations, and lead activity in real time.',
  },
  chat: {
    title: 'Sales Chat',
    description: 'Continue conversations with prospects and students through the Excelora Classes chat center.',
  },
  profile: {
    title: 'Sales Profile',
    description: 'Manage your sales profile, contact information, and visibility preferences.',
  },
  settings: {
    title: 'Sales Settings',
    description: 'Update preferences for notifications, communication, and team access.',
  },
};

const SalesmanSection = ({ section: propSection }) => {
  const params = useParams();
  const requestedSection = propSection || params.section || 'home';
  const sectionKey = sections[requestedSection] ? requestedSection : 'home';
  const activeSection = sections[sectionKey];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{activeSection.title}</h1>
          <p className="text-slate-600">{activeSection.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(sections).map(([key, value]) => (
            <Link
              key={key}
              to={`/salesman/${key}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:border-primary-300 hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h2>
              <p className="text-slate-600">{value.description}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Section details</h2>
          <p className="text-slate-600">
            Use the links above to explore the Excelora Classes salesman tools. The current section is <strong>{activeSection.title}</strong>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SalesmanSection;
