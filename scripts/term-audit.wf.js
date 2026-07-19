export const meta = {
  name: 'term-accuracy-audit',
  description: 'Adversarial factual-accuracy audit of the NLG/LSW Term claims Arlindo will ship (per claim: evidence verifier + skeptic vs primary sources, then synthesize)',
  phases: [
    { title: 'Audit', detail: 'per claim: 1 evidence-gathering verifier + 1 adversarial skeptic (NLG/LSW primary sources)' },
    { title: 'Synthesize', detail: 'per-claim verdict, then an overall synthesis report' },
  ],
}

// ---------------------------------------------------------------------------
// The claims Arlindo's Term knowledge base + Term product will assert.
// Each is grounded in (a) the deep-research pass and (b) the real Term 30-G
// sample illustration (Dave Miller.pdf, LSW form ICC18-20522). The audit tests
// each against NLG/LSW PRIMARY sources — exactly mirroring the FlexLife IUL audit.
// ---------------------------------------------------------------------------
const CLAIMS = [
  { id: 'term-lineup', area: 'product', appSays:
    "National Life Group / LSW term life is marketed as the 'Guaranteed Series': four fully-guaranteed level-premium contracts — Term 10-G, 15-G, 20-G, 30-G (premiums guaranteed level for 10/15/20/30 years respectively) — plus an Annual Renewable Term (ART) whose premiums increase annually. Current level-term marketing form series is ICC18-20522 ('Level Term xx-G'). Underwritten by Life Insurance Company of the Southwest (LSW) and National Life (NL). Older LSW guides also list 15-NG/20-NG/30-NG variants (guaranteed 10 years, current-level thereafter)." },
  { id: 'term-structure', area: 'product', appSays:
    "Term provides a level death benefit for the term period with NO cash value accumulation and no dividends, and is the lowest-initial-cost product in the NLG lineup. After the level-premium period the policy is annually renewable with premiums that increase annually, and coverage extends to the policy anniversary following the insured's 95th birthday." },
  { id: 'issue-ages', area: 'product', appSays:
    "Level-term issue ages start at 18 and the maximum issue age shortens as the level term lengthens: 10-G and 15-G to age 75; 20-G to age 70 (65 tobacco); 30-G to age 55 non-tobacco / 50 tobacco; ART issues 18-85. Coverage on all plans extends to age 95." },
  { id: 'rate-classes', area: 'product', appSays:
    "Term is offered across these rate classes: Elite (all face amounts, max issue age 75), Preferred Non-Tobacco, Select Non-Tobacco, Standard Non-Tobacco, Express Standard Non-Tobacco, Preferred Tobacco, Standard Tobacco, and Express Standard Tobacco (all to age 85). Express Standard classes are limited to total face amounts of $2,000,000 or less. The actual rate class is determined at underwriting." },
  { id: 'conversion', area: 'product', appSays:
    "A term policy is convertible to a single-life permanent plan of insurance then sold by the company, with NO evidence of insurability, provided the coverage amount is not increased and no additional riders are added. The conversion window in the current Term 30-G sample is the first 20 years from issue or to age 70 if earlier; the window can vary by product/state (some older specimens show 15 years). The new permanent policy is issued at an equivalent rate class regardless of changes in health." },
  { id: 'abr-suite', area: 'rider', appSays:
    "All term plans include the Accelerated Benefit Rider (ABR) living-benefit suite at NO additional premium: Terminal Illness, Chronic Illness, Critical Illness, Critical Injury, and Alzheimer's Disease / Lewy Body Dementia (the Alzheimer's/Lewy Body condition was added effective Jan 28, 2023). NLG markets itself as the only major carrier including Critical Injury as a standard no-cost rider. A Children's Term rider and a Waiver of Premium rider (which waives premium on the converted policy) are also available on term." },
  { id: 'abr-triggers', area: 'rider', appSays:
    "ABR triggers: Terminal Illness = a physician-certified illness expected to result in death in 24 months or less; Chronic Illness = certified unable to perform 2 of 6 activities of daily living (bathing, continence, dressing, eating, toileting, transferring) or cognitively impaired; Critical Illness = a qualifying event such as cancer, heart attack, stroke, ALS, major organ transplant, end-stage renal failure; Critical Injury = coma, paralysis, severe burns, traumatic brain injury; Alzheimer's = specialist diagnosis of an eligible dementia (e.g. MMSE score < 20/30 plus clinical impairment)." },
  { id: 'abr-discount', area: 'rider', appSays:
    "The ABR benefit is paid on a DISCOUNTED basis — the actuarially discounted value of the death benefit being accelerated, less a pro-rata portion of any policy debt — not dollar-for-dollar; the client receives less than the amount accelerated. The discount reflects the insured's age/life expectancy and, for Critical Illness/Injury, the severity of the condition assessed at four levels (the benefit could be as low as $0). In the Term 30-G sample, if fully accelerated the projected discounted values were roughly 86% of the $600,000 death benefit for Terminal, ~62% for Alzheimer's, and $0-79% for Critical Illness/Injury, while Chronic Illness pays a monthly benefit." },
  { id: 'abr-limits', area: 'rider', appSays:
    "Per-insured lifetime maximum accelerated-benefit limits apply across all contracts on the insured: $1,500,000 for terminal illness, $1,500,000 for chronic illness, $1,000,000 for critical illness and critical injury (combined), and $1,500,000 for Alzheimer's disease. Chronic is also subject to a monthly maximum. These limits vary by state (NY chronic $2,000,000; IL and NJ reduced to $500,000) and the carrier reserves the right to change them but never below $500,000." },
  { id: 'foreign-national', area: 'compliance', appSays:
    "National Life Group / LSW does NOT offer TERM insurance to foreign nationals / non-US-residents — only PERMANENT life products are eligible (up to Class 4 / 200% table rating), and RapidProtect is also excluded. Eligibility is limited to citizens/residents of 'A' or 'B' classified countries; Brazil is a 'B' country (eligible for permanent, not term). Therefore, for the agent's Brazil-based foreign-national clients, term is not an available product — term is for US-resident clients (the sample insured is a Virginia resident)." },
  { id: 'fn-permanent-rules', area: 'compliance', appSays:
    "Foreign-national PERMANENT policies carry a $500,000 minimum face amount and a $15,000,000 maximum ($2,000,000 for students), and require a documented US nexus and significant documented US assets, US delivery to a valid address in the state of issue, all solicitation and sales activity conducted within the US (no marketing or policy materials transmitted or delivered outside the US), and English-language application and policy forms. NLG defines a foreign national as anyone (including US citizens living abroad) spending more than 4 months in a consecutive 12-month period outside the US." },
  { id: 'premium-modes', area: 'product', appSays:
    "Term premium can be paid annually, semi-annually, quarterly, or monthly (EFT); paying more frequently than annually increases the total yearly cost. In the Term 30-G sample the annual-mode premium was $813.00 versus $858.48/year on monthly EFT ($71.54/month). The illustration ledger shows only Policy Year, Age, Guaranteed Contract Premium, and Guaranteed Death Benefit (no cash value column)." },
  { id: 'term-vs-permanent', area: 'product', appSays:
    "Compared with permanent insurance, term's advantages are the lowest initial cost and the highest immediate death benefit per premium dollar; its trade-offs are that it builds no cash value, its level-premium period is finite (premiums then rise sharply on the annually-renewable schedule to age 95), and it is temporary protection. The conversion privilege lets the client move to a permanent policy (which does build cash value) with no new underwriting." },
  { id: 'compliance-disclaimers', area: 'compliance', appSays:
    "A compliant term presentation must state: guarantees depend on the claims-paying ability of the issuing company; the product is not FDIC/NCUA insured, carries no bank/credit-union guarantee, and may lose value; the death benefit is generally income-tax-free under IRC §101(a)(1); accelerated benefits are paid at a discount, may be taxable, and may affect eligibility for public-assistance programs; the use of one benefit may reduce or eliminate other policy and rider benefits; riders are optional, may require additional premium, are subject to underwriting/exclusions and may not be available in all states; and the official Statement of Policy Cost and Benefit Information is the authoritative document." },
]

// Primary NLG/LSW sources surfaced by the deep-research pass — verifier & skeptic
// should prioritize these (and any other genuine NLG/LSW primary docs they find).
const SOURCES = [
  'NLG Life Product Quick Reference Chart, Cat 63236 (10-25): https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Life_Product_Quick_Reference_Chart_63236_10-25.pdf',
  'NLG Foreign National Guidelines, Cat 69798 (11-25): https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Foreign_National_Guidelines_69798_11-25.pdf',
  'LSW Level Term Product Guide: http://theinsgroup.net/images/stories/LSW/Life/LSW_Level_Term_Product_Guide.pdf',
  'LSW Living Benefits (ABR) Rider agent guide: https://theinsgroup.net/images/stories/LSW/Life/LSW_Living_Benefits_Rider.pdf',
  '2023 NLG/LSW Underwriting Guide: http://www.cassaniinsurance.com/wp-content/uploads/2023/12/National-Life-Group-Underwriting-Guide-2023.pdf',
  'LSW Underwriting Guide (totalfinancial): https://www.totalfinancial.com/carriers/downloads/lsw/lsw-uw1.pdf',
  'NLG Term2Perm conversion ekit: https://www.nationallife.com/docs/digital/ekit/Term2Perm/index.html',
  "NLG newsroom — Alzheimer's/Lewy Body + Fertility riders (Jan 2023): https://www.nationallife.com/Our-Story/newsroom/NLG-expand-suite-of-living-benefits-adds-Alzheimers-and-Fertility-Riders",
  'NLG ABR help (Chronic ABR2 / Critical ABR3 discount mechanics): https://www.nationallife.com/NWI/Help/en-US/Peach/Riders_ChronicABR2_CriticalABR3.htm',
].join('\n')

const SAMPLE = `Cross-check primary source (a real, current LSW illustration): "Term 30-G", form series ICC18-20522, issued by Life Insurance Company of the Southwest, prepared 2026-07-11 (Version 26.1 A). Insured male 39 Elite Non-Tobacco, Virginia, $600,000 face, $71.54/mo EFT (=$858.48/yr), 5 ABRs. It states verbatim: "annually renewable to age 95. Premiums are level for the first 30 years and increase annually thereafter to attained age 95. This policy has no cash value and no dividends are payable." Convertible "during the first 20 years from the date of issue or until age 70 if earlier, without evidence of insurability to any single life permanent plan." ABR limits stated as "$1,500,000 for terminal illness, $1,500,000 for chronic illness, $1,000,000 for critical illness and critical injury and $1,500,000 for alzheimer's disease ... never be less than $500,000 ... vary by state."`

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'area', 'verdict', 'confidence', 'appSays', 'sourcesSay', 'evidence', 'recommendation', 'sourceUrls'],
  properties: {
    id: { type: 'string' },
    area: { type: 'string' },
    verdict: { type: 'string', enum: ['CONFIRMED', 'PARTIAL', 'UNVERIFIABLE'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    appSays: { type: 'string', description: 'The claim as Arlindo would assert it (echo the input).' },
    sourcesSay: { type: 'string', description: 'What NLG/LSW primary sources actually say, with specifics/quotes.' },
    evidence: { type: 'string', description: 'How it was verified: which docs, quotes, any caveats, and how the skeptic\'s objections were resolved.' },
    recommendation: { type: 'string', description: 'Concrete guidance for the Term KB/product: keep as-is, reword, add caveat, or drop.' },
    sourceUrls: { type: 'array', items: { type: 'string' } },
  },
}

const REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'problemClaims', 'keyCorrections', 'notesForArlindo'],
  properties: {
    headline: { type: 'string' },
    problemClaims: { type: 'array', items: { type: 'string' } },
    keyCorrections: { type: 'array', items: { type: 'string' } },
    notesForArlindo: { type: 'string' },
  },
}

phase('Audit')

const verdicts = await pipeline(
  CLAIMS,
  // Stage 1 — run the evidence-gathering verifier and the adversarial skeptic concurrently.
  (claim) => parallel([
    () => agent(
      `You are an EVIDENCE-GATHERING VERIFIER auditing a factual claim Arlindo (an insurance-presentation app) will ship about National Life Group (NLG) / Life Insurance Company of the Southwest (LSW) TERM life insurance.\n\nCLAIM (area: ${claim.area}):\n"""${claim.appSays}"""\n\nYour job: find NLG/LSW PRIMARY sources that CONFIRM or CORRECT each element of the claim. Use WebSearch/WebFetch (load them via ToolSearch "select:WebSearch,WebFetch" if not already available). Prioritize these known primary sources, and fetch them:\n${SOURCES}\n\n${SAMPLE}\n\nReport: which specific elements are supported (with exact quotes + the source URL + the document's form number/date), which are wrong or stale, and any nuance the claim omits. Distinguish guaranteed/structural facts from rate-sheet-driven current rates. Be precise about dates/editions. Return a thorough evidence writeup (plain text).`,
      { label: `verify:${claim.id}`, phase: 'Audit' },
    ),
    () => agent(
      `You are an ADVERSARIAL SKEPTIC. Your goal is to REFUTE the following factual claim that Arlindo (an insurance-presentation app) intends to ship about National Life Group (NLG) / LSW TERM life insurance. Assume it may be wrong, stale, or overstated until primary sources prove otherwise.\n\nCLAIM (area: ${claim.area}):\n"""${claim.appSays}"""\n\nActively hunt for: outdated editions, product/state variations that contradict it, conflation of term with permanent (IUL) facts, numbers that come from superseded brochures, and overgeneralizations. Use WebSearch/WebFetch (load via ToolSearch "select:WebSearch,WebFetch" if needed) against NLG/LSW primary sources:\n${SOURCES}\n\n${SAMPLE}\n\nDefault to skepticism: if an element cannot be confirmed in a current primary source, say so. List every specific way the claim is wrong, imprecise, or unverifiable, with the source that contradicts it (URL + quote). If after genuine effort you cannot refute an element, say which elements survive refutation. Return a plain-text refutation writeup.`,
      { label: `refute:${claim.id}`, phase: 'Audit' },
    ),
  ]).then((pair) => ({ claim, evidence: pair[0], refutation: pair[1] })),
  // Stage 2 — synthesize a single verdict per claim, weighing evidence vs refutation.
  (r) => agent(
    `You are the SYNTHESIS JUDGE for one claim in Arlindo's NLG/LSW Term accuracy audit. Weigh the verifier's evidence against the skeptic's refutation and issue a final verdict.\n\nCLAIM (id: ${r.claim.id}, area: ${r.claim.area}):\n"""${r.claim.appSays}"""\n\n=== VERIFIER (evidence) ===\n${r.evidence || '(no evidence returned)'}\n\n=== SKEPTIC (refutation) ===\n${r.refutation || '(no refutation returned)'}\n\nDecide: CONFIRMED (matches a current NLG/LSW primary source), PARTIAL (core correct but a specific element is misstated/stale/omitted), or UNVERIFIABLE (not found in primary sources). Set confidence (high/medium/low). Write sourcesSay (what the sources actually say, with specifics), evidence (how you resolved it, incl. how the skeptic's objections were handled), a concrete recommendation for the Term KB/product (keep / reword / add caveat / drop), and the list of source URLs actually relied upon. Echo the claim into appSays. Set id="${r.claim.id}" and area="${r.claim.area}".`,
    { label: `synth:${r.claim.id}`, phase: 'Synthesize', schema: VERDICT_SCHEMA },
  ),
)

phase('Synthesize')

const clean = verdicts.filter(Boolean)
const problems = clean.filter((v) => v.verdict !== 'CONFIRMED')

const report = await agent(
  `You are writing the synthesis report for Arlindo's NLG/LSW TERM factual-accuracy adversarial audit. Here are the per-claim verdicts (JSON):\n\n${JSON.stringify(clean, null, 2)}\n\nWrite: a one-paragraph headline (how accurate is the Term claim set overall; how many CONFIRMED vs PARTIAL vs UNVERIFIABLE); problemClaims (short 'id — the issue' strings for every non-CONFIRMED claim); keyCorrections (the concrete fixes Arlindo must apply to the Term KB / Term product data / disclaimers, most important first — e.g. foreign-national term exclusion, per-condition ABR limits, conversion-window state variation); and notesForArlindo (guidance on what is guaranteed/structural vs rate-sheet-driven and must never be hard-coded, plus the single authoritative-document rule).`,
  { label: 'synthesis-report', phase: 'Synthesize', schema: REPORT_SCHEMA },
)

return {
  audit: 'Arlindo National Life / LSW Term factual-accuracy adversarial audit',
  date: '2026-07-18',
  method: 'ultracode workflow — per claim: 1 evidence-gathering verifier + 1 adversarial skeptic (web research on NLG/LSW primary sources), then a synthesis judge; plus an overall synthesis report',
  totalClaims: CLAIMS.length,
  confirmed: clean.filter((v) => v.verdict === 'CONFIRMED').length,
  partial: clean.filter((v) => v.verdict === 'PARTIAL').length,
  unverifiable: clean.filter((v) => v.verdict === 'UNVERIFIABLE').length,
  problemCount: problems.length,
  verdicts: clean,
  synthesis: report,
}
