import { BibleVerse, Devotional, TheologicalTheme } from '../types/index.js';
import { BibleDatabase } from '../database/bible-data.js';

export class DevotionalGenerator {
  private db: BibleDatabase;

  constructor(db: BibleDatabase) {
    this.db = db;
  }

  async generateDailyDevotional(date?: string): Promise<Devotional> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dayOfYear = this.getDayOfYear(targetDate);
    
    // Select scripture based on day of year
    const scripture = await this.selectScriptureForDay(dayOfYear);
    const theme = await this.selectThemeForDay(dayOfYear);
    
    const devotional = await this.createDevotional(scripture, theme, targetDate);
    
    return devotional;
  }

  async generateTopicalDevotional(topic: string): Promise<Devotional> {
    const scripture = await this.findScriptureForTopic(topic);
    const theme = await this.findThemeForTopic(topic);
    const date = new Date().toISOString().split('T')[0];
    
    return this.createDevotional(scripture, theme, date, topic);
  }

  async generateVerseDevotional(verseReference: string): Promise<Devotional> {
    const { book, chapter, verse } = this.parseVerseReference(verseReference);
    if (!book || !chapter || !verse) {
      throw new Error('Invalid verse reference format');
    }

    const scripture = await this.db.getVerse(book, chapter, verse);
    if (!scripture) {
      throw new Error('Verse not found');
    }

    const themes = await this.db.getTheologicalThemes(book, chapter, verse);
    const theme = themes[0] || { name: 'Biblical Reflection', description: 'Personal reflection on Scripture' };
    const date = new Date().toISOString().split('T')[0];

    return this.createDevotional([scripture], theme, date);
  }

  private async selectScriptureForDay(dayOfYear: number): Promise<BibleVerse[]> {
    // This would ideally use a pre-calculated reading plan
    // For now, we'll select from key passages
    const keyPassages = [
      { book: 'Genesis', chapter: 1, verse: 1 },
      { book: 'Psalm', chapter: 23, verse: 1 },
      { book: 'Isaiah', chapter: 40, verse: 31 },
      { book: 'Matthew', chapter: 5, verse: 3 },
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Romans', chapter: 8, verse: 28 },
      { book: 'Philippians', chapter: 4, verse: 13 },
      { book: 'Revelation', chapter: 21, verse: 4 }
    ];

    const passageIndex = dayOfYear % keyPassages.length;
    const passage = keyPassages[passageIndex];
    
    const verse = await this.db.getVerse(passage.book, passage.chapter, passage.verse);
    return verse ? [verse] : await this.selectScriptureForDay(dayOfYear + 1);
  }

  private async selectThemeForDay(dayOfYear: number): Promise<TheologicalTheme> {
    const themes = [
      { name: 'God\'s Love', description: 'Exploring the infinite love of God' },
      { name: 'Faith', description: 'Trusting God in all circumstances' },
      { name: 'Hope', description: 'The confident expectation of God\'s promises' },
      { name: 'Grace', description: 'Unmerited favor and divine enablement' },
      { name: 'Mercy', description: 'God\'s compassion and forgiveness' },
      { name: 'Wisdom', description: 'Divine insight for righteous living' },
      { name: 'Peace', description: 'The tranquility that comes from God' },
      { name: 'Joy', description: 'Deep gladness rooted in God\'s goodness' },
      { name: 'Patience', description: 'Enduring with grace and hope' },
      { name: 'Kindness', description: 'Active goodness toward others' },
      { name: 'Forgiveness', description: 'Releasing others as God releases us' },
      { name: 'Humility', description: 'Right view of self before God' },
      { name: 'Courage', description: 'Strength to stand for truth' },
      { name: 'Perseverance', description: 'Steadfast faith amid trials' },
      { name: 'Contentment', description: 'Satisfaction in God\'s provision' },
      { name: 'Obedience', description: 'Joyful submission to God\'s will' },
      { name: 'Service', description: 'Using gifts to bless others' },
      { name: 'Worship', description: 'Honoring God with all of life' },
      { name: 'Prayer', description: 'Communion with the living God' },
      { name: 'Fellowship', description: 'Community in Christ' }
    ];

    const themeIndex = dayOfYear % themes.length;
    const selectedTheme = themes[themeIndex];
    
    return {
      ...selectedTheme,
      keyVerses: [],
      relatedThemes: [],
      historicalDevelopment: `${selectedTheme.name} is a central biblical theme that runs throughout Scripture, revealing God's character and His purposes for humanity.`
    };
  }

  private async findScriptureForTopic(topic: string): Promise<BibleVerse[]> {
    const topicKeywords = {
      'love': ['love', 'charity', 'beloved', 'affection'],
      'faith': ['faith', 'trust', 'believe', 'confidence'],
      'hope': ['hope', 'expectation', 'future', 'promise'],
      'grace': ['grace', 'favor', 'unmerited', 'gift'],
      'mercy': ['mercy', 'compassion', 'pity', 'forgiveness'],
      'wisdom': ['wisdom', 'understanding', 'knowledge', 'insight'],
      'peace': ['peace', 'tranquility', 'rest', 'calm'],
      'joy': ['joy', 'gladness', 'rejoice', 'delight'],
      'patience': ['patience', 'endurance', 'perseverance', 'longsuffering'],
      'courage': ['courage', 'strength', 'bold', 'brave'],
      'forgiveness': ['forgiveness', 'forgive', 'pardon', 'mercy'],
      'humility': ['humility', 'humble', 'meek', 'lowly'],
      'service': ['service', 'serve', 'minister', 'help'],
      'worship': ['worship', 'praise', 'honor', 'glorify'],
      'prayer': ['prayer', 'pray', 'petition', 'supplication']
    };

    const keywords = topicKeywords[topic.toLowerCase() as keyof typeof topicKeywords] || [topic];
    const searchQuery = keywords.join(' ');
    
    const verses = await this.db.searchVerses(searchQuery, undefined, 10);
    return verses.slice(0, 3); // Return up to 3 relevant verses
  }

  private async findThemeForTopic(topic: string): Promise<TheologicalTheme> {
    const themeDescriptions: Record<string, string> = {
      'love': 'The Bible reveals that God is love, and His love is the foundation of all relationships. Divine love is sacrificial, unconditional, and transformative.',
      'faith': 'Faith is the confident trust in God\'s character and promises. It is the means by which we receive God\'s grace and live in relationship with Him.',
      'hope': 'Biblical hope is not wishful thinking but confident expectation based on God\'s faithfulness and the certainty of His promises.',
      'grace': 'Grace is God\'s unmerited favor toward humanity, providing salvation and spiritual enablement that cannot be earned through human effort.',
      'mercy': 'God\'s mercy is His compassion toward the suffering and His forgiveness toward the repentant, reflecting His loving nature.',
      'wisdom': 'True wisdom begins with the fear of the Lord and provides insight for living righteously and making godly decisions.',
      'peace': 'God\'s peace transcends circumstances and provides inner tranquility through trust in His sovereignty and goodness.',
      'joy': 'Biblical joy is deep-seated gladness rooted in God\'s presence and salvation, independent of external circumstances.',
      'patience': 'Patience is enduring hardship with grace, trusting in God\'s timing and purposes even when they are not immediately apparent.',
      'courage': 'Christian courage is not the absence of fear but the strength to do right because of faith in God\'s presence and power.',
      'forgiveness': 'Forgiveness releases others from debt and bitterness, reflecting the forgiveness we have received through Christ.',
      'humility': 'Humility is having a right view of oneself before God, recognizing dependence on Him and valuing others above self.',
      'service': 'Service is using God-given gifts to bless others and advance His kingdom, following Christ\'s example of servant leadership.',
      'worship': 'Worship is honoring God with all of life, acknowledging His worthiness and responding with love, gratitude, and obedience.',
      'prayer': 'Prayer is communion with God, involving speaking, listening, and being in His presence as the foundation of spiritual life.'
    };

    return {
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      description: themeDescriptions[topic.toLowerCase()] || `Exploring the biblical theme of ${topic}`,
      keyVerses: [],
      relatedThemes: [],
      historicalDevelopment: `The theme of ${topic} develops throughout Scripture, revealing God's character and His relationship with humanity.`
    };
  }

  private async createDevotional(
    scripture: BibleVerse[], 
    theme: TheologicalTheme, 
    date: string, 
    topic?: string
  ): Promise<Devotional> {
    const id = `devotional-${date}-${Math.random().toString(36).substr(2, 9)}`;
    const title = this.generateTitle(scripture, theme, topic);
    const reflection = await this.generateReflection(scripture, theme);
    const prayer = this.generatePrayer(scripture, theme);
    const application = this.generateApplication(scripture, theme);

    return {
      id,
      title,
      scripture,
      reflection,
      prayer,
      application,
      date,
      theme: topic || theme.name
    };
  }

  private generateTitle(scripture: BibleVerse[], theme: TheologicalTheme, topic?: string): string {
    const reference = scripture.map(v => `${v.book} ${v.chapter}:${v.verse}`).join('; ');
    const themeName = topic || theme.name;
    return `${themeName}: ${reference}`;
  }

  private async generateReflection(scripture: BibleVerse[], theme: TheologicalTheme): Promise<string> {
    const scriptureText = scripture.map(v => v.text).join(' ');
    
    const reflectionTemplates = [
      `Today's passage from ${scripture[0].book} ${scripture[0].chapter}:${scripture[0].verse} reveals profound truth about ${theme.name.toLowerCase()}. The text reminds us that "${scriptureText.substring(0, 100)}..." This speaks directly to our hearts because ${theme.description.toLowerCase()}.`,
      
      `In ${scripture[0].book} ${scripture[0].chapter}:${scripture[0].verse}, we discover a beautiful picture of ${theme.name.toLowerCase()}. The words "${scriptureText.substring(0, 80)}..." challenge us to consider how ${theme.name.toLowerCase()} transforms our daily lives and relationships.`,
      
      `The wisdom found in ${scripture[0].book} ${scripture[0].chapter}:${scripture[0].verse} offers insight into ${theme.name.toLowerCase()}. When we read "${scriptureText.substring(0, 90)}..." we are invited to experience ${theme.name.toLowerCase()} not as abstract concept but as living reality shaped by ${theme.description.toLowerCase()}.`
    ];

    const template = reflectionTemplates[Math.floor(Math.random() * reflectionTemplates.length)];
    
    return template + this.generateAdditionalReflection(scripture, theme);
  }

  private generateAdditionalReflection(scripture: BibleVerse[], theme: TheologicalTheme): string {
    const additionalInsights = [
      ` This passage invites us to reflect on how ${theme.name.toLowerCase()} manifests in our own spiritual journey. Are we fully embracing this aspect of God's character and allowing it to transform us?`,
      
      ` The context of this passage reminds us that ${theme.name.toLowerCase()} is not merely personal but has communal implications. How might our expression of ${theme.name.toLowerCase()} impact those around us?`,
      
      ` As we meditate on these words, we're challenged to consider areas where ${theme.name.toLowerCase()} may be lacking in our lives and ask God to cultivate this virtue more deeply in our hearts.`
    ];

    return additionalInsights[Math.floor(Math.random() * additionalInsights.length)];
  }

  private generatePrayer(scripture: BibleVerse[], theme: TheologicalTheme): string {
    const prayerTemplates = [
      `Heavenly Father, thank you for the truth revealed in ${scripture[0].book} ${scripture[0].chapter}:${scripture[0].verse}. I ask that you would fill me with your ${theme.name.toLowerCase()} and help me to live out this reality in my daily life. Transform my heart and mind to reflect your character more fully. In Jesus' name, Amen.`,
      
      `Lord God, as I reflect on your Word today, I recognize my need for greater ${theme.name.toLowerCase()}. Please work in me by your Holy Spirit, shaping me into the person you created me to be. Help me to share your ${theme.name.toLowerCase()} with others. Through Christ my Lord, Amen.`,
      
      `Gracious God, your Scripture speaks powerfully about ${theme.name.toLowerCase()}. I confess that I often fall short in this area, but I trust in your grace to empower me. Teach me your ways and guide me in paths of ${theme.name.toLowerCase()}. I surrender this area of my life to you. Amen.`
    ];

    return prayerTemplates[Math.floor(Math.random() * prayerTemplates.length)];
  }

  private generateApplication(scripture: BibleVerse[], theme: TheologicalTheme): string {
    const applications = [
      `Today, look for opportunities to express ${theme.name.toLowerCase()} in your interactions with others. Consider one specific relationship or situation where you can demonstrate ${theme.name.toLowerCase()} in a tangible way.`,
      
      `Take time this evening to write down three ways you have experienced ${theme.name.toLowerCase()} from God or others. Then identify one area where you can grow in expressing ${theme.name.toLowerCase()} to those around you.`,
      
      `This week, memorize ${scripture[0].book} ${scripture[0].chapter}:${scripture[0].verse} and ask God to bring it to mind in situations where ${theme.name.toLowerCase()} is needed. Share this verse with someone who might be encouraged by it.`
    ];

    return applications[Math.floor(Math.random() * applications.length)];
  }

  private getDayOfYear(dateString: string): number {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  private parseVerseReference(reference: string): { book?: string; chapter?: number; verse?: number } {
    const patterns = [
      /^(.+?)\s+(\d+):(\d+)$/,
      /^(.+?)\s+(\d+)$/,
      /^(\d+)\s+(.+?)\s+(\d+):(\d+)$/
    ];

    for (const pattern of patterns) {
      const match = reference.match(pattern);
      if (match) {
        if (pattern === patterns[2]) {
          return { book: `${match[1]} ${match[2]}`, chapter: parseInt(match[3]), verse: parseInt(match[4]) };
        } else if (pattern === patterns[0]) {
          return { book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) };
        } else {
          return { book: match[1], chapter: parseInt(match[2]) };
        }
      }
    }

    return {};
  }
}
