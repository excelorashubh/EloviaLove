/**
 * Startup Validator
 * Validates all required environment variables and configurations before server starts
 */

const chalk = require('chalk') || { red: (s) => s, yellow: (s) => s, green: (s) => s };

class StartupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate required environment variables
   */
  validateEnvVars() {
    console.log('\n🔍 Validating Environment Variables...');
    
    const required = [
      { key: 'NODE_ENV', critical: false },
      { key: 'PORT', critical: false }, // Has default
      { key: 'MONGODB_URI', critical: true },
      { key: 'JWT_SECRET', critical: true },
      { key: 'CLIENT_URL', critical: false }
    ];

    const optional = [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'EMAIL_USER',
      'EMAIL_PASS',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'KEEP_ALIVE_URL'
    ];

    // Check required vars
    required.forEach(({ key, critical }) => {
      if (!process.env[key]) {
        const message = `Missing environment variable: ${key}`;
        if (critical) {
          this.errors.push(message);
          console.log(`   ❌ ${message}`);
        } else {
          this.warnings.push(message);
          console.log(`   ⚠️  ${message} (will use default)`);
        }
      } else {
        console.log(`   ✓ ${key}`);
      }
    });

    // Check optional vars
    let missingOptional = 0;
    optional.forEach(key => {
      if (!process.env[key]) {
        missingOptional++;
      }
    });

    if (missingOptional > 0) {
      console.log(`   ⚠️  ${missingOptional} optional variables not set (features may be limited)`);
    }
  }

  /**
   * Validate Node.js version
   */
  validateNodeVersion() {
    console.log('\n🔍 Validating Node.js Version...');
    
    const currentVersion = process.version;
    const major = parseInt(currentVersion.slice(1).split('.')[0]);
    const requiredMajor = 18;

    if (major < requiredMajor) {
      this.errors.push(`Node.js version ${currentVersion} is too old. Requires >= ${requiredMajor}.x`);
      console.log(`   ❌ Current: ${currentVersion}, Required: >= ${requiredMajor}.x`);
    } else {
      console.log(`   ✓ Node.js ${currentVersion}`);
    }
  }

  /**
   * Validate required dependencies
   */
  validateDependencies() {
    console.log('\n🔍 Validating Dependencies...');
    
    const required = [
      'express',
      'mongoose',
      'socket.io',
      'cors',
      'helmet',
      'jsonwebtoken',
      'bcryptjs',
      'dotenv'
    ];

    required.forEach(dep => {
      try {
        require.resolve(dep);
        console.log(`   ✓ ${dep}`);
      } catch (err) {
        this.errors.push(`Missing dependency: ${dep}`);
        console.log(`   ❌ ${dep} not found`);
      }
    });
  }

  /**
   * Validate file structure
   */
  validateFileStructure() {
    console.log('\n🔍 Validating File Structure...');
    
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
      '../models/User.js',
      '../models/Call.js',
      '../routes/auth.js',
      '../routes/call.js',
      '../utils/callSignaling.js',
      '../../client/dist/index.html'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✓ ${file}`);
      } else {
        this.warnings.push(`File not found: ${file}`);
        console.log(`   ⚠️  ${file} not found`);
      }
    });
  }

  /**
   * Validate MongoDB URI format
   */
  validateMongoUri() {
    console.log('\n🔍 Validating MongoDB URI...');
    
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      this.errors.push('MONGODB_URI is required');
      console.log('   ❌ MONGODB_URI not set');
      return;
    }

    // Check if it's a valid MongoDB URI
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      this.errors.push('Invalid MongoDB URI format');
      console.log('   ❌ Invalid format (must start with mongodb:// or mongodb+srv://)');
      return;
    }

    // Check if it contains credentials
    if (!uri.includes('@')) {
      this.warnings.push('MongoDB URI does not contain credentials');
      console.log('   ⚠️  No credentials found in URI');
    }

    console.log('   ✓ MongoDB URI format valid');
  }

  /**
   * Validate JWT secret strength
   */
  validateJwtSecret() {
    console.log('\n🔍 Validating JWT Secret...');
    
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      this.errors.push('JWT_SECRET is required');
      console.log('   ❌ JWT_SECRET not set');
      return;
    }

    if (secret.length < 32) {
      this.warnings.push('JWT_SECRET is too short (recommended: 32+ characters)');
      console.log(`   ⚠️  JWT_SECRET length: ${secret.length} (recommended: 32+)`);
    } else {
      console.log(`   ✓ JWT_SECRET length: ${secret.length}`);
    }
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 ELOVIA LOVE - STARTUP VALIDATION');
    console.log('═══════════════════════════════════════════════════════════');

    this.validateNodeVersion();
    this.validateEnvVars();
    this.validateMongoUri();
    this.validateJwtSecret();
    this.validateDependencies();
    this.validateFileStructure();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 VALIDATION RESULTS');
    console.log('═══════════════════════════════════════════════════════════');

    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      this.errors.forEach(error => console.log(`   • ${error}`));
      console.log('\n❌ Server cannot start with critical errors!');
      console.log('═══════════════════════════════════════════════════════════\n');
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
      console.log('\n⚠️  Server will start with limited functionality');
    } else {
      console.log('\n✅ ALL VALIDATIONS PASSED');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

module.exports = StartupValidator;
