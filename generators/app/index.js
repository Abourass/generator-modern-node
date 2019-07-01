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
            value: 'pancake',
            short: 'A.D.S.',
          },
          {
            name: 'Mongoose',
            value: 'mongoose',
            short: 'Mongoose',
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
        this.log(
          yosay(`${this.setupAnswers.name} API Creation has ${chalk.red('started!!!')}`),
        );
      });
    } else {
      this.appAnswers = await this.prompt(appPrompts).then(() => {
        this.fs.copy(
          this.templatePath('app/dummyfile.txt'),
          this.destinationPath('app/dummyfile.txt'),
        );
        this.log(
          yosay(`File Copied, App ready now my friend! ${chalk.red('NOW!!!')}`),
        );
      });
    }
  }

  install() {
    this.npmInstall().catch(err => this.log(yosay(`Uh Oh!! ${err}`)));
  }
};
