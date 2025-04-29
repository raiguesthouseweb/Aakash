/**
 * Rai Guest House Management System Setup Script
 * 
 * This script helps with setting up the project for first-time users.
 * It creates necessary configuration files and initializes the database.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Constants
const ENV_FILE_PATH = '.env';
const ENV_EXAMPLE_PATH = '.env.example';

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'superman123';

// Banner
console.log('\n\x1b[1;36m=======================================================\x1b[0m');
console.log('\x1b[1;36m       Rai Guest House Management System Setup\x1b[0m');
console.log('\x1b[1;36m=======================================================\x1b[0m\n');

// Setup process
async function setup() {
  try {
    console.log('\x1b[33mChecking project requirements...\x1b[0m');
    
    // Check for Node.js version
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' });
      console.log(`✓ Node.js ${nodeVersion.trim()} detected`);
      
      const versionNum = nodeVersion.match(/v(\d+)\./);
      if (versionNum && Number(versionNum[1]) < 16) {
        console.warn('\x1b[33m⚠ Warning: This project works best with Node.js 16 or higher\x1b[0m');
      }
    } catch (err) {
      console.error('\x1b[31m✗ Failed to detect Node.js version\x1b[0m');
    }
    
    // Check for npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' });
      console.log(`✓ npm ${npmVersion.trim()} detected`);
    } catch (err) {
      console.error('\x1b[31m✗ npm not found. Please install npm.\x1b[0m');
      process.exit(1);
    }
    
    // Create .env file if it doesn't exist
    if (!fs.existsSync(ENV_FILE_PATH)) {
      if (fs.existsSync(ENV_EXAMPLE_PATH)) {
        fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_FILE_PATH);
        console.log('✓ Created .env file from template');
      } else {
        // Create minimal .env file
        const defaultEnv = 
`# Rai Guest House Management System Environment Variables
NODE_ENV=development
PORT=5000

# Set to 'true' to enable debugging
DEBUG=false

# Add your Google Sheets API key here if you plan to use Google Sheets integration
VITE_GOOGLE_API_KEY=

# Spreadsheet IDs for Google Sheets integration (optional)
VITE_TOURISM_SPREADSHEET_ID=
VITE_MENU_SPREADSHEET_ID=
VITE_ORDERS_SPREADSHEET_ID=
`;
        fs.writeFileSync(ENV_FILE_PATH, defaultEnv);
        console.log('✓ Created default .env file');
      }
    } else {
      console.log('✓ .env file already exists');
    }
    
    console.log('\n\x1b[33mSetting up administration account...\x1b[0m');
    console.log(`Default admin username: \x1b[36m${DEFAULT_ADMIN_USERNAME}\x1b[0m`);
    console.log(`Default admin password: \x1b[36m${DEFAULT_ADMIN_PASSWORD}\x1b[0m`);
    
    const customizeCredentials = await new Promise(resolve => {
      rl.question('\nWould you like to customize admin credentials? (y/N): ', answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (customizeCredentials) {
      const username = await new Promise(resolve => {
        rl.question('Enter admin username (default: admin): ', answer => {
          resolve(answer.trim() || DEFAULT_ADMIN_USERNAME);
        });
      });
      
      const password = await new Promise(resolve => {
        rl.question('Enter admin password (default: superman123): ', answer => {
          resolve(answer.trim() || DEFAULT_ADMIN_PASSWORD);
        });
      });
      
      // Update constants file
      const constantsPath = path.join(__dirname, 'client', 'src', 'config', 'constants.ts');
      if (fs.existsSync(constantsPath)) {
        let constants = fs.readFileSync(constantsPath, 'utf8');
        
        // Replace default admin password
        constants = constants.replace(
          /export const ADMIN_PASSWORD = ["'].*["'];/,
          `export const ADMIN_PASSWORD = "${password}";`
        );
        
        // Save updated constants
        fs.writeFileSync(constantsPath, constants);
        console.log('✓ Updated admin credentials');
      } else {
        console.warn('\x1b[33m⚠ Could not find constants.ts file to update admin credentials\x1b[0m');
      }
    }
    
    console.log('\n\x1b[33mInstalling dependencies...\x1b[0m');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✓ Dependencies installed successfully');
    } catch (err) {
      console.error('\x1b[31m✗ Failed to install dependencies\x1b[0m');
      console.error(err.message);
      process.exit(1);
    }
    
    console.log('\n\x1b[32m=======================================================\x1b[0m');
    console.log('\x1b[32m                 Setup Complete!\x1b[0m');
    console.log('\x1b[32m=======================================================\x1b[0m');
    console.log('\nTo start the application, run:');
    console.log('\x1b[36m  npm run dev\x1b[0m');
    console.log('\nThen open your browser to:');
    console.log('\x1b[36m  http://localhost:5000\x1b[0m');
    console.log('\nFor more information, see the README.md file.');
    
  } catch (err) {
    console.error('\n\x1b[31mSetup failed:\x1b[0m', err);
  } finally {
    rl.close();
  }
}

// Run setup
setup();