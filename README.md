# Chronicler - Distance Calculation Application

A professional tool for reconciling historical records through precise distance calculations between two lists of location IDs.

📚 **[Architecture Documentation](./ARCHITECTURE.md)** | 🔧 **[Development Pipeline](./PIPELINE.md)**

## What is Chronicler?

Chronicler calculates the **Manhattan distance** between two lists of numbers. Simply upload a text file with two columns of numbers, and get the total distance plus a detailed breakdown. This serves as a data quality metric, measuring how much two data sources differ when properly aligned.

**Example**: Lists `[3,4,2,1,3,3]` and `[4,3,5,3,9,3]` → Total Distance: **11**

## Quick Start

### For Non-Technical Users (SeniorChroniclerElf)

1. **Clone or Download**: Get the application files to your computer
2. **Install Dependencies**: Open terminal/command prompt and run:
   ```bash
   npm install
   ```
3. **Start the Application**: Run:
   ```bash
   npm start
   ```
4. **Open in Browser**: Go to http://localhost:3000
5. **Use the Application**: Upload your file and get results!

### For Developers (Pip Proudfoot)

```bash
# Clone repository
git clone [repository-url]
cd chronicler-app

# Install dependencies
npm install

# Start development servers
npm run frontend:start    # Frontend (port 3000)
npm run backend:dev      # Backend (port 3001)

# Run tests
npm test                 # All tests
npm run test:coverage    # With coverage report
```

## Using the Application

### 1. Prepare Your File

Create a text file with **two columns of numbers**:

```
3 4
2 5
1 3
3 9
3 3
```

- **Format**: Two numbers per line, separated by space or tab
- **File Type**: Plain text (.txt) files work best
- **Size Limit**: Up to 10MB files supported

### 2. Upload and Calculate

1. **Choose File**: Click "Choose File" or drag and drop your file
2. **Validation**: Application will verify your file format
3. **Calculate**: Click "Calculate Distance" button
4. **View Results**: See total distance and detailed breakdown

### 3. Understand Results

- **Total Distance**: Sum of all individual distances
- **Pair Breakdown**: Shows how each pair contributes to total
- **Processing Info**: Time taken and technical details

### 4. Export Results

- **CSV Format**: Download for spreadsheet analysis
- **JSON Format**: Download for technical integration

## Language Support

> **📜 Important Note on Language Design**  
> Chronicler was built with **Sindarin Elvish as the primary language**, reflecting its principal users: the scholarly Elvish community who maintain historical records with meticulous precision. The **English interface** was added as a gesture of friendship during the Festival of Understanding, honoring the long-standing alliance between Elves and Hobbits. This bilingual design is intentional, celebrating both cultural heritage and practical collaboration.

### Default: Sindarin Elvish Interface

The application defaults to **Sindarin Elvish** with Tengwar script, designed for scholarly elvish users.

- **Scholarly Tone**: Professional language appropriate for historical work
- **Tengwar Script**: Beautiful elvish writing system
- **Cultural Context**: Respects elvish traditions and methodology

### Alternative: English Interface

Click **"Hobbit (English)"** to switch to clear English interface.

- **Professional Clarity**: Straightforward, business-appropriate language
- **Cultural Neutrality**: No cultural references that might confuse
- **Practical Focus**: Get work done efficiently

**Language Preference**: Your choice is remembered for future visits.

## How It Works

### The Algorithm

1. **Parse Input**: Extract two lists from your file
2. **Sort Lists**: Sort each list independently (smallest to largest)
3. **Pair by Position**: Match items by their position after sorting
4. **Calculate Distance**: Find Manhattan distance |a - b| for each pair
5. **Sum Total**: Add all individual distances together

### Example Walkthrough

**Input Lists**: [3,4,2,1,3,3] and [4,3,5,3,9,3]

**After Sorting**: [1,2,3,3,3,4] and [3,3,3,4,5,9]

**Pairing and Distances**:
- Position 0: |1 - 3| = 2
- Position 1: |2 - 3| = 1  
- Position 2: |3 - 3| = 0
- Position 3: |3 - 4| = 1
- Position 4: |3 - 5| = 2
- Position 5: |4 - 9| = 5

**Total Distance**: 2 + 1 + 0 + 1 + 2 + 5 = **11**

## For Developers

### Project Structure

```
chronicler-app/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API communication
│   │   ├── contexts/        # Language and state management
│   │   ├── i18n/           # Sindarin/English translations
│   │   └── utils/          # Validation and utilities
│   └── public/             # Static assets
├── backend/                 # Node.js TypeScript API
│   ├── src/
│   │   ├── services/       # Distance calculation engine
│   │   ├── controllers/    # HTTP request handling
│   │   ├── middleware/     # Validation and security
│   │   └── utils/          # Backend utilities
│   └── tests/              # Comprehensive test suite
└── e2e/                    # End-to-end tests
```

### Available Scripts

#### Development
```bash
npm install                  # Install all dependencies
npm start                   # Start both frontend and backend
npm run frontend:start      # Start React dev server (port 3000)
npm run backend:dev         # Start backend with ts-node (port 3001)
```

#### Building and Testing
```bash
npm run frontend:build      # Build production bundle
npm run frontend:test       # Run frontend tests
npm run backend:test        # Run backend tests
npm test                    # Run all tests
npm run test:coverage       # Generate coverage report
npm run test:e2e           # Run end-to-end tests
```

#### Code Quality
```bash
npm run lint               # Check code style
npm run typecheck          # TypeScript type checking
npm run format             # Format code with Prettier
```

#### API Documentation
```bash
npm run backend:swagger     # Generate API documentation
npm run backend:docs:serve  # Serve documentation locally
```

### API Documentation

The Chronicler API provides comprehensive Swagger/OpenAPI documentation for all endpoints.

#### Interactive Documentation

When the backend is running, visit:
- **Interactive Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI JSON**: http://localhost:3001/api/docs.json

#### Generate Documentation Locally

```bash
cd backend
npm run docs:generate       # Creates docs/ directory with HTML and JSON
```

The generated documentation includes:
- Complete endpoint descriptions
- Request/response schemas with examples
- Error handling documentation
- Interactive API testing interface

#### API Endpoints Overview

#### POST /api/distance/calculate

Calculate Manhattan distance between two lists.

**Request Body:**
```json
{
  "list1": [3, 4, 2, 1, 3, 3],
  "list2": [4, 3, 5, 3, 9, 3]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDistance": 11,
    "pairs": [
      { "position": 0, "list1Value": 1, "list2Value": 3, "distance": 2 },
      { "position": 1, "list1Value": 2, "list2Value": 3, "distance": 1 }
    ],
    "metadata": {
      "originalList1Length": 6,
      "originalList2Length": 6,
      "processingTimeMs": 2.4
    }
  }
}
```

#### POST /api/upload

Upload and validate file with two-column data.

**Request**: Multipart form with file upload

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "data.txt",
    "parsedLists": {
      "list1": [3, 4, 2, 1, 3, 3],
      "list2": [4, 3, 5, 3, 9, 3]
    },
    "validation": {
      "isValid": true,
      "errors": []
    }
  }
}
```

#### GET /api/health

Check service health and performance metrics.

### Technology Stack

#### Frontend
- **React 19** with TypeScript
- **React-i18next** for multi-language support
- **Custom CSS** with responsive design
- **Comprehensive testing** with Jest and React Testing Library

#### Backend
- **Node.js** with TypeScript
- **Express** framework
- **Multer** for file upload handling
- **Comprehensive validation** and error handling

#### Testing Framework
- **Jest** for unit and integration tests
- **React Testing Library** for component testing
- **Playwright** for end-to-end testing
- **Performance benchmarking** and memory usage validation

### Performance Characteristics

- **Algorithm Complexity**: O(n log n) time, O(n) space
- **Small Datasets (100 items)**: <10ms processing
- **Medium Datasets (1,000 items)**: <50ms processing
- **Large Datasets (10,000 items)**: <500ms processing
- **Very Large Datasets (100,000 items)**: <5s processing

### Quality Standards

- **Test Coverage**: >90% on core calculation logic, >85% overall
- **Accessibility**: WCAG AA compliant
- **Performance**: <2s mobile load time
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: Responsive design for all screen sizes

## Project Philosophy & Development Approach

### Why Elves? A Note on Design Philosophy

The Chronicler application embodies a unique approach to software design by embracing the perspective of its primary users: the Elvish archivists and historians. This choice reflects several key principles:

1. **User-Centric Design**: Rather than creating a generic tool, Chronicler was designed specifically for those who value precision, scholarly rigor, and cultural heritage in their work.

2. **Cultural Respect**: By defaulting to Sindarin with Tengwar script, we honor the traditions and preferences of our primary user base while maintaining accessibility through the English option.

3. **Narrative-Driven Development**: The application's features and interface reflect the actual workflows and values of historical record-keeping, making it intuitive for its intended audience.

### Development Approach

This application was developed using **Claude Code** with a custom Context Engineering framework that emphasizes:

- **Systematic Development**: Using a comprehensive workflow system with 27 specialized commands
- **Quality-First Approach**: Test-driven development with persona validation
- **AI-Assisted Engineering**: Leveraging Claude's capabilities for consistent, high-quality implementation

The development methodology shares similarities with frameworks like [SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework), focusing on structured AI collaboration for complex software projects.

### A Note from the Developer

I hope you have as much fun exploring and running this application as I had creating it! The blend of technical challenge, cultural storytelling, and systematic development made this project a joy to work on. Whether you're examining the algorithm implementation, enjoying the bilingual interface, or appreciating the comprehensive testing suite, I trust you'll find something that brings a smile to your face.

May your calculations be swift and your records ever accurate! 🧝‍♂️📊

## Troubleshooting

### Common Issues

#### "File format not recognized"
- **Cause**: File doesn't contain two columns of numbers
- **Solution**: Ensure each line has exactly two numbers separated by space or tab
- **Example**: Change `1,2,3` to `1 2` and `3 4` on separate lines

#### "Lists must have equal length"  
- **Cause**: Different number of rows in each column
- **Solution**: Check that every line has exactly two numbers
- **Tip**: Empty lines or lines with only one number cause this error

#### "Upload button not responding"
- **Cause**: File validation in progress or JavaScript disabled
- **Solution**: Wait for validation to complete, ensure JavaScript is enabled
- **Alternative**: Try refreshing the page and uploading again

#### "Calculation taking too long"
- **Cause**: Very large dataset (>100,000 items)
- **Solution**: Check file size, consider splitting large files
- **Performance**: Files with >50,000 rows may take several seconds

#### "Results not displaying"
- **Cause**: Network connectivity or server issue
- **Solution**: Check internet connection, refresh page, try again
- **Alternative**: Use browser developer tools to check for error messages

#### "Language toggle not working"
- **Cause**: Browser cache or JavaScript issue
- **Solution**: Clear browser cache, refresh page
- **Note**: Language preference is stored locally and persists between visits

### Browser Requirements

- **Minimum**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **JavaScript**: Must be enabled
- **Cookies**: Required for language preference storage
- **File Upload**: Must allow file system access

### File Requirements

- **Format**: Plain text (.txt) files preferred
- **Structure**: Two columns of numbers, space or tab separated
- **Size**: Maximum 10MB file size
- **Encoding**: UTF-8 text encoding
- **Numbers**: Integer or decimal numbers supported

### Getting Help

1. **Check this README**: Most questions are answered here
2. **Review Error Messages**: Application provides specific guidance
3. **Test with Simple File**: Try with a small, known-good file first
4. **Browser Console**: Check for technical error messages (F12 key)
5. **File Format**: Verify your file matches the required format exactly

## Contributing

### Development Setup

1. **Fork Repository**: Create your own copy
2. **Clone Locally**: `git clone [your-fork-url]`
3. **Install Dependencies**: `npm install`
4. **Create Branch**: `git checkout -b feature/your-feature`
5. **Make Changes**: Implement your improvements
6. **Test Changes**: `npm test` and `npm run test:e2e`
7. **Submit Pull Request**: With clear description of changes

### Contribution Guidelines

- **Test First**: Write tests before implementing features
- **Code Quality**: Follow existing style and conventions
- **Documentation**: Update README and comments as needed
- **Accessibility**: Maintain WCAG AA compliance
- **Performance**: Ensure changes don't degrade performance
- **Multi-language**: Consider both Sindarin and English interfaces

### Code of Conduct

- **Respect**: Honor both elvish traditions and hobbit practicality
- **Quality**: Maintain scholarly standards of precision
- **Inclusion**: Ensure accessibility for all users
- **Collaboration**: Work together respectfully
- **Learning**: Share knowledge and help others improve

## Acknowledgments

- **Tolkien Estate**: For inspiration from Middle-earth languages and cultures
- **Open Source Community**: For the excellent tools and libraries used
- **Contributors**: Everyone who helps improve this application
- **Users**: SeniorChroniclerElf, Pip Proudfoot, and all who use this tool

---

**Version**: 1.0.0  
**Last Updated**: July 30, 2025  
**Minimum Node.js Version**: 16.0.0  
**Tested on**: Ubuntu 24.04+

*"Precision in historical reconciliation requires tools that honor both tradition and practicality."* 