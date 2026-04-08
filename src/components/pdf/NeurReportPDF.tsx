'use client'

import {
  Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer'

const NAVY = '#12126B'
const GOLD = '#F59E0B'
const SLATE = '#64748B'
const LIGHT = '#F1F5F9'
const WHITE = '#FFFFFF'
const EMERALD = '#10B981'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    padding: 48,
    fontSize: 10,
    color: '#0F172A',
  },
  // Header
  header: {
    backgroundColor: NAVY,
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  },
  headerTag: { fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginBottom: 6 },
  headerTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: WHITE, marginBottom: 6 },
  headerSub: { fontSize: 9, color: 'rgba(255,255,255,0.65)' },
  headerAccent: { color: GOLD },

  // Section
  section: {
    backgroundColor: WHITE,
    border: '1pt solid #E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 10,
    borderBottom: '1pt solid #E2E8F0',
    paddingBottom: 6,
  },

  // Stats grid
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 2 },
  statLabel: { fontSize: 7.5, color: SLATE, textAlign: 'center' },

  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    gap: 8,
  },
  listNumber: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: NAVY,
    color: WHITE,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 1.8,
  },
  listText: { flex: 1, fontSize: 9, color: '#0F172A', lineHeight: 1.5 },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: LIGHT,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 5,
  },
  summaryLabel: { fontSize: 9, color: SLATE },
  summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY },

  // Footer
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
  },
  footerText: { fontSize: 8, color: SLATE },
  footerBrand: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY },

  // Badge
  badge: {
    backgroundColor: EMERALD,
    color: WHITE,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
})

const BUDGET_LABELS: Record<string, string> = {
  under_10k: 'Under $10,000',
  '10k_50k': '$10,000 – $50,000',
  '50k_100k': '$50,000 – $100,000',
  '100k_500k': '$100,000 – $500,000',
  '500k_plus': '$500,000+',
}

const GOAL_LABELS: Record<string, string> = {
  income_replacement: 'Replace My Income',
  lifestyle: 'Lifestyle Business',
  scale_fast: 'Scale Fast',
  build_and_sell: 'Build & Sell',
  passive_income: 'Passive Income',
}

interface Props {
  analysis: Record<string, string & string[]>
  censusData: Record<string, string> | null
  blsData: Record<string, string> | null
}

export function NeurReportPDF({ analysis, censusData, blsData }: Props) {
  const industry = analysis.industry_open_to_suggestions === 'true'
    ? 'AI Suggested Match'
    : analysis.industry_preference ?? 'N/A'
  const location = [analysis.preferred_city, analysis.preferred_state].filter(Boolean).join(', ') || 'Remote / Online'
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document title={`Neur Report — ${industry}`} author="NEUR LLC">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>NEUR LLC — BUSINESS ANALYSIS REPORT</Text>
          <Text style={styles.headerTitle}>{industry}</Text>
          <Text style={styles.headerSub}>
            {location}  ·  {BUDGET_LABELS[analysis.budget_range] ?? analysis.budget_range}  ·  {GOAL_LABELS[analysis.primary_goal] ?? analysis.primary_goal}
          </Text>
          <Text style={[styles.headerSub, { marginTop: 6 }]}>Generated: {date}</Text>
        </View>

        {/* Industry Analysis */}
        {blsData && !blsData.error && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Industry Analysis — {blsData.sectorLabel}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{blsData.latestEmployment}</Text>
                <Text style={styles.statLabel}>Total Sector Employment</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{blsData.employmentTrend ?? 'N/A'}</Text>
                <Text style={styles.statLabel}>Employment Trend (1yr)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{blsData.avgHourlyEarnings}</Text>
                <Text style={styles.statLabel}>Avg Hourly Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{blsData.avgWeeklyHours ?? 'N/A'}</Text>
                <Text style={styles.statLabel}>Avg Weekly Hours</Text>
              </View>
            </View>
            <Text style={{ fontSize: 8, color: SLATE }}>Source: U.S. Bureau of Labor Statistics (BLS)</Text>
          </View>
        )}

        {/* Demographics */}
        {censusData && !censusData.error && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Demographics — {analysis.preferred_state}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.population}</Text>
                <Text style={styles.statLabel}>Total Population</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.medianHouseholdIncome}</Text>
                <Text style={styles.statLabel}>Median Household Income</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.medianAge} yrs</Text>
                <Text style={styles.statLabel}>Median Age</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.unemploymentRate}</Text>
                <Text style={styles.statLabel}>Unemployment Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.medianRent}</Text>
                <Text style={styles.statLabel}>Median Monthly Rent</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{censusData.bachelorsDegreeCount}</Text>
                <Text style={styles.statLabel}>College-Educated Population</Text>
              </View>
            </View>
            <Text style={{ fontSize: 8, color: SLATE }}>Source: U.S. Census Bureau — ACS 5-Year Estimates</Text>
          </View>
        )}

        {/* Financing Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financing Options</Text>
          {[
            { name: 'SBA 7(a) Loan', desc: 'Up to $5M — general business purposes', best: true },
            { name: 'SBA Microloan', desc: 'Up to $50,000 — ideal for startups', best: false },
            { name: 'USDA Business Loan', desc: 'Rural area financing options', best: false },
          ].map(({ name, desc, best }) => (
            <View key={name} style={[styles.listItem, { justifyContent: 'space-between' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY }}>{name}</Text>
                <Text style={{ fontSize: 8, color: SLATE, marginTop: 2 }}>{desc}</Text>
              </View>
              {best && <Text style={styles.badge}>Best Match</Text>}
            </View>
          ))}
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {[
            'Validate your concept by talking to 10 potential customers in your target area',
            'Register your business entity (LLC recommended) with your state',
            'Research local zoning laws for your business type',
            'Apply for an EIN with the IRS — free and instant at irs.gov',
            'Open a dedicated business bank account',
            'Book a Neur advisor consultation for a personalized strategy session',
          ].map((step, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listNumber}>{i + 1}</Text>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questionnaire Summary</Text>
          {[
            ['Type', analysis.entrepreneur_type === 'new' ? 'Aspiring Entrepreneur' : 'Expanding Business'],
            ['Industry', industry],
            ['Location', location],
            ['Budget', BUDGET_LABELS[analysis.budget_range] ?? analysis.budget_range],
            ['Primary Goal', GOAL_LABELS[analysis.primary_goal] ?? analysis.primary_goal],
            ['Customer Type', analysis.customer_type?.toUpperCase()],
          ].filter(([, v]) => v).map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential — Prepared for {analysis.user_id ? 'Neur Client' : 'N/A'}</Text>
          <Text style={styles.footerBrand}>NEUR LLC · neur.co</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>

      </Page>
    </Document>
  )
}
