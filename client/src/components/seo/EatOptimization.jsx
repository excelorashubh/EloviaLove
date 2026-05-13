// ── E-A-T Optimization Strategy for Dating Platform ──────────────────────────

// 1. Author Bios and Expertise Signals
export const AUTHOR_CONFIG = {
  'elovia-love-team': {
    name: 'Elovia Love Editorial Team',
    bio: 'Expert dating and relationship advisors with 10+ years of experience helping thousands find meaningful connections. Our team includes certified relationship counselors, dating coaches, and safety experts.',
    credentials: [
      'Certified Relationship Counseling (CRC)',
      'Dating Safety Expert Certification',
      '10,000+ Successful Matches Facilitated',
      'Published Authors in Relationship Psychology'
    ],
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/elovialove',
      twitter: 'https://twitter.com/elovialove'
    },
    expertise: ['Dating Advice', 'Relationship Counseling', 'Online Safety', 'Matchmaking'],
    publications: [
      'Psychology Today - Online Dating Safety',
      'Forbes - Modern Dating Trends',
      'The Guardian - Digital Relationships'
    ]
  },

  'dr-sarah-johnson': {
    name: 'Dr. Sarah Johnson',
    title: 'Clinical Psychologist & Dating Expert',
    bio: 'PhD in Clinical Psychology with specialization in relationships and mental health. Author of "Modern Love in Digital Age" and regular contributor to psychology journals.',
    credentials: [
      'PhD Clinical Psychology',
      'Licensed Marriage & Family Therapist',
      'Published Author - 5 Books',
      'TEDx Speaker on Digital Relationships'
    ],
    expertise: ['Clinical Psychology', 'Relationship Therapy', 'Digital Mental Health', 'Couples Counseling']
  },

  'michael-chen': {
    name: 'Michael Chen',
    title: 'Dating Safety & Cybersecurity Expert',
    bio: 'Former FBI cybercrime investigator turned dating safety advocate. Has helped recover millions in dating scam losses and educated thousands on online safety.',
    credentials: [
      'Former FBI Cybercrime Unit',
      'Certified Information Security Professional',
      'Dating Safety Advocate - 8 Years',
      'Testified in 50+ Dating Scam Cases'
    ],
    expertise: ['Online Safety', 'Cybersecurity', 'Fraud Prevention', 'Digital Forensics']
  }
};

// 2. Editorial Policy and Content Standards
export const EDITORIAL_POLICY = {
  contentStandards: {
    accuracy: 'All advice backed by psychological research and expert consensus',
    timeliness: 'Content reviewed and updated quarterly',
    transparency: 'Sources cited, conflicts of interest disclosed',
    safety: 'All safety advice reviewed by certified experts'
  },

  reviewProcess: {
    research: 'Minimum 3 credible sources per article',
    expertReview: 'All relationship advice reviewed by certified counselors',
    factChecking: 'Cross-verified with multiple authoritative sources',
    updates: 'Content freshness monitored, updated as needed'
  },

  trustSignals: {
    authorCredentials: 'Displayed prominently on all articles',
    lastUpdated: 'Clear publication and update dates',
    sources: 'Citations and references provided',
    contactInfo: 'Editorial team contact information available'
  }
};

// 3. Content Review System Component
export const ContentReviewBadge = ({ content, reviewDate, reviewer }) => (
  <div className="content-review-badge bg-green-50 border border-green-200 rounded-lg p-4 my-6">
    <div className="flex items-center space-x-2 mb-2">
      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="font-semibold text-green-800">Expert Reviewed</span>
    </div>
    <p className="text-sm text-green-700 mb-2">
      This content has been reviewed by our editorial team and certified dating experts for accuracy and safety.
    </p>
    <div className="text-xs text-green-600">
      <p>Last reviewed: {new Date(reviewDate).toLocaleDateString()}</p>
      <p>Reviewer: {reviewer}</p>
    </div>
  </div>
);

// 4. Author Bio Component with E-A-T Signals
export const AuthorBio = ({ authorSlug, showCredentials = true }) => {
  const author = AUTHOR_CONFIG[authorSlug];

  if (!author) return null;

  return (
    <div className="author-bio bg-gray-50 rounded-lg p-6 my-8">
      <div className="flex items-start space-x-4">
        <img
          src={`/authors/${authorSlug}.jpg`}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
          {author.title && (
            <p className="text-sm text-blue-600 font-medium">{author.title}</p>
          )}
          <p className="text-gray-700 mt-2">{author.bio}</p>

          {showCredentials && author.credentials && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Credentials:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {author.credentials.map((credential, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {credential}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {author.expertise && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Areas of Expertise:</h4>
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {author.socialProfiles && (
            <div className="mt-3 flex space-x-3">
              {author.socialProfiles.linkedin && (
                <a href={author.socialProfiles.linkedin} className="text-gray-500 hover:text-blue-600">
                  LinkedIn
                </a>
              )}
              {author.socialProfiles.twitter && (
                <a href={author.socialProfiles.twitter} className="text-gray-500 hover:text-blue-600">
                  Twitter
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 5. Trust Indicators Component
export const TrustIndicators = ({ contentType = 'article' }) => (
  <div className="trust-indicators bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
    <h4 className="text-sm font-semibold text-blue-800 mb-3">Why Trust This Content:</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Written by certified relationship experts
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Based on psychological research and studies
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Regularly updated with latest safety information
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Sources cited and fact-checked
      </div>
    </div>
  </div>
);

// 6. Update Timestamps Component
export const ContentTimestamps = ({ publishedAt, updatedAt, reviewDate }) => (
  <div className="content-timestamps text-sm text-gray-500 border-t border-gray-200 pt-4 mt-6">
    <div className="flex flex-wrap gap-4">
      <span>
        <strong>Published:</strong> {new Date(publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
      {updatedAt && updatedAt !== publishedAt && (
        <span>
          <strong>Last Updated:</strong> {new Date(updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      )}
      {reviewDate && (
        <span>
          <strong>Last Reviewed:</strong> {new Date(reviewDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      )}
    </div>
  </div>
);

// ── Usage Examples ───────────────────────────────────────────────────────────

// Blog Post with Full E-A-T:
/*
import { AuthorBio, TrustIndicators, ContentReviewBadge, ContentTimestamps } from './components/seo/EatOptimization';

const BlogPostPage = ({ post }) => (
  <article>
    <h1>{post.title}</h1>

    <ContentTimestamps
      publishedAt={post.publishedAt}
      updatedAt={post.updatedAt}
      reviewDate={post.reviewDate}
    />

    <div dangerouslySetInnerHTML={{ __html: post.content }} />

    <TrustIndicators contentType="article" />

    <ContentReviewBadge
      content={post}
      reviewDate={post.reviewDate}
      reviewer={post.reviewer}
    />

    <AuthorBio authorSlug={post.author.slug} />

    <RelatedPosts posts={relatedPosts} />
  </article>
);
*/

// Safety Page with E-A-T:
/*
const SafetyPage = () => (
  <div>
    <h1>Dating Safety Guide</h1>

    <TrustIndicators contentType="safety" />

    <ContentReviewBadge
      content={{ type: 'safety-guide' }}
      reviewDate="2024-01-15"
      reviewer="Michael Chen"
    />

    <AuthorBio authorSlug="michael-chen" />

    <ContentTimestamps
      publishedAt="2023-06-01"
      updatedAt="2024-01-15"
      reviewDate="2024-01-15"
    />
  </div>
);
*/

export {
  AUTHOR_CONFIG,
  EDITORIAL_POLICY,
  AuthorBio,
  TrustIndicators,
  ContentReviewBadge,
  ContentTimestamps
};