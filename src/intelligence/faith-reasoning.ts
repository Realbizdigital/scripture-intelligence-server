import { BibleVerse } from '../types/index.js';
import { BibleDatabase } from '../database/bible-data.js';

export class FaithReasoningAssistant {
  private db: BibleDatabase;

  constructor(db: BibleDatabase) {
    this.db = db;
  }

  async provideFaithBasedExplanation(verses: BibleVerse[], question: string): Promise<string> {
    const context = await this.analyzeTheologicalContext(verses);
    const principles = await this.extractBiblicalPrinciples(verses);
    const applications = await this.generateFaithApplications(verses, question);
    
    return this.constructExplanation(verses, context, principles, applications);
  }

  async answerTheologicalQuestion(question: string): Promise<string> {
    const questionType = this.classifyTheologicalQuestion(question);
    const relevantScripture = await this.findRelevantScripture(question);
    const theologicalFramework = await this.establishTheologicalFramework(question);
    
    return this.constructTheologicalAnswer(question, questionType, relevantScripture, theologicalFramework);
  }

  async provideSpiritualGuidance(topic: string, situation?: string): Promise<string> {
    const scripturalFoundation = await this.findScripturalFoundation(topic);
    const biblicalPrinciples = await this.extractGuidancePrinciples(scripturalFoundation);
    const practicalApplication = await this.generatePracticalGuidance(biblicalPrinciples, situation);
    
    return this.constructGuidance(topic, scripturalFoundation, biblicalPrinciples, practicalApplication);
  }

  async explainDoctrinalConcept(doctrine: string): Promise<string> {
    const scripturalBasis = await this.findDoctrinalScripture(doctrine);
    const historicalDevelopment = await this.traceDoctrineHistory(doctrine);
    const theologicalSignificance = await this.explainDoctrineSignificance(doctrine);
    
    return this.constructDoctrinalExplanation(doctrine, scripturalBasis, historicalDevelopment, theologicalSignificance);
  }

  private async analyzeTheologicalContext(verses: BibleVerse[]): Promise<string> {
    const themes = await Promise.all(
      verses.map(verse => this.db.getTheologicalThemes(verse.book, verse.chapter, verse.verse))
    );
    
    const uniqueThemes = [...new Set(themes.flat().map(theme => theme.name))];
    
    if (uniqueThemes.length === 0) {
      return 'These verses reveal fundamental truths about God\'s character and His relationship with humanity.';
    }
    
    const themeDescriptions = uniqueThemes.map(theme => {
      const descriptions: Record<string, string> = {
        'love': 'God\'s unconditional, sacrificial love that forms the foundation of all relationships',
        'faith': 'Trust in God\'s character and promises that enables relationship with Him',
        'hope': 'Confident expectation based on God\'s faithfulness and the certainty of His promises',
        'grace': 'God\'s unmerited favor providing salvation and spiritual enablement',
        'mercy': 'God\'s compassion toward the suffering and His forgiveness toward the repentant',
        'salvation': 'God\'s deliverance from sin and its consequences through Christ\'s sacrifice',
        'redemption': 'God\'s action of buying back humanity from slavery to sin',
        'righteousness': 'God\'s moral perfection and the standard He requires and provides',
        'holiness': 'God\'s absolute purity and the call for His people to be set apart',
        'wisdom': 'Divine insight for understanding reality and living according to God\'s design',
        'peace': 'The tranquility that comes from right relationship with God',
        'joy': 'Deep-seated gladness rooted in God\'s presence and salvation',
        'kingdom': 'God\'s sovereign rule over all creation and its establishment on earth',
        'covenant': 'God\'s binding commitments that form the basis of His relationship with humanity',
        'glory': 'The visible manifestation of God\'s presence and character',
        'truth': 'God\'s perfect understanding of reality and His faithfulness to it',
        'light': 'God\'s presence that dispels darkness and reveals truth',
        'life': 'The vitality that comes from relationship with God',
        'freedom': 'Liberty from sin\'s bondage through Christ\'s redemption',
        'justice': 'God\'s perfect fairness and His commitment to right moral order',
        'power': 'God\'s ability to accomplish His purposes and work in human lives'
      };
      
      return descriptions[theme.toLowerCase()] || `the biblical theme of ${theme}`;
    });
    
    return `These verses speak to ${themeDescriptions.join(', ')}. This reveals God's character and His purposes for humanity, showing how He works in and through human history to accomplish His redemptive plan.`;
  }

  private async extractBiblicalPrinciples(verses: BibleVerse[]): Promise<string[]> {
    const principles: string[] = [];
    
    for (const verse of verses) {
      const versePrinciples = this.extractPrinciplesFromVerse(verse);
      principles.push(...versePrinciples);
    }
    
    return [...new Set(principles)]; // Remove duplicates
  }

  private extractPrinciplesFromVerse(verse: BibleVerse): string[] {
    const text = verse.text.toLowerCase();
    const principles: string[] = [];
    
    // Extract principles based on key theological concepts
    if (text.includes('love') || text.includes('charity')) {
      principles.push('Love is foundational to all Christian virtue and relationships');
    }
    if (text.includes('faith') || text.includes('believe')) {
      principles.push('Faith is the means by which we receive God\'s grace and please Him');
    }
    if (text.includes('hope') || text.includes('expect')) {
      principles.push('Hope provides confident expectation for God\'s promises and future');
    }
    if (text.includes('grace') || text.includes('favor')) {
      principles.push('Grace is God\'s unmerited favor that enables salvation and spiritual growth');
    }
    if (text.includes('mercy') || text.includes('compassion')) {
      principles.push('Mercy reflects God\'s compassion and should characterize our relationships');
    }
    if (text.includes('forgive') || text.includes('forgiveness')) {
      principles.push('Forgiveness releases others from debt as God has released us');
    }
    if (text.includes('pray') || text.includes('prayer')) {
      principles.push('Prayer is essential communion with God and foundation of spiritual life');
    }
    if (text.includes('obey') || text.includes('command')) {
      principles.push('Obedience to God\'s commands demonstrates love and trust in Him');
    }
    if (text.includes('serve') || text.includes('service')) {
      principles.push('Service to others reflects Christ\'s example and demonstrates love');
    }
    if (text.includes('worship') || text.includes('praise')) {
      principles.push('Worship honors God and acknowledges His supreme worthiness');
    }
    if (text.includes('wisdom') || text.includes('understanding')) {
      principles.push('True wisdom comes from God and guides righteous living');
    }
    if (text.includes('peace') || text.includes('tranquil')) {
      principles.push('Peace comes from right relationship with God, not circumstances');
    }
    if (text.includes('joy') || text.includes('rejoice')) {
      principles.push('Joy is rooted in God\'s presence and salvation, not circumstances');
    }
    if (text.includes('truth') || text.includes('true')) {
      principles.push('Truth is absolute, found in God, and should guide all beliefs and actions');
    }
    if (text.includes('light') || text.includes('darkness')) {
      principles.push('Light represents God\'s presence and truth, darkness represents evil and ignorance');
    }
    if (text.includes('holy') || text.includes('sanctify')) {
      principles.push('Holiness is God\'s standard and the calling for His people');
    }
    if (text.includes('righteous') || text.includes('justice')) {
      principles.push('Righteousness and justice reflect God\'s character and should characterize His people');
    }
    
    // Default principle if none specific found
    if (principles.length === 0) {
      principles.push('All Scripture reveals God\'s truth and provides guidance for faith and life');
    }
    
    return principles;
  }

  private async generateFaithApplications(verses: BibleVerse[], question: string): Promise<string[]> {
    const applications: string[] = [];
    
    // Analyze the question to determine application areas
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('how') || questionLower.includes('apply') || questionLower.includes('live')) {
      applications.push('This passage calls us to examine our lives and align our actions with biblical truth');
      applications.push('Consider how this principle can be applied in your relationships, work, and spiritual life');
    }
    
    if (questionLower.includes('why') || questionLower.includes('meaning') || questionLower.includes('purpose')) {
      applications.push('This passage reveals deeper spiritual realities that give meaning to our experiences');
      applications.push('Understanding this truth transforms how we view God, ourselves, and our circumstances');
    }
    
    if (questionLower.includes('what') || questionLower.includes('believe') || questionLower.includes('doctrine')) {
      applications.push('This passage shapes our understanding of God and His redemptive work');
      applications.push('These truths should form the foundation of our faith and worship');
    }
    
    // Add general applications
    applications.push('Meditate on this passage throughout the week, asking God to deepen your understanding');
    applications.push('Share this truth with someone who might be encouraged by it');
    applications.push('Look for opportunities to put this principle into practice in your daily life');
    
    return applications;
  }

  private constructExplanation(
    verses: BibleVerse[], 
    context: string, 
    principles: string[], 
    applications: string[]
  ): string {
    const verseReferences = verses.map(v => `${v.book} ${v.chapter}:${v.verse}`).join(', ');
    
    let explanation = `Looking at ${verseReferences}, ${context.toLowerCase()}\n\n`;
    
    explanation += 'Biblical Principles:\n';
    principles.forEach((principle, index) => {
      explanation += `${index + 1}. ${principle}\n`;
    });
    
    explanation += '\nFaith Application:\n';
    applications.forEach((application, index) => {
      explanation += `${index + 1}. ${application}\n`;
    });
    
    explanation += '\nFrom a faith perspective, this passage invites us to draw closer to God and allow His truth to transform us. The Holy Spirit works through Scripture to shape our hearts, minds, and actions to reflect Christ\'s character more fully.';
    
    return explanation;
  }

  private classifyTheologicalQuestion(question: string): string {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('trinity') || questionLower.includes('godhead') || questionLower.includes('three persons')) {
      return 'doctrine of trinity';
    }
    if (questionLower.includes('salvation') || questionLower.includes('saved') || questionLower.includes('born again')) {
      return 'doctrine of salvation';
    }
    if (questionLower.includes('christ') || questionLower.includes('jesus') || questionLower.includes('messiah')) {
      return 'christology';
    }
    if (questionLower.includes('holy spirit') || questionLower.includes('spirit')) {
      return 'pneumatology';
    }
    if (questionLower.includes('church') || questionLower.includes('ecclesiology')) {
      return 'ecclesiology';
    }
    if (questionLower.includes('end times') || questionLower.includes('eschatology') || questionLower.includes('revelation')) {
      return 'eschatology';
    }
    if (questionLower.includes('sin') || questionLower.includes('fall') || questionLower.includes('human nature')) {
      return 'hamartiology';
    }
    if (questionLower.includes('bible') || questionLower.includes('scripture') || questionLower.includes('revelation')) {
      return 'bibliology';
    }
    if (questionLower.includes('angels') || questionLower.includes('demons') || questionLower.includes('spiritual beings')) {
      return 'angelology';
    }
    
    return 'general theological inquiry';
  }

  private async findRelevantScripture(question: string): Promise<BibleVerse[]> {
    const keywords = this.extractKeywords(question);
    const searchQuery = keywords.join(' ');
    
    return this.db.searchVerses(searchQuery, undefined, 10);
  }

  private extractKeywords(question: string): string[] {
    const theologicalTerms = [
      'god', 'jesus', 'christ', 'holy spirit', 'trinity', 'salvation', 'sin', 'grace', 'faith',
      'hope', 'love', 'mercy', 'church', 'bible', 'scripture', 'heaven', 'hell', 'judgment',
      'resurrection', 'crucifixion', 'cross', 'gospel', 'kingdom', 'covenant', 'law', 'prophet',
      'apostle', 'disciple', 'worship', 'prayer', 'baptism', 'communion', 'sabbath', 'temple',
      'sacrifice', 'offering', 'priest', 'creation', 'fall', 'redemption', 'glory', 'truth',
      'wisdom', 'peace', 'joy', 'righteousness', 'holiness', 'justice', 'mercy', 'power'
    ];
    
    const words = question.toLowerCase().split(/\s+/);
    return words.filter(word => theologicalTerms.includes(word) || word.length > 4);
  }

  private async establishTheologicalFramework(question: string): Promise<string> {
    const frameworks: Record<string, string> = {
      'doctrine of trinity': 'The doctrine of the Trinity reveals God as one essence in three persons - Father, Son, and Holy Spirit. This mystery is foundational to Christian faith, understanding God\'s nature, and our relationship with Him.',
      'doctrine of salvation': 'Salvation is God\'s deliverance from sin and its consequences through faith in Jesus Christ. It involves justification, sanctification, and glorification, demonstrating God\'s grace and love.',
      'christology': 'Christology studies the person and work of Jesus Christ - fully God and fully man. His life, death, resurrection, and ascension accomplish redemption and reveal God\'s character.',
      'pneumatology': 'Pneumatology examines the person and work of the Holy Spirit - the third person of the Trinity. The Spirit regenerates, indwells, empowers, and guides believers for Christian living and service.',
      'ecclesiology': 'Ecclesiology studies the nature and purpose of the church as the body of Christ and community of believers. The church exists for worship, fellowship, discipleship, and mission.',
      'eschatology': 'Eschatology explores last things - Christ\'s return, resurrection, judgment, and eternal state. It provides hope and perspective for present Christian living.',
      'hamartiology': 'Hamartiology examines the doctrine of sin - its origin, nature, and consequences. Sin affects all humanity and creation, requiring divine redemption through Christ.',
      'bibliology': 'Bibliology studies the doctrine of Scripture - its inspiration, authority, sufficiency, and clarity. The Bible is God\'s Word revealing truth for faith and life.',
      'angelology': 'Angelology studies angels and demons - spiritual beings created by God. Angels serve God and believers, while demons oppose God\'s work and tempt humanity.',
      'general theological inquiry': 'Christian theology seeks to understand God and His revelation in Scripture. All theological inquiry should lead to greater worship, deeper faith, and more faithful obedience.'
    };
    
    const questionType = this.classifyTheologicalQuestion(question);
    return frameworks[questionType] || frameworks['general theological inquiry'];
  }

  private constructTheologicalAnswer(
    question: string, 
    questionType: string, 
    scripture: BibleVerse[], 
    framework: string
  ): string {
    const verseReferences = scripture.map(v => `${v.book} ${v.chapter}:${v.verse}`).slice(0, 3).join(', ');
    
    let answer = `Regarding your question about ${questionType}, ${framework.toLowerCase()}\n\n`;
    
    if (scripture.length > 0) {
      answer += `Key passages include ${verseReferences}. These Scriptures provide the foundation for understanding this doctrine.\n\n`;
    }
    
    answer += 'From a faith perspective, this doctrine is not merely intellectual but relational - it shapes how we know God, experience His presence, and live out His purposes. The Holy Spirit illuminates these truths to transform our hearts and minds.\n\n';
    
    answer += 'This teaching calls us to deeper worship, more faithful obedience, and greater trust in God\'s revealed truth. As we embrace these doctrines, we grow in our relationship with God and become more effective witnesses of His grace.';
    
    return answer;
  }

  private async findScripturalFoundation(topic: string): Promise<BibleVerse[]> {
    const topicMappings: Record<string, string[]> = {
      'anxiety': ['philippians 4:6', '1 peter 5:7', 'matthew 6:25'],
      'depression': ['psalm 42:11', '2 corinthians 1:8', '1 kings 19:4'],
      'marriage': ['genesis 2:24', 'ephesians 5:22', '1 corinthians 13'],
      'parenting': ['proverbs 22:6', 'ephesians 6:4', 'deuteronomy 6:7'],
      'work': ['colossians 3:23', 'proverbs 16:3', '2 thessalonians 3:10'],
      'suffering': ['romans 8:28', '2 corinthians 4:17', '1 peter 4:12'],
      'forgiveness': ['matthew 6:14', 'colossians 3:13', 'ephesians 4:32'],
      'leadership': ['matthew 20:26', '1 timothy 3:1', 'proverbs 29:2']
    };
    
    const references = topicMappings[topic.toLowerCase()] || [topic];
    const verses: BibleVerse[] = [];
    
    for (const ref of references) {
      const { book, chapter, verse } = this.parseReference(ref);
      if (book && chapter && verse) {
        const bibleVerse = await this.db.getVerse(book, chapter, verse);
        if (bibleVerse) verses.push(bibleVerse);
      }
    }
    
    return verses.length > 0 ? verses : await this.db.searchVerses(topic, undefined, 5);
  }

  private parseReference(reference: string): { book?: string; chapter?: number; verse?: number } {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      return { book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) };
    }
    return {};
  }

  private async extractGuidancePrinciples(scripture: BibleVerse[]): Promise<string[]> {
    return this.extractBiblicalPrinciples(scripture);
  }

  private async generatePracticalGuidance(principles: string[], situation?: string): Promise<string[]> {
    const guidance: string[] = [];
    
    principles.forEach(principle => {
      guidance.push(`Apply this principle by ${principle.toLowerCase().replace('is ', 'being ').replace('the ', 'the ')}`);
    });
    
    if (situation) {
      guidance.push(`In your specific situation of ${situation}, consider how these principles provide wisdom and direction`);
    }
    
    guidance.push('Pray for the Holy Spirit\'s guidance in applying these truths');
    guidance.push('Seek counsel from mature believers who can help you apply these principles');
    
    return guidance;
  }

  private constructGuidance(
    topic: string, 
    scripture: BibleVerse[], 
    principles: string[], 
    applications: string[]
  ): string {
    const verseReferences = scripture.map(v => `${v.book} ${v.chapter}:${v.verse}`).join(', ');
    
    let guidance = `For guidance regarding ${topic}, Scripture provides wisdom in ${verseReferences}.\n\n`;
    
    guidance += 'Biblical Principles:\n';
    principles.forEach((principle, index) => {
      guidance += `${index + 1}. ${principle}\n`;
    });
    
    guidance += '\nPractical Application:\n';
    applications.forEach((application, index) => {
      guidance += `${index + 1}. ${application}\n`;
    });
    
    guidance += '\nRemember that God\'s wisdom often works through community, prayer, and patient trust in His timing. The Holy Spirit will guide you as you seek to apply these biblical principles to your life.';
    
    return guidance;
  }

  private async findDoctrinalScripture(doctrine: string): Promise<BibleVerse[]> {
    const doctrineMappings: Record<string, string[]> = {
      'trinity': ['matthew 28:19', '2 corinthians 13:14', 'john 1:1'],
      'incarnation': ['john 1:14', 'philippians 2:6', 'colossians 2:9'],
      'atonement': ['romans 3:25', '2 corinthians 5:21', 'hebrews 9:22'],
      'resurrection': ['1 corinthians 15:3', 'romans 1:4', '1 peter 1:3'],
      'justification': ['romans 5:1', 'galatians 2:16', 'philippians 3:9']
    };
    
    const references = doctrineMappings[doctrine.toLowerCase()] || [doctrine];
    const verses: BibleVerse[] = [];
    
    for (const ref of references) {
      const { book, chapter, verse } = this.parseReference(ref);
      if (book && chapter && verse) {
        const bibleVerse = await this.db.getVerse(book, chapter, verse);
        if (bibleVerse) verses.push(bibleVerse);
      }
    }
    
    return verses;
  }

  private async traceDoctrineHistory(doctrine: string): Promise<string> {
    const histories: Record<string, string> = {
      'trinity': 'The doctrine of the Trinity developed gradually in the early church, formally defined at the Council of Nicaea (325 AD) and Constantinople (381 AD) to combat Arianism and affirm Christ\'s full divinity.',
      'incarnation': 'The doctrine of the Incarnation was formulated against Gnostic and Docetic heresies, affirming Christ\'s full humanity and divinity at the Council of Chalcedon (451 AD).',
      'atonement': 'Atonement theology developed from early church understanding through medieval satisfaction theory (Anselm) to Reformation penal substitution (Calvin) and modern recapitulation and governmental theories.',
      'resurrection': 'Resurrection faith was central from the earliest church, defended against pagan philosophy and Gnostic denial, becoming foundational for Christian hope and eschatology.',
      'justification': 'Justification by faith was emphasized in the Reformation (Luther, Calvin) against medieval works-righteousness, later developed in evangelical theology and ecumenical dialogue.'
    };
    
    return histories[doctrine.toLowerCase()] || 'This doctrine has been developed throughout church history through biblical study, theological reflection, and response to various challenges and questions.';
  }

  private async explainDoctrineSignificance(doctrine: string): Promise<string> {
    const significances: Record<string, string> = {
      'trinity': 'The Trinity reveals God\'s relational nature and provides the basis for Christian community, love, and mission. It distinguishes Christianity from other monotheistic religions.',
      'incarnation': 'The Incarnation demonstrates God\'s love and identification with humanity, making possible our salvation and providing the perfect example of human life.',
      'atonement': 'Atonement explains how God\'s justice and mercy are satisfied through Christ\'s sacrifice, providing the foundation for forgiveness and reconciliation with God.',
      'resurrection': 'The Resurrection validates Christ\'s deity, demonstrates God\'s power over death, and guarantees believers\' future resurrection and eternal life.',
      'justification': 'Justification explains how sinful humans can be declared righteous before God, providing assurance of salvation and the basis for Christian living.'
    };
    
    return significances[doctrine.toLowerCase()] || 'This doctrine is essential for understanding God\'s redemptive work and Christian faith and practice.';
  }

  private constructDoctrinalExplanation(
    doctrine: string, 
    scripture: BibleVerse[], 
    history: string, 
    significance: string
  ): string {
    const verseReferences = scripture.map(v => `${v.book} ${v.chapter}:${v.verse}`).join(', ');
    
    let explanation = `The doctrine of ${doctrine} is foundational to Christian faith. ${significance}\n\n`;
    
    if (scripture.length > 0) {
      explanation += `Scriptural foundation includes ${verseReferences}. These passages reveal the biblical basis for this doctrine.\n\n`;
    }
    
    explanation += `Historical development: ${history}\n\n`;
    
    explanation += 'This doctrine calls us to worship, shapes our understanding of God, and guides our faith and practice. It is not merely intellectual but transformative, affecting how we live and relate to God and others.';
    
    return explanation;
  }
}
