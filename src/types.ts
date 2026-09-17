export type WebsiteStatus =
  | 'no_website'
  | 'website_exists'
  | 'website_broken'
  | 'website_outdated'
  | 'website_inaccessible'
  | 'unknown';

export type OpportunityLevel = 'High' | 'Medium' | 'Low';

export type OutreachStatus =
  | 'not_contacted'
  | 'message_ready'
  | 'pending_approval'
  | 'approved'
  | 'message_sent'
  | 'replied'
  | 'interested'
  | 'ready_to_buy'
  | 'followup_required'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'do_not_contact';

export interface WebsiteAnalysisDetails {
  mobileFriendly?: 'Yes' | 'No' | 'Partially' | 'Not verified';
  visualQuality?: 'Modern' | 'Outdated' | 'Broken' | 'Basic' | 'Not verified';
  speedEstimate?: 'Fast' | 'Average' | 'Slow' | 'Inaccessible' | 'Not verified';
  https?: 'Secure (HTTPS)' | 'Insecure (HTTP)' | 'Invalid SSL' | 'Not verified';
  contactInfo?: 'Present' | 'Missing Phone/Email' | 'Not verified';
  whatsappIntegration?: 'Direct Chat Button' | 'Number Listed Only' | 'Missing';
  orderingAvailable?: 'Yes' | 'No' | 'Social Only' | 'Not verified';
  bookingAvailable?: 'Yes' | 'No' | 'Phone Only' | 'Not verified';
  clearCta?: 'Yes' | 'Weak' | 'None';
  seoBasics?: 'Good' | 'Poor' | 'Missing Meta' | 'Not verified';
  notes?: string;
}

export interface Lead {
  id: string;
  businessName: string;
  category: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  googleBusinessUrl?: string;
  socialProfiles?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  email?: string;
  businessDescription?: string;
  rating?: number;
  reviewCount?: number;
  topReviewHighlight?: string;
  source: 'Google Business' | 'Business Directory' | 'LinkedIn' | 'Fiverr/Upwork' | 'CSV Import' | 'Manual Entry';
  dateDiscovered: string;

  websiteStatus: WebsiteStatus;
  websiteAnalysisDetails?: WebsiteAnalysisDetails;
  opportunityScore: number; // 0 - 100
  opportunityReasons: string[];
  opportunityLevel: OpportunityLevel;
  opportunitySummary?: string;

  analysisStatus: 'untested' | 'analyzing' | 'completed' | 'failed';
  outreachStatus: OutreachStatus;
  doNotContact: boolean;
  isDemo: boolean;
  notes?: string;
  dealValue?: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  salesConversation?: ChatMessage[];
  isReadyToBuy?: boolean;
  buyingSignalSummary?: string;
  selectedOfferPitch?: string;
  historicalPlaceSignature?: string;
  isRealVerifiedPlaces?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'sales_agent' | 'user';
  text: string;
  timestamp: string;
  intent?: 'greeting' | 'pricing_inquiry' | 'portfolio_request' | 'timeline_inquiry' | 'ready_to_buy' | 'objection' | 'general';
}

export interface SalesConversation {
  leadId: string;
  businessName: string;
  whatsappNumber?: string;
  messages: ChatMessage[];
  buyingIntentScore: number; // 0-100
  isReadyToBuy: boolean;
  intentSummary?: string;
  lastReplyAt?: string;
}

export interface LeadDiscoveryCriteria {
  country: string;
  city: string;
  category: string;
  count: number;
  targetType: 'all' | 'no_website' | 'outdated_website' | 'low_rating';
  minScore: number;
  source?: 'Google Business' | 'Business Directory' | 'LinkedIn' | 'Fiverr/Upwork';
}

export interface MessageVariant {
  type: 'professional' | 'friendly' | 'short';
  title?: string;
  text: string;
}

export interface LeadMessage {
  id: string;
  leadId: string;
  businessName: string;
  contactNumber: string;
  whatsappNumber?: string;
  variants: MessageVariant[] | {
    professional: string;
    friendly: string;
    short: string;
  };
  selectedVariant: 'professional' | 'friendly' | 'short';
  approvedContent: string;
  status: 'pending_approval' | 'approved' | 'sent' | 'skipped' | 'draft';
  opportunityScore: number;
  whySelected?: string;
  selectionReason?: string;
  source: string;
  websiteStatus: WebsiteStatus;
  generatedAt: string;
  approvedAt?: string;
  sentAt?: string;
  deliveryMethod?: 'api_sent' | 'whatsapp_link_opened' | 'copied';
  isDemo: boolean;
}

export interface FollowUpItem {
  id: string;
  leadId: string;
  businessName: string;
  whatsappNumber?: string;
  step?: number;
  stepNumber?: number; // 1 (3 days), 2 (7 days)
  daysAfterFirstOutreach?: number;
  dueDaysAfter?: number;
  dueDate: string;
  status: 'pending' | 'due' | 'sent' | 'skipped';
  lastMessageSentDate?: string;
  lastResponse?: string;
  recommendedMessage?: string;
  generatedFollowUpText?: string;
}

export interface WebsiteProposal {
  id: string;
  leadId: string;
  businessName: string;
  tier: 'basic' | 'business' | 'ecommerce' | 'custom';
  price: number;
  currency: string;
  deliveryTimeline: string;
  conceptSummary: string;
  recommendedPages: string[];
  recommendedFeatures: string[];
  estimatedScope: string;
  clientDiscoveryQuestions: string[];
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  leadId?: string;
  businessName?: string;
  action: string;
  category: 'lead' | 'analysis' | 'message' | 'followup' | 'proposal' | 'compliance' | 'system';
  details: string;
  isDemo: boolean;
}

export interface AppSettings {
  developerName: string;
  businessName: string;
  developerWebsite?: string;
  websiteUrl?: string;
  portfolioUrl: string;
  whatsappNumber: string;
  email: string;
  targetCountries: string[];
  targetCities: string[];
  targetCategories: string[];
  defaultLanguage?: string;
  defaultTone?: 'professional' | 'friendly' | 'short';
  followupIntervals?: number[]; // [3, 7]
  dailyOutreachLimit?: number;
  scoreThresholds: {
    high: number; // e.g. 80
    medium: number; // e.g. 60
  };
  pricing: {
    basic: number;
    business: number;
    ecommerce: number;
    custom: number;
    currency: string;
  };
  customTemplates?: Array<{
    id: string;
    name: string;
    template: string;
  }>;
}

export interface IntegrationsConfig {
  whatsAppConfigured: boolean;
  phoneNumberId?: string;
  whatsAppPhoneNumberId?: string;
  businessAccountId?: string;
  whatsAppAccountId?: string;
  accessTokenMasked?: string;
  whatsAppStatus?: 'connected' | 'not_configured' | 'error';
  hasAccessToken?: boolean;
  webhookUrl?: string;
  webhookConfigured?: boolean;
  googlePlacesConfigured?: boolean;
  isDemoMode: boolean; // toggle for testing flows safely
}

export interface AnalyticsSummary {
  leadsDiscovered: number;
  leadsAnalyzed: number;
  qualifiedLeads: number;
  messagesApproved: number;
  messagesSent: number;
  replies: number;
  interestedLeads: number;
  proposalsSent: number;
  clientsWon: number;
  conversionRate: number;
  estimatedRevenue: number;
  funnel: Array<{ stage: string; count: number; percentage: number }>;
  dailyStats: Array<{ date: string; leads: number; messages: number; replies: number; won: number }>;
}
