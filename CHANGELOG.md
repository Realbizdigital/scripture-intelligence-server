# Changelog

All notable changes to Scripture Intelligence Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-23

### Added
- Public-domain Bible corpus importer for WEB, KJV, and ASV using eBible USFM archives.
- Translation-aware SQLite reads for verse, passage, chapter, search, resource, and comparison workflows.
- Book-name normalization for common abbreviations and aliases such as Psalm/Psalms, Jn, and 1 Cor.
- MCP translation metadata resources that report loaded public-domain text and licensing notes.
- Tests for strict translation lookup, book aliases, and USFM archive parsing.

### Changed
- Default full-text translation is now WEB to keep production output public-domain by default.
- Translation comparison now uses loaded text only and no longer implies bundled copyrighted modern translations.
- Setup no longer exits after sample seed data; it proceeds to public-domain corpus import unless disabled.

## [1.0.0] - 2024-01-15

### Added
- **Natural Language Search**: Advanced NLP processing for Bible queries
- **Cross-Reference Engine**: Comprehensive cross-reference discovery across all biblical books
- **Original Language Analysis**: Hebrew and Greek word studies with Strong's numbers
- **Context-Aware Explanations**: Historical, cultural, literary, and theological context
- **Devotional Generation**: Daily, topical, and verse-based devotionals
- **Faith-Based Reasoning**: Theological answers and spiritual guidance
- **Translation Comparison**: Multi-translation analysis with theological implications
- **Semantic Search**: Concept-based verse discovery beyond keyword matching
- **Parallel Passage Detection**: Automatic identification of Gospel parallels and historical connections
- **Theological Theme Analysis**: Systematic theology framework integration
- **Historical Context Database**: Cultural and political background for biblical passages
- **Linguistic Analysis**: Deep dive into original languages with transliteration
- **MCP Integration**: Full Model Context Protocol server implementation
- **SQLite Database**: Efficient local storage with comprehensive schema
- **TypeScript Support**: Full type safety and modern development experience
- **Comprehensive Documentation**: Detailed usage examples and API reference

### Features
- **9 MCP Tools**:
  - `search_scripture`: Natural language Bible search
  - `get_verse_analysis`: Comprehensive verse analysis
  - `find_cross_references`: Cross-reference discovery
  - `generate_devotional`: Devotional creation
  - `explain_original_language`: Hebrew/Greek word studies
  - `compare_translations`: Translation comparison
  - `faith_reasoning`: Theological Q&A
  - `explain_doctrine`: Doctrine explanations
  - `get_historical_context`: Historical background

### Data Sources
- **Bible Translations**: ESV, NIV, KJV support
- **Strong's Concordance**: Complete Hebrew and Greek lexicon
- **Cross-Reference Database**: Comprehensive biblical connections
- **Historical Data**: Cultural and political context information
- **Theological Framework**: Systematic theology integration

### Configuration
- **Flexible Settings**: Configurable features and performance options
- **Environment Support**: Environment variable configuration
- **Database Options**: Custom database path and settings
- **Feature Toggles**: Enable/disable specific capabilities

### Documentation
- **README**: Comprehensive setup and usage guide
- **API Reference**: Complete tool documentation
- **Examples**: Detailed usage examples
- **Installation Guide**: Step-by-step setup instructions
- **Configuration Guide**: Customization options

### Development
- **TypeScript**: Full type safety
- **Build System**: Automated compilation and testing
- **Code Quality**: ESLint and Prettier configuration
- **Sample Data**: Database setup scripts with sample content

## [Unreleased]

### Planned
- **More Translations**: Additional Bible translation support
- **Enhanced Search**: Fuzzy search and semantic matching improvements
- **Audio Support**: Text-to-speech for devotionals
- **Mobile App**: Native mobile applications
- **Web Interface**: Browser-based study tool
- **API Server**: REST API for web integration
- **Cloud Sync**: Cross-device synchronization
- **Study Plans**: Structured Bible reading plans
- **Commentary Integration**: Historical commentary sources
- **Maps Integration**: Biblical geography and maps
- **Timeline Features**: Historical timeline visualization

### Potential Enhancements
- **AI-Powered Insights**: Enhanced theological analysis
- **Community Features**: Study groups and sharing
- **Advanced Analytics**: Reading progress and insights
- **Multi-language Support**: International language interfaces
- **Accessibility Features**: Screen reader and visual impairment support
- **Performance Optimizations**: Caching and indexing improvements

---

## Version History

### 1.0.0-alpha (2024-01-10)
- Initial development release
- Core architecture implementation
- Basic database schema
- MCP server framework

### 1.0.0-beta (2024-01-12)
- Feature completion
- Documentation draft
- Testing and bug fixes
- Performance optimization

### 1.0.0-rc (2024-01-14)
- Release candidate
- Final testing
- Documentation completion
- Production readiness

---

## Support

For bug reports, feature requests, or questions:
- **GitHub Issues**: [repository issues]
- **Documentation**: [repository wiki]
- **Community**: [discussion forum]

## Theological Perspective

This server approaches Scripture from a conservative evangelical perspective, committed to:
- Biblical inerrancy and divine inspiration
- Historical-grammatical hermeneutics
- Theological coherence and unity
- Practical application of biblical truth
- Respect for church tradition and scholarship

All features are designed to support serious Bible study, theological research, and spiritual growth while maintaining academic rigor and faithfulness to Christian orthodoxy.
