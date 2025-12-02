#!/bin/bash

# AI-Assisted Development Rules - Augment AI Integration Setup Script
# @purpose: Automated setup and configuration for Augment AI integration
# @ai-context: {domain: "deployment", layer: "automation", complexity: "medium"}

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.augment-ai-rules}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/.augment-ai-rules-backup}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 16 ]; then
        log_error "Node.js 16+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed."
        exit 1
    fi
    
    # Check TypeScript
    if ! command -v tsc &> /dev/null; then
        log_info "Installing TypeScript globally..."
        npm install -g typescript
    fi
    
    log_success "Prerequisites check completed"
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    mkdir -p "$INSTALL_DIR"/{config,templates,validation,feedback,integration,logs,backup}
    mkdir -p "$BACKUP_DIR"
    
    log_success "Directory structure created at $INSTALL_DIR"
}

# Copy configuration files
copy_configurations() {
    log_info "Copying configuration files..."
    
    # Core configuration
    cp "$CONFIG_DIR/core-rules.json" "$INSTALL_DIR/config/"
    cp "$CONFIG_DIR/templates/code-templates.json" "$INSTALL_DIR/templates/"
    cp "$CONFIG_DIR/deployment/augment-ai-integration.json" "$INSTALL_DIR/config/"
    
    # TypeScript files
    cp "$CONFIG_DIR/validation/rule-validator.ts" "$INSTALL_DIR/validation/"
    cp "$CONFIG_DIR/feedback/improvement-tracker.ts" "$INSTALL_DIR/feedback/"
    cp "$CONFIG_DIR/integration/augment-ai-adapter.ts" "$INSTALL_DIR/integration/"
    
    log_success "Configuration files copied"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    cd "$INSTALL_DIR"
    
    # Create package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        cat > package.json << EOF
{
  "name": "augment-ai-rules-integration",
  "version": "1.0.0",
  "description": "AI-Assisted Development Rules Integration for Augment AI",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node integration/augment-ai-adapter.ts",
    "validate": "node dist/validation/rule-validator.js",
    "test": "jest"
  },
  "dependencies": {
    "@typescript-eslint/typescript-estree": "^6.0.0",
    "events": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
EOF
    fi
    
    # Create tsconfig.json
    if [ ! -f "tsconfig.json" ]; then
        cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": [
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF
    fi
    
    npm install
    
    log_success "Dependencies installed"
}

# Build TypeScript files
build_project() {
    log_info "Building TypeScript files..."
    
    cd "$INSTALL_DIR"
    npm run build
    
    log_success "Project built successfully"
}

# Create integration scripts
create_integration_scripts() {
    log_info "Creating integration scripts..."
    
    # Main integration script
    cat > "$INSTALL_DIR/integrate.js" << 'EOF'
#!/usr/bin/env node

/**
 * @file integrate.js
 * @purpose Main integration script for Augment AI
 * @ai-context: {domain: "integration", layer: "script", complexity: "medium"}
 */

const { AugmentAIAdapter } = require('./dist/integration/augment-ai-adapter');
const coreRules = require('./config/core-rules.json');
const templates = require('./templates/code-templates.json');
const integrationConfig = require('./config/augment-ai-integration.json');

async function initializeIntegration() {
    console.log('🚀 Initializing Augment AI Rules Integration...');
    
    try {
        const config = {
            rules: coreRules.aiAssistedDevelopmentRules,
            templates: templates.codeTemplates,
            feedback: integrationConfig.augmentAIIntegration.learningSystem,
            autoFix: integrationConfig.augmentAIIntegration.ruleEnforcement.autoFix.enabled
        };
        
        const adapter = new AugmentAIAdapter(config);
        
        console.log('✅ Integration initialized successfully');
        console.log('📋 Available features:');
        console.log('   - Code generation with rule enforcement');
        console.log('   - Real-time validation and auto-fixing');
        console.log('   - Pattern learning and improvement');
        console.log('   - Continuous feedback collection');
        
        return adapter;
    } catch (error) {
        console.error('❌ Integration failed:', error.message);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = { initializeIntegration };

// Run if called directly
if (require.main === module) {
    initializeIntegration();
}
EOF
    
    chmod +x "$INSTALL_DIR/integrate.js"
    
    # Validation script
    cat > "$INSTALL_DIR/validate-code.js" << 'EOF'
#!/usr/bin/env node

const { AIRuleValidator } = require('./dist/validation/rule-validator');
const coreRules = require('./config/core-rules.json');
const fs = require('fs');

async function validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }
    
    const code = fs.readFileSync(filePath, 'utf8');
    const validator = new AIRuleValidator(coreRules.aiAssistedDevelopmentRules);
    
    console.log(`🔍 Validating ${filePath}...`);
    
    const result = await validator.validateCode(code);
    
    console.log(`📊 Validation Score: ${result.score}/100`);
    
    if (result.violations.length > 0) {
        console.log('\n⚠️  Rule Violations:');
        result.violations.forEach(violation => {
            console.log(`   ${violation.severity.toUpperCase()}: ${violation.message} (${violation.rule})`);
        });
    } else {
        console.log('✅ No rule violations found');
    }
    
    if (result.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        result.suggestions.forEach(suggestion => {
            console.log(`   ${suggestion.message}`);
        });
    }
}

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node validate-code.js <file-path>');
    process.exit(1);
}

validateFile(filePath);
EOF
    
    chmod +x "$INSTALL_DIR/validate-code.js"
    
    log_success "Integration scripts created"
}

# Create configuration for popular editors
create_editor_configs() {
    log_info "Creating editor configurations..."
    
    # VS Code configuration
    mkdir -p "$INSTALL_DIR/.vscode"
    cat > "$INSTALL_DIR/.vscode/settings.json" << EOF
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.ai-rules": "json"
  },
  "augmentAI.rules": {
    "enabled": true,
    "configPath": "./config/core-rules.json",
    "autoFix": true,
    "realTimeValidation": true
  }
}
EOF
    
    # Create tasks.json for VS Code
    cat > "$INSTALL_DIR/.vscode/tasks.json" << EOF
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Code",
      "type": "shell",
      "command": "node",
      "args": ["validate-code.js", "\${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Build Integration",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build"],
      "group": "build"
    }
  ]
}
EOF
    
    log_success "Editor configurations created"
}

# Create documentation
create_documentation() {
    log_info "Creating documentation..."
    
    cat > "$INSTALL_DIR/README.md" << 'EOF'
# AI-Assisted Development Rules - Augment AI Integration

This installation provides a comprehensive framework for integrating AI-assisted development rules with Augment AI.

## Quick Start

1. **Initialize Integration**:
   ```bash
   node integrate.js
   ```

2. **Validate Code**:
   ```bash
   node validate-code.js path/to/your/file.ts
   ```

3. **Build Project**:
   ```bash
   npm run build
   ```

## Features

- ✅ **Rule Enforcement**: Automatic application of 50+ development rules
- ✅ **Code Generation**: Template-based code generation with rule compliance
- ✅ **Real-time Validation**: Instant feedback on code quality
- ✅ **Auto-fixing**: Automatic correction of common violations
- ✅ **Pattern Learning**: Continuous improvement through usage patterns
- ✅ **Performance Optimization**: Context window and processing optimizations

## Configuration

Edit `config/core-rules.json` to customize rule enforcement.
Edit `config/augment-ai-integration.json` to modify integration settings.

## Support

For issues and questions, check the logs in the `logs/` directory.
EOF
    
    log_success "Documentation created"
}

# Main installation function
main() {
    echo "🎯 AI-Assisted Development Rules - Augment AI Integration Setup"
    echo "============================================================"
    
    check_prerequisites
    create_directories
    copy_configurations
    install_dependencies
    build_project
    create_integration_scripts
    create_editor_configs
    create_documentation
    
    echo ""
    log_success "🎉 Installation completed successfully!"
    echo ""
    echo "📍 Installation directory: $INSTALL_DIR"
    echo "📖 Documentation: $INSTALL_DIR/README.md"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. cd $INSTALL_DIR"
    echo "   2. node integrate.js"
    echo "   3. Configure your Augment AI to use this integration"
    echo ""
    echo "💡 Test the integration:"
    echo "   node validate-code.js path/to/your/code.ts"
    echo ""
}

# Run main function
main "$@"
