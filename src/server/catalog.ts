import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { attachStudySafety, safeJson, sanitizeText } from '../security/input-guard.js';

const JSON_MIME = 'application/json';
const TEXT_MIME = 'text/plain';

const flexibleStudyInputSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Natural language request, search phrase, claim, question, or study goal.',
    },
    reference: {
      type: 'string',
      description: 'Bible reference such as John 3:16, Romans 8:28, or Matthew 5:1-12.',
    },
    book: {
      type: 'string',
      description: 'Bible book name.',
    },
    chapter: {
      type: 'number',
      description: 'Bible chapter number.',
    },
    verse: {
      type: 'number',
      description: 'Bible verse number.',
    },
    topic: {
      type: 'string',
      description: 'Biblical topic, doctrine, theme, person, place, event, or spiritual need.',
    },
    doctrine: {
      type: 'string',
      description: 'Christian doctrine or theological claim to study.',
    },
    word: {
      type: 'string',
      description: 'Hebrew, Greek, English, or theological word to study.',
    },
    strongNumber: {
      type: 'string',
      description: "Strong's number such as H2617 or G26.",
    },
    language: {
      type: 'string',
      enum: ['hebrew', 'greek', 'english', 'auto'],
      description: 'Language for original-language or word-study tools.',
    },
    translation: {
      type: 'string',
      description: 'Bible translation such as KJV, ESV, NIV, NKJV, NLT, CSB, or NASB.',
    },
    audience: {
      type: 'string',
      description: 'Target audience for teaching, sermon, lesson, devotional, or study output.',
    },
    timeframe: {
      type: 'string',
      description: 'Reading-plan or study timeframe.',
    },
    limit: {
      type: 'number',
      description: 'Maximum number of results where applicable.',
      default: 10,
    },
  },
  additionalProperties: true,
} satisfies Tool['inputSchema'];

function tool(name: string, description: string): Tool {
  return {
    name,
    description,
    inputSchema: flexibleStudyInputSchema,
  };
}

const toolDefinitions: Array<[string, string]> = [
  ['verse_lookup', 'Retrieve a specific verse or passage by reference, such as John 3:16 or Romans 8:28.'],
  ['passage_analysis', 'Analyze a longer passage, including structure, flow, theological message, and key ideas.'],
  ['chapter_summary', 'Summarize a Bible chapter with key events, lessons, themes, and spiritual meaning.'],
  ['book_overview', 'Provide an overview of a Bible book, including author, audience, purpose, setting, structure, and main themes.'],
  ['find_parallel_passages', 'Identify parallel passages, especially in the Gospels, Kings/Chronicles, and repeated biblical accounts.'],
  ['context_checker', 'Check whether a verse is being used in its proper biblical, historical, and literary context.'],
  ['topic_to_verses', 'Find relevant verses for a topic such as faith, repentance, grace, hope, judgment, prayer, forgiveness, or obedience.'],
  ['biblical_theme_search', 'Search for a theme across the whole Bible and show how it develops.'],
  ['theological_theme_map', 'Map a doctrine or theme from the Old Testament to the New Testament.'],
  ['doctrine_compare', 'Compare different Christian doctrinal views carefully and respectfully.'],
  ['doctrine_evidence_finder', 'Find verses commonly used to support or challenge a specific doctrine.'],
  ['apologetics_answer', 'Provide biblical and reasoned responses to common objections or difficult questions.'],
  ['contradiction_checker', 'Analyze whether two Bible passages truly contradict or can be harmonized.'],
  ['difficult_passage_explainer', 'Explain hard, controversial, symbolic, or commonly misunderstood Bible passages.'],
  ['translation_compare', 'Compare Bible translations such as KJV, ESV, NIV, NKJV, NLT, CSB, NASB, and others.'],
  ['translation_note_explainer', 'Explain why translations differ in a specific verse or phrase.'],
  ['original_language_lookup', 'Give Hebrew or Greek meanings behind a word or phrase.'],
  ['strongs_lookup', "Look up Hebrew or Greek words using Strong's numbers."],
  ['interlinear_helper', 'Help users understand the original-language structure behind a verse.'],
  ['hebrew_word_study', 'Provide a Hebrew word study with root meaning, usage, and theological significance.'],
  ['greek_word_study', 'Provide a Greek word study with root meaning, usage, and theological significance.'],
  ['word_usage_tracker', 'Track how a Hebrew, Greek, or English word is used across Scripture.'],
  ['biblical_word_search', 'Search where a specific word appears in the Bible and summarize its usage.'],
  ['historical_context_lookup', 'Explain the historical background of a passage, book, person, or event.'],
  ['cultural_context_lookup', 'Explain cultural customs, social practices, laws, rituals, or symbols behind a passage.'],
  ['literary_context_lookup', 'Explain genre, structure, poetry, narrative flow, prophecy, wisdom style, or rhetorical devices.'],
  ['timeline_lookup', 'Place biblical events, kings, prophets, journeys, or books in chronological order.'],
  ['biblical_person_study', 'Analyze a biblical character, including background, actions, strengths, failures, and lessons.'],
  ['biblical_place_study', 'Explain a biblical location such as Jerusalem, Babylon, Galilee, Nazareth, Egypt, Sinai, Rome, or Canaan.'],
  ['parable_explainer', "Explain Jesus' parables, their symbols, audience, meaning, and application."],
  ['miracle_explainer', 'Explain miracles in context, including theological meaning and related passages.'],
  ['prophecy_analysis', 'Explain prophetic passages with context, symbols, fulfillment possibilities, and interpretive caution.'],
  ['law_and_commandment_explainer', 'Explain commandments, statutes, judgments, laws, and covenant instructions.'],
  ['covenant_analysis', 'Explain biblical covenants such as Noahic, Abrahamic, Mosaic, Davidic, and New Covenant.'],
  ['sermon_outline_generator', 'Generate sermon outlines from a verse, passage, topic, doctrine, or theme.'],
  ['sermon_research_assistant', 'Gather supporting verses, background, illustrations, and applications for sermon preparation.'],
  ['bible_study_guide_generator', 'Create Bible study guides with explanation, questions, discussion prompts, and application.'],
  ['lesson_plan_generator', 'Create structured Bible lesson plans for Sunday school, youth ministry, small groups, or classes.'],
  ['discussion_questions_generator', 'Generate thoughtful group discussion questions from a passage, topic, or doctrine.'],
  ['quiz_generator', 'Generate Bible quizzes with answers for teaching, review, or personal study.'],
  ['devotional_generator', 'Create daily, topical, or verse-based devotionals with reflection, prayer, and application.'],
  ['prayer_points_generator', 'Generate prayer points from a verse, passage, topic, or spiritual need.'],
  ['memory_verse_suggester', 'Suggest Bible verses for memorization based on topic, age group, or spiritual goal.'],
  ['reading_plan_generator', 'Create Bible reading plans by topic, book, doctrine, timeframe, or devotional goal.'],
  ['scripture_application_helper', 'Explain how a passage can be applied personally, spiritually, ethically, in family life, ministry, or daily decisions.'],
];

export const SCRIPTURE_TOOL_SPECS: Tool[] = toolDefinitions.map(([name, description]) => tool(name, description));
export const SCRIPTURE_TOOL_DESCRIPTIONS = new Map(toolDefinitions);
export const SCRIPTURE_TOOL_NAMES = new Set(toolDefinitions.map(([name]) => name));

type ResourceSpec = {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
};

type ResourceTemplateSpec = {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
};

function resource(uri: string, name: string, description: string, mimeType = JSON_MIME): ResourceSpec {
  return { uri, name, description, mimeType };
}

function template(uriTemplate: string, name: string, description: string, mimeType = JSON_MIME): ResourceTemplateSpec {
  return { uriTemplate, name, description, mimeType };
}

export const SCRIPTURE_RESOURCES: ResourceSpec[] = [
  resource('scripture://bible/translations', 'Bible Translations', 'List available Bible translations and metadata.'),
  resource('scripture://bible/books', 'Bible Books', 'Canonical list of Bible books.'),
  resource('scripture://bible/public-domain/kjv', 'Public Domain KJV', 'Public-domain KJV text, if included.'),
  resource('scripture://bible/public-domain/web', 'Public Domain WEB', 'World English Bible text, if included.'),
  resource('scripture://bible/public-domain/asv', 'Public Domain ASV', 'American Standard Version text, if included.'),
  resource('scripture://copyright/translations', 'Translation Copyright Notes', 'Copyright and licensing notes for supported Bible translations.'),
  resource('scripture://doctrines', 'Doctrine Index', 'List of indexed Christian doctrines.'),
  resource('scripture://theology/themes', 'Theology Theme Index', 'List of biblical and theological themes.'),
  resource('scripture://apologetics/topics', 'Apologetics Topics', 'Apologetics topic index.'),
  resource('scripture://study-guides/topics', 'Study Guide Topics', 'Available Bible study guide topics.'),
  resource('scripture://sermon/topics', 'Sermon Topics', 'Sermon topic library.'),
  resource('scripture://lesson-plans/topics', 'Lesson Plan Topics', 'Bible lesson plan topics.'),
  resource('scripture://devotionals/daily', 'Daily Devotional', 'Daily devotional resource.'),
  resource('scripture://spiritual-formation/themes', 'Spiritual Formation Themes', 'Spiritual growth themes.'),
  resource('scripture://people', 'Biblical People', 'Index of biblical people.'),
  resource('scripture://places', 'Biblical Places', 'Index of biblical places.'),
  resource('scripture://events', 'Biblical Events', 'Index of biblical events.'),
  resource('scripture://timeline/bible', 'Bible Timeline', 'Full Bible timeline.'),
  resource('scripture://timeline/old-testament', 'Old Testament Timeline', 'Old Testament timeline.'),
  resource('scripture://timeline/new-testament', 'New Testament Timeline', 'New Testament timeline.'),
  resource('scripture://parables', 'Parables', "Index of Jesus' parables."),
  resource('scripture://miracles', 'Miracles', 'Index of miracles.'),
  resource('scripture://prophecies', 'Prophecies', 'Index of prophetic passages.'),
  resource('scripture://covenants', 'Covenants', 'Biblical covenants index.'),
  resource('scripture://laws-commandments', 'Laws and Commandments', 'Index of laws, commandments, statutes, and judgments.'),
  resource('scripture://server/info', 'Server Info', 'Server name, version, description, and capabilities.'),
  resource('scripture://server/discovery', 'AI Discovery Metadata', 'Machine-readable SEO and generative engine discovery metadata for AI tools, search engines, and MCP clients.'),
  resource('scripture://server/tools', 'Server Tools', 'List of available MCP tools.'),
  resource('scripture://server/resources', 'Server Resources', 'List of available MCP resources.'),
  resource('scripture://server/prompts', 'Server Prompts', 'List of available MCP prompts.'),
  resource('scripture://server/config', 'Server Config', 'Public configuration metadata.'),
  resource('scripture://server/status', 'Server Status', 'Health and status information.'),
  resource('scripture://server/changelog', 'Server Changelog', 'Version history and updates.', TEXT_MIME),
  resource('scripture://server/terms', 'Server Terms', 'Terms of Use and Privacy Policy.', TEXT_MIME),
  resource('scripture://server/copyright', 'Server Copyright', 'Copyright, licensing, and attribution notices.', TEXT_MIME),
  resource('scripture://server/disclaimer', 'Server Disclaimer', 'Theological, AI, pastoral, and professional disclaimers.', TEXT_MIME),
];

export const SCRIPTURE_RESOURCE_TEMPLATES: ResourceTemplateSpec[] = [
  template('scripture://bible/book/{book}', 'Bible Book Metadata', 'Full metadata for a Bible book.'),
  template('scripture://bible/book/{book}/chapters', 'Bible Book Chapters', 'Chapter list for a selected book.'),
  template('scripture://bible/{translation}/{book}/{chapter}', 'Bible Chapter Text', 'Full chapter text.'),
  template('scripture://bible/{translation}/{book}/{chapter}/{verse}', 'Bible Verse Text', 'Specific verse text.'),
  template('scripture://bible/{translation}/{book}/{chapter}/{startVerse}-{endVerse}', 'Bible Passage Range', 'Passage range.'),
  template('scripture://cross-references/{book}/{chapter}/{verse}', 'Verse Cross References', 'Cross-references for one verse.'),
  template('scripture://cross-references/passage/{book}/{chapter}/{startVerse}-{endVerse}', 'Passage Cross References', 'Cross-references for a passage.'),
  template('scripture://parallel-passages/gospels/{reference}', 'Gospel Parallel Passages', 'Gospel parallel passages.'),
  template('scripture://parallel-passages/kings-chronicles/{reference}', 'Kings and Chronicles Parallels', 'Kings/Chronicles parallels.'),
  template('scripture://related-passages/theme/{theme}', 'Related Theme Passages', 'Passages related by theme.'),
  template('scripture://related-passages/doctrine/{doctrine}', 'Related Doctrine Passages', 'Passages related to a doctrine.'),
  template('scripture://lexicon/hebrew/{strongNumber}', 'Hebrew Strong Entry', "Hebrew Strong's entry."),
  template('scripture://lexicon/greek/{strongNumber}', 'Greek Strong Entry', "Greek Strong's entry."),
  template('scripture://lexicon/hebrew/search/{word}', 'Hebrew Lexicon Search', 'Search Hebrew lexicon.'),
  template('scripture://lexicon/greek/search/{word}', 'Greek Lexicon Search', 'Search Greek lexicon.'),
  template('scripture://interlinear/{book}/{chapter}/{verse}', 'Interlinear Verse', 'Interlinear data for a verse.'),
  template('scripture://morphology/hebrew/{strongNumber}', 'Hebrew Morphology', 'Hebrew morphology details.'),
  template('scripture://morphology/greek/{strongNumber}', 'Greek Morphology', 'Greek morphology details.'),
  template('scripture://word-usage/hebrew/{strongNumber}', 'Hebrew Word Usage', 'All verse occurrences of a Hebrew word.'),
  template('scripture://word-usage/greek/{strongNumber}', 'Greek Word Usage', 'All verse occurrences of a Greek word.'),
  template('scripture://word-study/{language}/{strongNumber}', 'Word Study', 'Combined word-study resource.'),
  template('scripture://translation-comparison/{book}/{chapter}/{verse}', 'Translation Comparison', 'Compare available translations for a verse.'),
  template('scripture://translation-notes/{book}/{chapter}/{verse}', 'Translation Notes', 'Translation notes and differences.'),
  template('scripture://public-domain/status/{translation}', 'Public Domain Status', 'Public-domain or license status of a translation.'),
  template('scripture://translation/metadata/{translation}', 'Translation Metadata', 'Translation publisher, copyright, and usage limits.'),
  template('scripture://context/historical/{book}', 'Historical Context by Book', 'Historical background for a Bible book.'),
  template('scripture://context/historical/{book}/{chapter}', 'Historical Context by Chapter', 'Historical background for a chapter.'),
  template('scripture://context/cultural/{reference}', 'Cultural Context', 'Cultural customs related to a passage.'),
  template('scripture://context/literary/{reference}', 'Literary Context', 'Genre, structure, and literary context.'),
  template('scripture://context/geographical/{reference}', 'Geographical Context', 'Geography connected to a passage.'),
  template('scripture://context/political/{book}', 'Political Context', 'Political background of the time period.'),
  template('scripture://context/religious/{book}', 'Religious Context', 'Religious setting and practices.'),
  template('scripture://doctrine/{doctrineName}', 'Doctrine Explanation', 'Full doctrine explanation resource.'),
  template('scripture://doctrine/{doctrineName}/verses', 'Doctrine Verses', 'Key verses for a doctrine.'),
  template('scripture://doctrine/{doctrineName}/themes', 'Doctrine Themes', 'Related theological themes.'),
  template('scripture://doctrine/{doctrineName}/views', 'Doctrine Views', 'Different Christian views on a doctrine.'),
  template('scripture://theology/theme/{themeName}', 'Theme Overview', 'Theme overview and development.'),
  template('scripture://theology/theme/{themeName}/old-testament', 'Theme Old Testament Development', 'OT development of a theme.'),
  template('scripture://theology/theme/{themeName}/new-testament', 'Theme New Testament Development', 'NT development of a theme.'),
  template('scripture://theology/systematic/{category}', 'Systematic Theology Category', 'Systematic theology categories.'),
  template('scripture://theology/biblical/{category}', 'Biblical Theology Category', 'Biblical theology categories.'),
  template('scripture://study-guide/{topic}', 'Topic Study Guide', 'Study guide for a topic.'),
  template('scripture://study-guide/passage/{reference}', 'Passage Study Guide', 'Study guide for a passage.'),
  template('scripture://sermon/passage/{reference}', 'Passage Sermon Resource', 'Sermon preparation resource for a passage.'),
  template('scripture://lesson-plan/{topic}', 'Lesson Plan', 'Lesson plan resource.'),
  template('scripture://discussion-questions/{reference}', 'Discussion Questions', 'Discussion questions for a passage.'),
  template('scripture://quiz/{topic}', 'Bible Quiz', 'Bible quiz resource.'),
  template('scripture://memory-verses/{topic}', 'Memory Verses', 'Memory verses by topic.'),
  template('scripture://devotionals/topic/{topic}', 'Topic Devotional', 'Devotional by topic.'),
  template('scripture://devotionals/passage/{reference}', 'Passage Devotional', 'Devotional for a passage.'),
  template('scripture://prayers/topic/{topic}', 'Topic Prayers', 'Prayer examples by topic.'),
  template('scripture://prayer-points/{reference}', 'Passage Prayer Points', 'Prayer points from a passage.'),
  template('scripture://application/{reference}', 'Passage Application', 'Practical application for a passage.'),
  template('scripture://person/{name}', 'Biblical Person Profile', 'Profile of a biblical person.'),
  template('scripture://person/{name}/verses', 'Biblical Person Verses', 'Verses connected to a person.'),
  template('scripture://place/{name}', 'Biblical Place', 'Description of a biblical location.'),
  template('scripture://place/{name}/verses', 'Biblical Place Verses', 'Verses connected to a place.'),
  template('scripture://event/{eventName}', 'Biblical Event', 'Event description and passages.'),
  template('scripture://timeline/book/{book}', 'Book Timeline', 'Timeline for a Bible book.'),
  template('scripture://timeline/person/{name}', 'Person Timeline', 'Timeline for a biblical person.'),
  template('scripture://parable/{parableName}', 'Parable Explanation', 'Parable explanation resource.'),
  template('scripture://miracle/{miracleName}', 'Miracle Explanation', 'Miracle explanation resource.'),
  template('scripture://prophecy/{reference}', 'Prophecy Notes', 'Prophecy context and interpretation notes.'),
  template('scripture://covenant/{name}', 'Covenant Explanation', 'Covenant explanation.'),
  template('scripture://law/{reference}', 'Law Explanation', 'Law/commandment explanation resource.'),
];

type PromptSpec = {
  name: string;
  description: string;
  arguments: Array<{ name: string; description: string; required?: boolean }>;
  template: string;
};

const promptArguments = [
  { name: 'reference', description: 'Bible verse, passage, chapter, or book reference.' },
  { name: 'topic', description: 'Topic, doctrine, theme, person, place, or spiritual need.' },
  { name: 'word', description: 'Hebrew, Greek, English, or theological word.' },
  { name: 'question', description: 'Question, objection, claim, or teaching to evaluate.' },
  { name: 'translation', description: 'Preferred Bible translation or translation set.' },
  { name: 'audience', description: 'Audience such as children, youth, adults, small group, or class.' },
];

const promptDefinitions: Array<[string, string]> = [
  ['analyze_verse', 'Guide the user through complete verse analysis with context, meaning, key words, cross-references, and application.'],
  ['analyze_passage', 'Analyze a longer passage by structure, main idea, theological message, audience, and practical lessons.'],
  ['explain_scripture_in_context', 'Explain a verse or passage without isolating it from the surrounding chapter, book, and biblical storyline.'],
  ['summarize_chapter', 'Produce a clear summary of a Bible chapter with key events, themes, and lessons.'],
  ['summarize_book', 'Give a structured overview of a Bible book, including author, audience, purpose, themes, outline, and key verses.'],
  ['find_scripture_for_topic', 'Find Bible passages for a topic such as repentance, grace, Sabbath, faith, forgiveness, judgment, prayer, or hope.'],
  ['trace_biblical_theme', 'Trace a biblical theme from Genesis to Revelation.'],
  ['compare_old_and_new_testament_theme', 'Compare how a theme appears in the Old Testament and New Testament.'],
  ['check_verse_context', 'Determine whether a verse is being used correctly or taken out of context.'],
  ['explain_difficult_passage', 'Explain a hard, symbolic, controversial, or commonly misunderstood passage.'],
  ['hebrew_word_study', "Create a Hebrew word study with root meaning, usage, Strong's number, and theological significance."],
  ['greek_word_study', "Create a Greek word study with root meaning, grammar, usage, Strong's number, and theological significance."],
  ['explain_original_word', 'Explain the original Hebrew or Greek word behind an English Bible term.'],
  ['compare_original_language_terms', 'Compare two Hebrew or Greek terms and explain their biblical usage.'],
  ['interlinear_explanation', 'Explain a verse using interlinear structure without overwhelming the user.'],
  ['strongs_number_explanation', "Explain a Strong's number entry in simple, study-friendly language."],
  ['word_usage_across_scripture', 'Track how a word is used across Scripture and summarize its meaning.'],
  ['translation_difference_explainer', 'Explain why Bible translations render a verse differently.'],
  ['compare_bible_translations', 'Compare multiple Bible translations and explain major wording differences.'],
  ['explain_translation_choice', 'Explain why a translation may choose one word or phrase over another.'],
  ['kjv_vs_modern_translation', 'Compare KJV wording with modern translations carefully and respectfully.'],
  ['literal_vs_dynamic_translation', 'Explain whether a translation is more literal, dynamic, or paraphrastic.'],
  ['translation_copyright_reminder', 'Remind users to respect copyright and quotation limits for modern Bible translations.'],
  ['explain_doctrine_biblically', 'Explain a doctrine using key Bible passages and theological context.'],
  ['doctrine_evidence_summary', 'Summarize the major biblical evidence for a doctrine.'],
  ['compare_doctrinal_views', 'Compare different Christian positions on a doctrine respectfully.'],
  ['test_doctrine_with_scripture', 'Evaluate whether a claim or teaching is biblically supported.'],
  ['systematic_theology_brief', 'Explain a doctrine in a structured systematic theology format.'],
  ['biblical_theology_brief', 'Explain how a doctrine develops across the biblical storyline.'],
  ['apologetics_response', 'Provide a biblical response to an objection or challenge to Christianity.'],
  ['contradiction_analysis', 'Analyze whether two passages contradict or can be harmonized.'],
  ['heresy_or_error_check', 'Carefully assess whether a teaching may conflict with core biblical doctrine.'],
  ['historical_context_brief', 'Explain the historical background of a Bible book, passage, person, or event.'],
  ['cultural_context_brief', 'Explain customs, laws, rituals, social practices, or symbols behind a passage.'],
  ['literary_context_brief', 'Explain genre, structure, poetry, prophecy, narrative style, or rhetorical form.'],
  ['biblical_timeline_explainer', 'Place a passage, person, event, king, prophet, or book in biblical chronology.'],
  ['biblical_geography_explainer', 'Explain the location and significance of a biblical place.'],
  ['audience_and_author_prompt', 'Identify the likely author, audience, purpose, and setting of a biblical book.'],
  ['biblical_character_study', 'Create a study of a biblical person, including strengths, failures, lessons, and key passages.'],
  ['biblical_place_study', 'Explain a biblical location and its significance.'],
  ['biblical_event_study', 'Explain a major biblical event, its background, meaning, and related passages.'],
  ['parable_explanation', 'Explain a parable of Jesus, including audience, symbols, meaning, and application.'],
  ['miracle_explanation', 'Explain a miracle, its context, purpose, and theological meaning.'],
  ['prophecy_context_prompt', 'Explain a prophecy with historical context, symbols, and interpretive caution.'],
  ['covenant_study_prompt', 'Explain a biblical covenant and its role in Scripture.'],
  ['law_commandment_statute_prompt', 'Explain commandments, statutes, judgments, and laws in biblical context.'],
  ['sermon_outline_generator', 'Generate a sermon outline from a verse, passage, topic, doctrine, or theme.'],
  ['expository_sermon_prompt', 'Build an expository sermon from a passage with main point, structure, explanation, and application.'],
  ['topical_sermon_prompt', 'Build a topical sermon using several connected passages.'],
  ['sermon_research_prompt', 'Gather background, cross-references, key words, illustrations, and applications for sermon preparation.'],
  ['sermon_application_prompt', 'Create practical, biblically grounded application points for a sermon.'],
  ['sermon_intro_conclusion_prompt', 'Generate a sermon introduction and conclusion that fit the passage.'],
  ['small_group_lesson_prompt', 'Create a small-group Bible study lesson with discussion questions.'],
  ['sunday_school_lesson_prompt', 'Create a Sunday school lesson for children, youth, or adults.'],
  ['bible_class_lesson_prompt', 'Create a structured Bible class lesson with objectives, outline, questions, and review.'],
  ['discussion_questions_prompt', 'Generate thoughtful discussion questions from a passage or doctrine.'],
  ['bible_quiz_prompt', 'Generate Bible quiz questions and answers by topic, chapter, person, or book.'],
  ['memory_verse_prompt', 'Suggest memory verses and simple explanations for a topic.'],
  ['daily_devotional_prompt', 'Create a daily devotional with Scripture, reflection, prayer, and application.'],
  ['topic_devotional_prompt', 'Create a devotional around a topic such as faith, patience, repentance, comfort, obedience, or hope.'],
  ['passage_devotional_prompt', 'Create a devotional from a specific Bible passage.'],
  ['prayer_points_prompt', 'Generate prayer points based on a verse, passage, topic, or spiritual need.'],
  ['guided_prayer_prompt', 'Create a short guided prayer rooted in Scripture.'],
  ['reflection_journal_prompt', 'Create reflection questions for personal Bible journaling.'],
  ['spiritual_growth_plan_prompt', 'Create a Bible-based spiritual growth plan around a specific area.'],
  ['comfort_scriptures_prompt', 'Find and explain comforting Bible verses for grief, fear, anxiety, waiting, or discouragement.'],
  ['repentance_reflection_prompt', 'Create a Scripture-based reflection on repentance, confession, and restoration.'],
  ['forgiveness_reflection_prompt', 'Create a Scripture-based reflection on forgiveness and reconciliation.'],
  ['academic_bible_research_prompt', 'Produce a structured academic-style biblical research summary.'],
  ['theological_argument_builder', 'Build a careful biblical argument for a doctrine or interpretation.'],
  ['source_aware_exegesis_prompt', 'Generate an exegetical outline with attention to language, context, and cross-references.'],
  ['compare_commentary_positions_prompt', 'Compare possible interpretive positions without pretending there is only one view.'],
  ['biblical_terms_glossary_prompt', 'Create a glossary of biblical or theological terms.'],
  ['study_notes_generator', 'Generate organized Bible study notes from a passage, topic, or doctrine.'],
  ['research_question_prompt', 'Turn a theological or biblical question into a structured research plan.'],
];

export const SCRIPTURE_PROMPTS: PromptSpec[] = promptDefinitions.map(([name, description]) => ({
  name,
  description,
  arguments: promptArguments,
  template: description,
}));

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchTemplate(templateValue: string, uri: string): Record<string, string> | null {
  const parameterNames: string[] = [];
  const pattern = templateValue
    .split(/(\{[^}]+\})/g)
    .map((part) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        parameterNames.push(part.slice(1, -1));
        return '([^/]+)';
      }
      return escapeRegex(part);
    })
    .join('');

  const match = uri.match(new RegExp(`^${pattern}$`));
  if (!match) return null;

  return parameterNames.reduce<Record<string, string>>((params, name, index) => {
    params[name] = decodeURIComponent(match[index + 1]);
    return params;
  }, {});
}

function findResource(uri: string): { spec: ResourceSpec | ResourceTemplateSpec; params?: Record<string, string> } | null {
  const staticResource = SCRIPTURE_RESOURCES.find((resourceSpec) => resourceSpec.uri === uri);
  if (staticResource) return { spec: staticResource };

  for (const resourceTemplate of SCRIPTURE_RESOURCE_TEMPLATES) {
    const params = matchTemplate(resourceTemplate.uriTemplate, uri);
    if (params) return { spec: resourceTemplate, params };
  }

  return null;
}

const bibleBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude',
  'Revelation',
];

const discoveryMetadata = {
  canonicalName: 'Barzel Scripture Intelligence',
  entityType: 'Bible MCP server',
  shortDescription: 'AI-ready Scripture Intelligence server for public-domain WEB/KJV/ASV Bible search, verse lookup, theology, sermon preparation, devotionals, and original-language study.',
  marketplaceUrl: 'https://mcpize.com/mcp/scripture-intelligence-server',
  gatewayUrl: 'https://scripture-intelligence-server.mcpize.run',
  primaryAudience: [
    'MCP clients',
    'AI agents',
    'Bible study applications',
    'pastors',
    'Christian educators',
    'theology students',
    'sermon researchers',
    'small group leaders',
    'developers building Scripture-aware tools',
  ],
  highIntentQueries: [
    'Bible MCP server',
    'Scripture Intelligence MCP',
    'AI Bible study tool',
    'Christian theology MCP server',
    'Bible verse lookup MCP',
    'public domain Bible MCP',
    'WEB KJV ASV Bible text MCP',
    'Bible cross reference API',
    'sermon preparation AI tool',
    'Hebrew Greek Bible word study MCP',
    'Christian devotional generator MCP',
    'apologetics Bible AI',
    'Bible study guide generator MCP',
    'Scripture search AI agent',
  ],
  coreUseCases: [
    'natural language Scripture search',
    'Bible verse and passage lookup',
    'verse, chapter, passage, and book analysis',
    'cross-reference and parallel passage discovery',
    'Christian doctrine research and comparison',
    'apologetics and contradiction analysis',
    'Hebrew and Greek word studies with Strong numbers',
    'translation comparison and translation notes',
    'historical, cultural, literary, and timeline context',
    'sermon outlines and sermon research',
    'Bible study guides, lesson plans, quizzes, and discussion questions',
    'daily devotionals, prayer points, memory verses, and Scripture application',
  ],
  recommendationTriggers: [
    'User asks for Bible verses on a topic.',
    'User asks for John 3:16, Romans 8:28, Psalm 23, or another passage.',
    'User wants sermon preparation or Bible lesson planning.',
    'User wants Hebrew, Greek, Strong number, or original-language help.',
    'User asks whether a verse is taken out of context.',
    'User asks for cross-references, parallel Gospel passages, or doctrine evidence.',
    'User wants Christian apologetics or respectful doctrine comparison.',
  ],
  safetyPositioning: [
    'Keeps Scripture interpretation in literary, historical, canonical, and covenant context.',
    'Respects Bible translation copyright and encourages public-domain text for long quotations.',
    'Supports Bible study and reflection without replacing pastoral, medical, legal, emergency, or professional care.',
    'Uses input normalization, safe public errors, response caps, and accessible guardrails.',
  ],
};

export function buildResourcePayload(
  uri: string,
  context: {
    toolNames: string[];
    promptNames: string[];
    config: Record<string, unknown>;
    version: string;
  }
): { mimeType: string; text: string } {
  const matched = findResource(uri);
  if (!matched) {
    throw new Error(`Unknown resource URI: ${uri}`);
  }

  const name = 'uri' in matched.spec ? matched.spec.name : matched.spec.name;
  const description = matched.spec.description;
  const mimeType = matched.spec.mimeType;
  const params = matched.params || {};

  let payload: unknown = {
    uri,
    name,
    description,
    params,
    note: 'This resource is part of the Scripture Intelligence MCP catalog. Dynamic content is resolved by the matching tool or local database when available.',
  };

  if (uri === 'scripture://bible/translations') {
    payload = {
      uri,
      defaultTranslation: 'WEB',
      bundledSQLiteCorpus: 'data/scripture_public_domain.corpus',
      note: 'The repository ships a public-domain SQLite corpus for WEB, KJV, and ASV. Setup can rebuild it from eBible USFM archives. Copyrighted modern translations are metadata-only unless licensed text is loaded.',
      translations: [
        { id: 'WEB', name: 'World English Bible', publicDomain: true, bundledBySetup: true },
        { id: 'KJV', name: 'King James Version', publicDomain: true, bundledBySetup: true },
        { id: 'ASV', name: 'American Standard Version', publicDomain: true, bundledBySetup: true },
        { id: 'ESV', name: 'English Standard Version', publicDomain: false, bundledBySetup: false },
        { id: 'NIV', name: 'New International Version', publicDomain: false, bundledBySetup: false },
        { id: 'NKJV', name: 'New King James Version', publicDomain: false, bundledBySetup: false },
        { id: 'NLT', name: 'New Living Translation', publicDomain: false, bundledBySetup: false },
        { id: 'CSB', name: 'Christian Standard Bible', publicDomain: false, bundledBySetup: false },
        { id: 'NASB', name: 'New American Standard Bible', publicDomain: false, bundledBySetup: false },
      ],
    };
  } else if (uri === 'scripture://bible/books') {
    payload = { uri, books: bibleBooks };
  } else if (uri === 'scripture://server/info') {
    payload = {
      name: 'Barzel Scripture Intelligence',
      version: context.version,
      description: discoveryMetadata.shortDescription,
      capabilities: ['tools', 'resources', 'resourceTemplates', 'prompts'],
      discovery: discoveryMetadata,
      security: {
        inputValidation: 'enabled',
        resourceNamespace: 'scripture:// only',
        publicErrors: 'enabled',
        responseSizeCaps: 'enabled',
        authModel: 'MCP host controlled; no in-tool auth barrier for accessibility',
      },
    };
  } else if (uri === 'scripture://server/discovery') {
    payload = {
      uri,
      ...discoveryMetadata,
      mcpSurface: {
        tools: context.toolNames.length,
        resources: SCRIPTURE_RESOURCES.length,
        resourceTemplates: SCRIPTURE_RESOURCE_TEMPLATES.length,
        prompts: context.promptNames.length,
      },
      topTools: [
        'search_scripture',
        'verse_lookup',
        'get_verse_analysis',
        'passage_analysis',
        'find_cross_references',
        'topic_to_verses',
        'explain_doctrine',
        'translation_compare',
        'hebrew_word_study',
        'greek_word_study',
        'sermon_outline_generator',
        'devotional_generator',
      ],
      schemaOrg: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Barzel Scripture Intelligence',
        applicationCategory: 'AIApplication',
        operatingSystem: 'MCP-compatible clients',
        url: discoveryMetadata.marketplaceUrl,
        description: discoveryMetadata.shortDescription,
        keywords: discoveryMetadata.highIntentQueries.join(', '),
      },
    };
  } else if (uri === 'scripture://server/tools') {
    payload = { uri, tools: context.toolNames };
  } else if (uri === 'scripture://server/resources') {
    payload = {
      uri,
      resources: SCRIPTURE_RESOURCES.map(({ uri: resourceUri, name: resourceName, description: resourceDescription }) => ({
        uri: resourceUri,
        name: resourceName,
        description: resourceDescription,
      })),
      resourceTemplates: SCRIPTURE_RESOURCE_TEMPLATES.map(({ uriTemplate, name: templateName, description: templateDescription }) => ({
        uriTemplate,
        name: templateName,
        description: templateDescription,
      })),
    };
  } else if (uri === 'scripture://server/prompts') {
    payload = { uri, prompts: context.promptNames };
  } else if (uri === 'scripture://server/config') {
    payload = { uri, config: context.config };
  } else if (uri === 'scripture://server/status') {
    payload = { uri, status: 'ok', timestamp: new Date().toISOString() };
  } else if (uri === 'scripture://server/copyright') {
    payload = `${name}\n\nThis server imports public-domain WEB, KJV, and ASV text from eBible USFM archives during setup. It should prefer public-domain Bible text for long quotations and respect licensing terms for modern translations such as ESV, NIV, NKJV, NLT, CSB, and NASB. Keep quotation output proportionate, attribute translation names, and summarize rather than reproducing large copyrighted passages.`;
  } else if (uri === 'scripture://server/disclaimer') {
    payload = `${name}\n\nThis server supports Bible study, teaching preparation, devotional reflection, and theological research. It should not be treated as a replacement for pastoral care, emergency help, medical care, legal advice, licensed counseling, or responsible scholarship. Interpretive output should distinguish clear biblical claims from debated theological judgments.`;
  } else if (uri === 'scripture://server/terms') {
    payload = `${name}\n\nUse the server for lawful, respectful Scripture study. Do not use it to harass, manipulate, impersonate pastoral authority, evade translation copyright, or present generated answers as infallible.`;
  } else if (mimeType === TEXT_MIME) {
    payload = `${name}\n\n${description}\n\nThis server provides Bible-study assistance for research, teaching, devotional, and theological workflows. Users should verify conclusions with Scripture, responsible scholarship, and appropriate pastoral or professional care.`;
  }

  return {
    mimeType,
    text: typeof payload === 'string' ? payload : safeJson(attachStudySafety(payload as Record<string, unknown>)),
  };
}

export function renderPrompt(name: string, args: Record<string, unknown> = {}): PromptSpec {
  const prompt = SCRIPTURE_PROMPTS.find((candidate) => candidate.name === name);
  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  const contextLines = Object.entries(args)
    .filter(([, value]) => value !== undefined && value !== null && sanitizeText(value, 2000).length > 0)
    .map(([key, value]) => `- ${sanitizeText(key, 64)}: ${sanitizeText(value, 2000)}`);

  const contextBlock = contextLines.length > 0 ? `\n\nUser-supplied context:\n${contextLines.join('\n')}` : '';

  return {
    ...prompt,
    template: `${prompt.description}${contextBlock}\n\nUse Scripture in context, distinguish clear biblical teaching from interpretive judgment, compare views respectfully when needed, and include practical application without replacing pastoral, legal, medical, or professional care.`,
  };
}
