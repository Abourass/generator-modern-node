'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  async prompting() {
    this.log( // Have Yeoman greet the user.
      yosay(`Welcome to the divine ${chalk.red('modern-node')} generator!`),
    );
    const setupPrompts = [ // Prompts for setting up the generator
      {
        type: 'input',
        name: 'name',
        message: 'What will the project be called?',
        default: this.appname,
      },
      {
        type: 'input',
        name: 'desc',
        message: 'Description for the package.json?',
        default: `The great ${this.appname}!`,
      },
      {
        type: 'input',
        name: 'url',
        message: 'Homepage for the package.json?',
        default: '',
      },
      {
        type: 'input',
        name: 'repo',
        message: 'Repo for the package.json?',
        default: '',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Who should we list as the author?',
        default: '',
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project will this be?',
        choices: [
          {
            name: 'An API (No, I don\'t want a View Engine)',
            value: 'api',
            short: 'API',
          },
          {
            name: 'An App (Yes, I want a View Engine)',
            value: 'app',
            short: 'App',
          },
        ],
      },
    ];
    this.setupAnswers = await this.prompt(setupPrompts);
  }

  async writing() {
    const apiPrompts = [ // User chooses API features
      {
        type: 'checkbox',
        name: 'apiFeatures',
        message: 'What features will this API need?',
        choices: [
          {
            name: 'Advanced Data Structures',
            value: 'anandamide-pancake',
            short: 'A.D.S.',
          },
          {
            name: 'Doge-Seed (Doge Mnemonic Seed Generator)',
            value: 'doge-seed',
            short: 'Much Doge',
          },
          {
            name: 'Mongoose',
            value: 'mongoose',
            short: 'Mongoose',
          },
        ],
      },
    ];

    const appPrompts = [ // User choose App Features
      {
        type: 'checkbox',
        name: 'appFeatures',
        message: 'What features will this App need?',
        choices: [
          {
            name: 'Advanced Data Structures',
            value: 'pancake',
            short: 'A.D.S.',
          },
          {
            name: 'Bcrypt + Passport (Log in System)',
            value: 'brcyptPassport',
            short: 'Log In System',
          },
          {
            name: 'Connect Flash (For toast notification)',
            value: 'connectFlash',
            short: 'Connect Flash',
          },
          {
            name: 'dayJS (Date Parsing)',
            value: 'dayJS',
            short: 'dayJS',
          },
          {
            name: 'Doge-Seed (Doge Mnemonic Seed Generator)',
            value: 'doge',
            short: 'Much Doge',
          },
          {
            name: 'Faker (Create Fake Information)',
            value: 'faker',
            short: 'Faker',
          },
          {
            name: 'Mongoose',
            value: 'mongoose',
            short: 'Mongoose',
          },
        ],
      },
    ];

    if (this.setupAnswers.projectType === 'api') {
      this.apiAnswers = await this.prompt(apiPrompts).then((answers) => {
        let optionalDep, optionalModel, mongooseBlock;
        const pkgJson = {
          dependencies: {
            "chalk": "^2.4.2",
            "compression": "^1.7.4",
            "cross-env": "^5.2.0",
            "debug": "^4.1.1",
            "dotenv": "8.0.0",
            "express": "4.17.1",
            "http-errors": "^1.7.2",
            "ip": "^1.1.5",
            "pm2": "3.5.1",
            "rotating-file-stream": "1.4.1"
            // TODO: Add Helmet & Morgan
          },
        };
        this.fs.copyTpl(
          this.templatePath('api/bin/server.js'),
          this.destinationPath('bin/server.js'),
          {appName: this.setupAnswers.name},
        );
        this.fs.copy(
          this.templatePath('api/.env'),
          this.destinationPath('.env'),
        );
        this.fs.copyTpl(
          this.templatePath('api/ecosystem.config.js'),
          this.destinationPath('ecosystem.config.js'),
          {appName: this.setupAnswers.name},
        );
        this.fs.copyTpl(
          this.templatePath('api/package.json'),
          this.destinationPath('package.json'),
          {
            appName: this.setupAnswers.name,
            appDesc: this.setupAnswers.desc,
            appURL: this.setupAnswers.url,
            appRepo: this.setupAnswers.repo,
            appAuthor: this.setupAnswers.author,
          },
        );
        // Extend or create package.json file in destination path
        if (answers){
          const features = answers.apiFeatures;
          features.forEach((feature) => {
            this.npmInstall([`${feature}`]);
            optionalDep += `const ${feature} = require('${feature}');\n`;
            if (feature === 'mongoose'){
              optionalModel = "const User = require('./models/User');       // ==========================> Import Models & Schema <============================";
              mongooseBlock = `mongoose.connect(process.env.mongoURI, {useNewUrlParser: true}) // ======> Connect to our Database <==========================
  .then(() => debug(chalk.blue.inverse(' The Mongoose is Alive! '))).catch(err => debug(err));`;
              this.fs.copy(
                this.templatePath('api/models/User.js'),
                this.destinationPath('models/User.js'),
              );
            } else {
              optionalModel = '';
              mongooseBlock = '';
            }
          });
        }
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
        this.fs.copy(
          this.templatePath('api/.travis.yml'),
          this.destinationPath('.travis.yml'),
        );
        this.fs.copy(
          this.templatePath('api/Procfile'),
          this.destinationPath('Procfile'),
        );
        this.fs.copy(
          this.templatePath('api/.gitignore'),
          this.destinationPath('.gitignore'),
        );
        this.fs.copyTpl(
          this.templatePath('api/app.js'),
          this.destinationPath('app.js'),
          {
            appName: this.setupAnswers.name,
            appOptionalDependency: optionalDep,
            appOptionalModels: optionalModel,
            appMongooseBlock: mongooseBlock,
          },
        );
      });
    } else {
      this.appAnswers = await this.prompt(appPrompts).then(() => {
        this.fs.copy(
          this.templatePath('app/dummyfile.txt'),
          this.destinationPath('app/dummyfile.txt'),
        );
        this.log(
          yosay(`Your App is ready my friend! ${chalk.red('Enjoy!!!')}`),
        );
      });
    }
  }

  install() {
    this.npmInstall().catch(err => this.log(yosay(`Uh Oh!!\n ${err}`)));
  }
};
