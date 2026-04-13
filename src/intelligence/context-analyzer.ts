import { BibleVerse, HistoricalContext, LinguisticAnalysis } from '../types/index.js';
import { BibleDatabase } from '../database/bible-data.js';

export class ContextAnalyzer {
  private db: BibleDatabase;

  constructor(db: BibleDatabase) {
    this.db = db;
  }

  async analyzeContext(verse: BibleVerse): Promise<{
    historical: HistoricalContext | null;
    linguistic: LinguisticAnalysis[];
    cultural: string;
    literary: string;
    theological: string;
  }> {
    const historical = await this.db.getHistoricalContext(verse.book, verse.chapter);
    const linguistic = await this.db.getLinguisticAnalysis(verse.book, verse.chapter, verse.verse);
    const cultural = this.analyzeCulturalContext(verse);
    const literary = this.analyzeLiteraryContext(verse);
    const theological = this.analyzeTheologicalContext(verse);

    return {
      historical,
      linguistic,
      cultural,
      literary,
      theological
    };
  }

  private analyzeCulturalContext(verse: BibleVerse): string {
    const culturalContexts: Record<string, string> = {
      'genesis': 'Genesis is set in the ancient Near East during the patriarchal period. It reflects nomadic and early agricultural societies, with themes of family dynamics, covenant relationships, and the origins of the Israelite people.',
      'exodus': 'Exodus depicts the Israelites\' liberation from Egyptian slavery and their journey toward the Promised Land. It reflects ancient Egyptian culture, wilderness wandering, and the formation of Israelite identity and religious practices.',
      'leviticus': 'Leviticus focuses on priestly laws and rituals in the context of the tabernacle worship system. It reflects ancient Israelite religious practices, purity codes, and sacrificial system common to ancient Near Eastern cultures.',
      'numbers': 'Numbers covers the Israelites\' wilderness period, including census-taking, tribal organization, and challenges of nomadic life. It reflects the difficulties of maintaining community identity and faith during prolonged transition.',
      'deuteronomy': 'Deuteronomy presents Moses\' final speeches before entering Canaan, emphasizing covenant faithfulness. It reflects ancient treaty language and the importance of law transmission for community identity.',
      'joshua': 'Joshua describes the conquest of Canaan, reflecting ancient warfare, city-state politics, and the challenges of establishing a new society in a foreign land.',
      'judges': 'Judges covers the period of Israel\'s tribal confederation before monarchy, reflecting cycles of sin, oppression, and deliverance common to ancient Near Eastern societies.',
      'ruth': 'Ruth is set during the judges\' period, reflecting ancient Near Eastern customs of marriage, redemption, and family loyalty in the context of harvest and agricultural life.',
      '1 samuel': '1 Samuel covers Israel\'s transition from judgeship to monarchy, reflecting ancient political structures and the challenges of establishing royal authority.',
      '2 samuel': '2 Samuel depicts David\'s reign, reflecting ancient monarchy, court politics, and the establishment of Jerusalem as political and religious center.',
      '1 kings': '1 Kings covers the united monarchy under Solomon and its division, reflecting ancient royal administration, temple building, and political fragmentation.',
      '2 kings': '2 Kings continues the history of divided kingdoms, reflecting ancient Near Eastern politics, warfare, and the eventual exile of Israel and Judah.',
      '1 chronicles': '1 Chronicles presents a priestly perspective on Israel\'s history, emphasizing temple worship and Davidic dynasty in the context of post-exilic community restoration.',
      '2 chronicles': '2 Chronicles continues the priestly history, focusing on temple reforms and the relationship between faithfulness and national prosperity.',
      'ezra': 'Ezra describes the return from exile and temple rebuilding, reflecting Persian imperial policy and the challenges of re-establishing Jewish identity and religious practices.',
      'nehemiah': 'Nehemiah focuses on Jerusalem\'s reconstruction, reflecting ancient city-building, community organization, and the importance of physical and spiritual restoration.',
      'esther': 'Esther is set in the Persian diaspora, reflecting Jewish life in exile, court politics, and divine providence working through seemingly ordinary circumstances.',
      'job': 'Job explores the problem of suffering in the context of ancient Near Eastern wisdom literature, reflecting on divine sovereignty and human righteousness.',
      'psalms': 'Psalms represents ancient Israelite worship poetry, reflecting various life situations, communal and individual prayer, and the full range of human emotions in relationship to God.',
      'proverbs': 'Proverbs belongs to ancient Near Eastern wisdom literature, reflecting practical guidance for living in accordance with divine wisdom and social harmony.',
      'ecclesiastes': 'Ecclesiastes reflects philosophical inquiry into life\'s meaning from an ancient Near Eastern perspective, questioning conventional wisdom and exploring existential themes.',
      'song of solomon': 'Song of Solomon celebrates love and marriage in the context of ancient Near Eastern poetry, reflecting human relationships as a metaphor for divine love.',
      'isaiah': 'Isaiah addresses Judah during the Assyrian crisis, reflecting ancient Near Eastern politics, prophecy, and the vision of God\'s universal sovereignty.',
      'jeremiah': 'Jeremiah prophesied during Judah\'s final years before exile, reflecting the trauma of national collapse and the hope for divine restoration.',
      'lamentations': 'Lamentations mourns Jerusalem\'s destruction, reflecting ancient Near Eastern lament traditions and the processing of national tragedy.',
      'ezekiel': 'Ezekiel prophesied to exiles in Babylon, reflecting diaspora experience, visionary literature, and the reimagining of divine presence outside the temple.',
      'daniel': 'Daniel is set in the Babylonian and Persian courts, reflecting Jewish life in imperial service, apocalyptic literature, and faith under foreign domination.',
      'matthew': 'Matthew presents Jesus as the fulfillment of Jewish prophecy, reflecting first-century Jewish Christianity and the tension between Jewish tradition and the new messianic movement.',
      'mark': 'Mark portrays Jesus as the suffering servant, reflecting the challenges of early Christian identity in the context of Roman persecution and Jewish opposition.',
      'luke': 'Luke emphasizes Jesus\' concern for the marginalized, reflecting Hellenistic Christianity and the universal scope of the gospel message.',
      'john': 'John presents high Christology reflecting developed theological understanding of Jesus\' divine nature in the context of early Christian worship and identity formation.',
      'acts': 'Acts describes the early church\'s expansion, reflecting the transition from Jewish to Gentile Christianity and the challenges of maintaining unity amid diversity.',
      'romans': 'Romans presents systematic theology reflecting the challenges of Jewish-Gentile Christian relations and the articulation of gospel truth in Hellenistic context.',
      '1 corinthians': '1 Corinthians addresses problems in a cosmopolitan urban church, reflecting the challenges of Christian life in a pagan, socially stratified environment.',
      '2 corinthians': '2 Corinthians reflects Paul\'s pastoral relationship with a troubled church, addressing issues of authority, suffering, and authentic Christian ministry.',
      'galatians': 'Galatians defends justification by faith, reflecting the early church\'s struggle with Jewish-Gentile relations and the nature of Christian freedom.',
      'ephesians': 'Ephesians presents the cosmic significance of Christ, reflecting developed understanding of the church as the body of Christ in Hellenistic context.',
      'philippians': 'Philippians reflects joy in suffering and Christian partnership, reflecting the challenges of maintaining faith amid opposition and persecution.',
      'colossians': 'Colossians combats heretical influences, reflecting the early church\'s struggle to define orthodox Christology in the face of syncretistic pressures.',
      '1 thessalonians': '1 Thessalonians addresses eschatological concerns, reflecting early Christian expectations of Christ\'s return and the challenges of waiting faithfully.',
      '2 thessalonians': '2 Thessalonians corrects eschatological misunderstandings, reflecting the need to balance present faithfulness with future hope.',
      '1 timothy': '1 Timothy provides church leadership guidance, reflecting the challenges of establishing order and orthodoxy in developing Christian communities.',
      '2 timothy': '2 Timothy encourages faithfulness amid persecution, reflecting the challenges of maintaining Christian witness in hostile environments.',
      'titus': 'Titus addresses church organization in Crete, reflecting the challenges of Christian life in a morally challenging cultural environment.',
      'philemon': 'Philemon addresses master-slave relationships in Christ, reflecting the radical social implications of the gospel in the ancient world.',
      'hebrews': 'Hebrews presents Christ as superior to Judaism, reflecting the challenges of Jewish Christians maintaining faith amid pressure to return to traditional religion.',
      'james': 'James emphasizes practical faith, reflecting the challenges of authentic Christian living and the dangers of mere intellectual assent.',
      '1 peter': '1 Peter encourages faithfulness amid suffering, reflecting the challenges of Christian witness in a hostile pagan society.',
      '2 peter': '2 Peter combats false teaching, reflecting the early church\'s struggle to maintain orthodoxy amid diverse interpretations.',
      '1 john': '1 John emphasizes love and orthodoxy, reflecting the challenges of maintaining both correct belief and right practice in Christian community.',
      '2 john': '2 John warns against false teachers, reflecting the need to balance hospitality with doctrinal integrity.',
      '3 john': '3 John addresses church leadership issues, reflecting the challenges of authority and relationships in early Christian communities.',
      'jude': 'Jude warns against apostasy, reflecting the early church\'s struggle against internal and external threats to true faith.',
      'revelation': 'Revelation uses apocalyptic imagery to encourage persecuted Christians, reflecting the ultimate triumph of Christ amid present suffering.'
    };

    return culturalContexts[verse.book.toLowerCase()] || 
           'This passage reflects ancient Near Eastern cultural context, with values, social structures, and worldview that differ significantly from modern Western culture.';
  }

  private analyzeLiteraryContext(verse: BibleVerse): string {
    const literaryTypes: Record<string, string> = {
      'genesis': 'Genesis combines historical narrative, genealogy, and covenant theology. It uses chiastic structures, repetition, and typology to convey theological meaning through historical events.',
      'exodus': 'Exodus combines narrative, law, and covenant theology. It uses plagues as literary devices, employs parallel structure in the Ten Commandments, and uses journey motifs to represent spiritual pilgrimage.',
      'leviticus': 'Leviticus is primarily legal and priestly literature, using detailed regulations, numerical symbolism, and ritual language to convey concepts of holiness and divine presence.',
      'numbers': 'Numbers combines narrative, census material, and legal sections. It uses journey motifs, numerical symbolism, and contrast between faithfulness and rebellion.',
      'deuteronomy': 'Deuteronomy uses suzerain-vassal treaty format, employs chiastic structure, and uses repetition and parallelism to emphasize covenant faithfulness.',
      'joshua': 'Joshua is conquest narrative using division formulas, geographical markers, and theological interpretation of military events to demonstrate divine faithfulness.',
      'judges': 'Judges uses cyclical narrative structure, employs irony and contrast, and uses individual stories to illustrate national spiritual patterns.',
      'ruth': 'Ruth is a short story using character development, dialogue, and irony to explore themes of loyalty and divine providence in ordinary life.',
      '1 samuel': '1 Samuel combines narrative, biography, and transition motifs. It uses contrast between characters and divine speech to explore leadership and divine calling.',
      '2 samuel': '2 Samuel uses court narrative, employs irony and tragedy, and uses poetry to explore the complexities of human leadership and divine sovereignty.',
      '1 kings': '1 Kings uses royal chronicle format, employs parallel structure in describing kings, and uses temple dedication as theological climax.',
      '2 kings': '2 Kings continues royal chronicle tradition, uses prophetic narrative, and employs repetition to emphasize patterns of faithfulness and judgment.',
      '1 chronicles': '1 Chronicles uses priestly perspective, employs genealogies and speeches, and emphasizes temple worship and Davidic dynasty.',
      '2 chronicles': '2 Chronicles uses parallel structure with Kings, emphasizes reform movements, and employs cause-effect theology regarding faithfulness.',
      'ezra': 'Ezra uses memoir format, employs lists and documents, and emphasizes restoration and covenant renewal in post-exilic context.',
      'nehemiah': 'Nehemiah uses memoir and narrative, employs dialogue and prayer, and emphasizes leadership and community building.',
      'esther': 'Esther uses narrative irony, employs banquet scenes and reversals, and demonstrates divine providence through seemingly secular events.',
      'job': 'Job is wisdom literature using dialogue, poetic monologues, and cosmic drama to explore the problem of suffering and divine sovereignty.',
      'psalms': 'Psalms is poetry using parallelism, imagery, and musical structure. It employs various genres including lament, praise, thanksgiving, and wisdom.',
      'proverbs': 'Proverbs is wisdom literature using parallelism, metaphor, and aphoristic sayings to convey practical and theological wisdom.',
      'ecclesiastes': 'Ecclesiastes uses philosophical reflection, employs repetition and contrast, and uses autobiographical narrative to explore life\'s meaning.',
      'song of solomon': 'Song of Solomon is love poetry using dialogue, metaphor, and sensory imagery to celebrate human and divine love.',
      'isaiah': 'Isaiah combines prophecy, narrative, and apocalyptic literature. It uses oracles, visions, and poetic imagery to convey messages of judgment and hope.',
      'jeremiah': 'Jeremiah uses prophetic oracles, laments, and narrative. It employs symbolic actions and personal reflection to convey prophetic message.',
      'lamentations': 'Lamentations uses acrostic structure, employs funeral dirge language, and uses poetic imagery to process national tragedy.',
      'ezekiel': 'Ezekiel uses apocalyptic visions, symbolic actions, and structured prophecy to convey messages of judgment and restoration.',
      'daniel': 'Daniel combines court narratives and apocalyptic visions, uses symbolic imagery, and employs contrast between earthly kingdoms and divine kingdom.',
      'matthew': 'Matthew uses gospel format, employs fulfillment quotations, and structures teaching material into five major discourses.',
      'mark': 'Mark uses fast-paced narrative, employs irony and secrecy motifs, and emphasizes action over teaching to portray Jesus as suffering servant.',
      'luke': 'Luke uses orderly narrative, employs parables and journey motifs, and emphasizes Jesus\' concern for marginalized people.',
      'john': 'John uses theological narrative, employs symbolism and irony, and uses \"I am\" sayings and signs to present high Christology.',
      'acts': 'Acts uses historical narrative, employs speech summaries, and uses geographical expansion to demonstrate church growth.',
      'romans': 'Romans uses logical argumentation, employs diatribe style, and systematically presents gospel theology.',
      '1 corinthians': '1 Corinthians uses letter format, employs rhetorical questions, and addresses specific church problems with theological solutions.',
      '2 corinthians': '2 Corinthians uses personal letter style, employs autobiographical elements, and defends authentic ministry.',
      'galatians': 'Galatians uses argumentative letter, employs rhetorical questions, and passionately defends justification by faith.',
      'ephesians': 'Ephesians uses theological letter, employs cosmic language, and presents the church as Christ\'s body.',
      'philippians': 'Philippians uses personal letter, employs joy language, and emphasizes partnership in the gospel.',
      'colossians': 'Colossians uses theological letter, employs hymns and poetry, and presents Christ\'s supremacy.',
      '1 thessalonians': '1 Thessalonians uses pastoral letter, employs eschatological language, and encourages Christian living.',
      '2 thessalonians': '2 Thessalonians uses corrective letter, employs apocalyptic language, and clarifies end-times teaching.',
      '1 timothy': '1 Timothy uses pastoral letter, employs church order language, and provides leadership guidance.',
      '2 timothy': '2 Timothy uses personal letter, employs farewell discourse, and encourages faithful ministry.',
      'titus': 'Titus uses pastoral letter, employs church organization language, and addresses cultural challenges.',
      'philemon': 'Philemon uses personal letter, employs appeal language, and demonstrates Christian social transformation.',
      'hebrews': 'Hebrews uses theological discourse, employs argument from superiority, and presents Christ as fulfillment of Judaism.',
      'james': 'James uses wisdom literature format, employs practical imperatives, and emphasizes living faith.',
      '1 peter': '1 Peter uses circular letter, employs suffering language, and encourages Christian witness.',
      '2 peter': '2 Peter uses warning letter, employs eschatological language, and defends apostolic teaching.',
      '1 john': '1 John uses theological letter, employs test language, and emphasizes love and orthodoxy.',
      '2 john': '2 John uses personal letter, employs hospitality language, and warns against false teachers.',
      '3 john': '3 John uses personal letter, employs leadership language, and addresses church relationships.',
      'jude': 'Jude uses warning letter, employs apocalyptic imagery, and warns against apostasy.',
      'revelation': 'Revelation uses apocalyptic literature, employs symbolic imagery, and encourages persecuted Christians through visionary prophecy.'
    };

    return literaryTypes[verse.book.toLowerCase()] || 
           'This passage uses biblical literary forms appropriate to its genre and historical context, employing the literary conventions of its time to convey theological truth.';
  }

  private analyzeTheologicalContext(verse: BibleVerse): string {
    const theologicalThemes: Record<string, string> = {
      'genesis': 'Genesis introduces foundational theological themes including creation, divine sovereignty, human sin, covenant relationship, and the beginning of redemption history.',
      'exodus': 'Exodus develops themes of liberation, divine presence, covenant law, and the formation of God\'s people as a holy nation.',
      'leviticus': 'Leviticus emphasizes holiness, atonement, sacrificial system, and the concept of God dwelling among His people.',
      'numbers': 'Numbers highlights themes of divine guidance, human faithfulness, rebellion, and the consequences of obedience and disobedience.',
      'deuteronomy': 'Deuteronomy stresses covenant faithfulness, law as life, the choice between blessing and cursing, and the importance of teaching future generations.',
      'joshua': 'Joshua emphasizes God\'s faithfulness to promises, holy war, inheritance, and the importance of complete obedience.',
      'judges': 'Judges illustrates the cycle of sin-judgment-deliverance, the need for righteous leadership, and God\'s patience with human failure.',
      'ruth': 'Ruth demonstrates divine providence, covenant loyalty, redemption, and God\'s work through ordinary people and circumstances.',
      '1 samuel': '1 Samuel explores themes of divine calling, human leadership, the cost of disobedience, and the establishment of monarchy.',
      '2 samuel': '2 Samuel examines Davidic covenant, the complexity of human leadership, sin\'s consequences, and divine mercy.',
      '1 kings': '1 Kings contrasts faithful and unfaithful leadership, temple dedication, and the division of the kingdom.',
      '2 kings': '2 Kings demonstrates prophetic ministry, covenant violation, and the ultimate judgment leading to exile.',
      '1 chronicles': '1 Chronicles emphasizes temple worship, Davidic dynasty, and the priestly perspective on Israel\'s history.',
      '2 chronicles': '2 Chronicles highlights reform movements, the relationship between faithfulness and blessing, and temple centrality.',
      'ezra': 'Ezra focuses on restoration, covenant renewal, the importance of Scripture, and rebuilding community identity.',
      'nehemiah': 'Nehemiah emphasizes leadership, prayer, community building, and the combination of spiritual and practical restoration.',
      'esther': 'Esther demonstrates divine providence in exile, courage under pressure, and God\'s sovereignty through seemingly secular events.',
      'job': 'Job explores the problem of suffering, divine sovereignty, human limitations, and the mystery of divine wisdom.',
      'psalms': 'Psalms express the full range of human experience in relationship to God, including praise, lament, thanksgiving, and wisdom.',
      'proverbs': 'Proverbs presents practical wisdom, the fear of the Lord as beginning of wisdom, and the contrast between wisdom and folly.',
      'ecclesiastes': 'Ecclesiastes questions life\'s meaning, explores the limitations of human achievement, and points to the fear of God as life\'s purpose.',
      'song of solomon': 'Song of Solomon celebrates divine love through human marriage imagery, exploring the depth and beauty of committed love.',
      'isaiah': 'Isaiah presents God\'s holiness, judgment, salvation, and the coming of the suffering servant and conquering king.',
      'jeremiah': 'Jeremiah emphasizes covenant violation, prophetic suffering, the promise of new covenant, and hope beyond judgment.',
      'lamentations': 'Lamentations processes grief, acknowledges divine justice, expresses hope in God\'s mercy, and models honest lament.',
      'ezekiel': 'Ezekiel emphasizes divine glory, individual responsibility, restoration hope, and God\'s presence beyond the temple.',
      'daniel': 'Daniel highlights God\'s sovereignty over human kingdoms, faith under pressure, apocalyptic hope, and divine control of history.',
      'matthew': 'Matthew presents Jesus as fulfillment of prophecy, the inaugurated kingdom, and the church as the new Israel.',
      'mark': 'Mark portrays Jesus as suffering servant, the cost of discipleship, and the kingdom as present reality with future consummation.',
      'luke': 'Luke emphasizes Jesus as savior of all people, the role of the Holy Spirit, and concern for the poor and marginalized.',
      'john': 'John presents high Christology, eternal life through Christ, the new birth, and the unity of Father and Son.',
      'acts': 'Acts demonstrates the Spirit\'s power, church expansion, Gentile inclusion, and the gospel\'s advance to the ends of the earth.',
      'romans': 'Romans systematically presents justification by faith, the problem of sin, salvation history, and Christian ethics.',
      '1 corinthians': '1 Corinthians addresses church problems, Christian wisdom, resurrection hope, and love as the greatest virtue.',
      '2 corinthians': '2 Corinthians contrasts earthly and eternal glory, authentic ministry, and divine strength in human weakness.',
      'galatians': 'Galatians defends justification by faith, Christian freedom, the work of the Spirit, and unity in Christ.',
      'ephesians': 'Ephesians presents cosmic reconciliation, the church as Christ\'s body, spiritual warfare, and Christian unity.',
      'philippians': 'Philippians emphasizes joy in suffering, Christ\'s humility, partnership in the gospel, and contentment in Christ.',
      'colossians': 'Colossians presents Christ\'s supremacy, complete salvation in Christ, freedom from human regulations, and new life in Christ.',
      '1 thessalonians': '1 Thessalonians addresses holy living, eschatological hope, the second coming, and Christian community.',
      '2 thessalonians': '2 Thessalonians clarifies end-times events, encourages perseverance, and warns against idleness.',
      '1 timothy': '1 Timothy provides church order, false teaching correction, leadership qualifications, and practical godliness.',
      '2 timothy': '2 Timothy encourages faithful ministry, suffering for the gospel, Scripture\'s inspiration, and finishing well.',
      'titus': 'Titus emphasizes church organization, godly leadership, sound doctrine, and Christian social responsibility.',
      'philemon': 'Philemon demonstrates Christian brotherhood, social transformation, forgiveness, and reconciliation in Christ.',
      'hebrews': 'Hebrews presents Christ\'s superiority, the new covenant, perseverance in faith, and the superiority of Christianity.',
      'james': 'James emphasizes practical faith, controlling the tongue, wisdom from above, and the relationship between faith and works.',
      '1 peter': '1 Peter addresses suffering, Christian identity, holy living, and hope amid persecution.',
      '2 peter': '2 Peter warns against false teaching, encourages spiritual growth, affirms the second coming, and defends apostolic authority.',
      '1 john': '1 John emphasizes love as evidence of salvation, assurance of salvation, correct belief, and walking in the light.',
      '2 john': '2 John balances hospitality and truth, warns against deceivers, and emphasizes obedience to Christ\'s commands.',
      '3 john': '3 John addresses church leadership, hospitality to missionaries, and contrasts good and bad examples.',
      'jude': 'Jude warns against apostasy, encourages contending for the faith, presents examples of judgment, and affirms divine protection.',
      'revelation': 'Revelation uses apocalyptic imagery to encourage persecuted Christians, present Christ\'s ultimate victory, and assure divine justice.'
    };

    return theologicalThemes[verse.book.toLowerCase()] || 
           'This passage contributes to the Bible\'s overarching theological message of God\'s redemptive work through Christ and the establishment of His kingdom.';
  }
}
