'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  async prompting() {
    this.log( // Have Yeoman greet the user.
      yosay(`Welcome to the ${chalk.red('modern-node')} generator!`),
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
        default: `https://${this.appname}.com`,
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
            value: 'anandamide-pancake',
            short: 'A.D.S.',
          },
          {
            name: 'Bcrypt + Passport (Log in System)',
            value: 'bcryptPassport',
            short: 'Log In System',
          },
          {
            name: 'Connect Flash (For toast notification)',
            value: 'connect-flash',
            short: 'Connect Flash',
          },
          {
            name: 'dayJS (Date Parsing)',
            value: 'dayjs',
            short: 'dayJS',
          },
          {
            name: 'Doge-Seed (Doge Mnemonic Seed Generator)',
            value: 'doge-seed',
            short: 'Much Doge',
          },
          {
            name: 'Handlebars',
            value: 'express-handlebars',
            short: 'Handlebars',
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
      this.apiAnswers = await this.prompt(apiPrompts)
        .then((answers) => {
          let optionalDep, optionalModel, mongooseBlock;
          const pkgJson = {
            dependencies: {
              "chalk": "^2.4.2",
              "compression": "^1.7.4",
              "cross-env": "^5.2.0",
              "debug": "^4.1.1",
              "dotenv": "8.0.0",
              "express": "4.17.1",
              "helmet": "3.18.0",
              "http-errors": "^1.7.2",
              "ip": "^1.1.5",
              "morgan": "^1.9.1",
              "pm2": "3.5.1",
              "rotating-file-stream": "1.4.1"
            },
          };
          this.fs.copyTpl(
            this.templatePath('api/bin/server.js'),
            this.destinationPath('bin/server.js'),
            {appName: this.setupAnswers.name},
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
          if (answers) {
            const features = answers.apiFeatures;
            features.forEach((feature) => {
              this.npmInstall([`${feature}`]);
              optionalDep += `const ${feature} = require("${feature}");\n`;
              if (feature === 'mongoose') {
                optionalModel = 'const User = require(`./models/User`)';       // ==========================> Import Models & Schema <============================";
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
          this.fs.copy(
            this.templatePath('api/.env-sample'),
            this.destinationPath('sample.env'),
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
      this.appAnswers = await this.prompt(appPrompts)
        .then((answers) => {
          let optionalDep = '', optionalModel = '', optionalHandles = '', optionalSession = '', optionalFlash = '', optionalPassport = '', mongooseBlock = '';
          const pkgJson = {
            dependencies: {
              "body-parser": "1.19.0",
              "chalk": "^2.4.2",
              "compression": "^1.7.4",
              "cookie-parser": "^1.4.4",
              "cross-env": "^5.2.0",
              "csurf": "^1.10.0",
              "debug": "^4.1.1",
              "dotenv": "8.0.0",
              "express": "4.17.1",
              "helmet": "3.18.0",
              "http-errors": "^1.7.2",
              "ip": "^1.1.5",
              "method-override": "^3.0.0",
              "morgan": "^1.9.1",
              "pm2": "3.5.1",
              "rotating-file-stream": "1.4.1"
            },
          };
          this.fs.copyTpl(
            this.templatePath('app/bin/server.js'),
            this.destinationPath('bin/server.js'),
            {appName: this.setupAnswers.name},
          );
          this.fs.copyTpl(
            this.templatePath('app/ecosystem.config.js'),
            this.destinationPath('ecosystem.config.js'),
            {appName: this.setupAnswers.name},
          );
          this.fs.copyTpl(
            this.templatePath('app/package.json'),
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
          if (answers) {
            const features = answers.appFeatures;
            if (features.includes('bcryptPassport')) {
              features.push('bcryptjs', 'express-session', 'passport', 'passport-local', 'connect-mongo');
              optionalPassport = 'require(`./bin/passport`)(passport); // =========================> Passport Config <=================================';
            }
            features.forEach((feature) => {
              switch (feature) {
                case 'bcryptjs':
                  optionalDep += 'const bcryptjs = require(`bcryptjs`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'doge-seed':
                  optionalDep += 'const doge-seed = require(`doge-seed`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'express-session':
                  optionalDep += 'const session = require(`express-session`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'express-handlebars':
                  optionalDep += 'const exphbs = require(`express-handlebars`);\n';
                  this.npmInstall([`${feature}`]);
                  optionalHandles = `const {} = require('./helpers/hbs');
                app.engine('.handlebars', exphbs({
                  helpers: {},
                  defaultLayout: 'main',
                  partialsDir: ['./views/partials/'],
                  extname: '.handlebars',
                }));
                app.set('view engine', 'handlebars');`;
                  this.fs.copy(
                    this.templatePath('app/helpers/hbs.js'),
                    this.destinationPath('helpers/hbs.js'),
                  );
                  this.fs.copy(
                    this.templatePath('app/helpers/auth.js'),
                    this.destinationPath('helpers/auth.js'),
                  );
                  this.fs.copyTpl(
                    this.templatePath('app/views/layouts/main.handlebars'),
                    this.destinationPath('views/layouts/main.handlebars'),
                    {
                      appDesc: this.setupAnswers.desc,
                      appAuthor: this.setupAnswers.author,
                    },
                  );
                  this.fs.copyTpl(
                    this.templatePath('app/views/index/dashboard.handlebars'),
                    this.destinationPath('views/index/dashboard.handlebars'),
                    {
                      appName: this.setupAnswers.name,
                      appDesc: this.setupAnswers.desc,
                    },
                  );
                  this.fs.copyTpl(
                    this.templatePath('app/routes/index-handlebars.js'),
                    this.destinationPath('routes/index.js'),
                    {
                      appName: this.setupAnswers.name,
                    },
                  );
                  break;
                case 'passport-local':
                  optionalDep += 'const passportLocal = require(`passport-local`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'mongoose':
                  optionalDep += 'const mongoose = require(`mongoose`);\n';
                  this.npmInstall([`${feature}`]);
                  this.npmInstall(['connect-mongo']);
                  optionalModel = 'const User = require(`./models/User`)'; // =========================⇨ Import Models & Schema <============================";
                  mongooseBlock = `mongoose.connect(process.env.mongoURI, {useNewUrlParser: true}) // ======> Connect to our Database <==========================
                .then(() => debug(chalk.blue.inverse(\` The Mongoose is Alive! \`))).catch(err => debug(err));`;
                  optionalSession = `const sess = {// ==================================================> Create Session Object for Use <==========================
                secret: 'assetCat',
                name: 'AssetCatTheWonderCat',
                resave: false,
                saveUninitialized: false, // =====================================> The line below this is the session store <===============
                store: new MongoStore({mongooseConnection: mongoose.connection}),
                cookie: {path: '/', httpOnly: true, secure: 'auto', maxAge: 60000 * 60 * 24},
              };
              app.use(session(sess)); // =========================================> Express session middleware <=============================
              app.use(passport.initialize()); // =================================> Passport middleware <====================================
              app.use(passport.session());`;
                  this.fs.copy(
                    this.templatePath('api/models/User.js'),
                    this.destinationPath('models/User.js'),
                  );
                  break;
                case 'connect-mongo':
                  optionalDep += 'const MongoStore = require(`connect-mongo`)(session);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'connect-flash':
                  optionalDep += 'const flash = require(`connect-flash`);\n';
                  this.npmInstall([`${feature}`]);
                  optionalFlash = `app.use(flash()); // ===============================================> Flash Messaging / Notification middleware <==============
                app.use((req, res, next) => { // ===================================> Set Global Variables <===================================
                  res.locals.success_msg = req.flash('success_msg');
                  res.locals.error_msg = req.flash('error_msg');
                  res.locals.error = req.flash('error');
                  next();
                });`;
                  break;
                case 'passport':
                  optionalDep += 'const passport = require(`passport`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'anandamide-pancake':
                  optionalDep += 'const pancake = require(`anandamide-pancake`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'dayjs':
                  optionalDep += 'const dayjs = require(`dayjs`);\n';
                  this.npmInstall([`${feature}`]);
                  break;
                case 'bcryptPassport':
                  break;
                case 'undefined':
                  break;
                case undefined:
                  break;
                default:
                  optionalDep += `const ${feature} = require(\'${feature}\');\n`;
                  this.npmInstall([`${feature}`]);
                  break;
              }
            });
            this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
            this.fs.copy(
              this.templatePath('app/.travis.yml'),
              this.destinationPath('.travis.yml'),
            );
            this.fs.copy(
              this.templatePath('app/Procfile'),
              this.destinationPath('Procfile'),
            );
            this.fs.copy(
              this.templatePath('app/.gitignore'),
              this.destinationPath('.gitignore'),
            );
            this.fs.copy(
              this.templatePath('app/.env-sample'),
              this.destinationPath('sample.env'),
            );
            this.fs.copyTpl(
              this.templatePath('app/app.js'),
              this.destinationPath('app.js'),
              {
                appName: this.setupAnswers.name,
                appOptionalDependency: optionalDep,
                appOptionalModels: optionalModel,
                appMongooseBlock: mongooseBlock,
                appHandles: optionalHandles,
                appSession: optionalSession,
                appFlash: optionalFlash,
                appPassport: optionalPassport,
              },
            );
          }
        });
    }
  }

  install() {
    this.npmInstall().catch(err => this.log(yosay(`Uh Oh!!\n ${err}`)));
    this.log(
      yosay(`Feel free to run \n 'npm run prod'\n as soon as your installations have finished. ${chalk.red('Enjoy!!!')}`),
    );
  }
};
