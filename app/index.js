var Generator = require("yeoman-generator");
var yosay = require("yosay");
var chalk = require("chalk");
const changeCase = require("change-case");

const srcFolder = "src";

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args,opts);
    }

    async prompting() {
        this.log(yosay(`Welcome to the wonderful ${chalk.red("neudesic react solution")} generator!`));
        
        var answers = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname // Default to current folder name
            },
            {
                type: "input",
                name: "description",
                message: "Short description for your project"
            }
        ]);

        this._logCapabilityInfo();
        answers.CSSBootstrap = Boolean(this.options["cssBootstrap"]);
        if (!answers.CSSBootstrap) {
            answers.CSSBootstrap = (await this.prompt([
                {
                    type: "confirm",
                    name: "CSSBootstrap",
                    message: "Does you application need CSS bootstrap Library, this will install bootstrap related packages",
                    default: false
                }
            ])).CSSBootstrap;
        }
        answers.reactRouterDom = Boolean(this.options["reactRouterDom"]);
        if (!answers.reactRouterDom) {
            answers.reactRouterDom = (await this.prompt([
                {
                    type: "confirm",
                    name: "reactRouterDom",
                    message: "Does you application need react-router-dom Library, this will install react-router-dom related packages",
                    default: false
                }
            ])).reactRouterDom;
        }
        answers.reactHookForm = Boolean(this.options["reactHookForm"]);
        if (!answers.reactHookForm) {
            answers.reactHookForm = (await this.prompt([
                {
                    type: "confirm",
                    name: "reactHookForm",
                    message: "Does you application need react-hook-form Library, this will install react-hook-form related packages",
                    default: false
                }
            ])).reactHookForm;
        }

        this.answers = answers;
    }

    writing() {
        this._writePackageJson();
        this._writeIndexHTML();
        this._writeIndexFile();
        this._writeAppFile();
        if (this.answers.CSSBootstrap) {
            this._addCSSBootstrapDependencies();
        }
        this._createProject();
        if (this.answers.reactRouterDom) {
            this._addReactRouterDomDependencies();
        }
        if (this.answers.reactHookForm) {
            this._addReactHookFormDependencies();
        }
        this.config.save();
    }

    end() {
        if (!this.options['skip-install']) {
            // Change working directory to 'soln' for dependency install
            var npmdir = process.cwd() + '/';
            process.chdir(npmdir);

            // this._installDependencies();
        }
    }

    _installDependencies() {
        this.log(chalk.blue("All necessary filed created"));
        this.log(chalk.bgBlueBright("Installing dependencies... Please wait..."));
        this.options['npm'] = true;
        this.spawnCommand("install"); 
    }

    _destinationSolnPath(...path) {
        return this.destinationPath(srcFolder, ...path);
    }


    _writePackageJson() {
        this.fs.copyTpl(this.templatePath("src-package.json"), this.destinationPath("package.json"), {
            name: this.answers.name,
            description: this.answers.description,
            projectName: changeCase.paramCase(this.answers.name)
        });
    }

    _writeIndexHTML() {
        this.fs.copyTpl(this.templatePath("index.html.tmpl"), this._destinationSolnPath("index.html"), {
            name: this.answers.name,
            description: this.answers.description,
            projectName: changeCase.paramCase(this.answers.name)
        });
    }

    _writeIndexFile() {
        this.fs.copyTpl(this.templatePath("index.tsx.tmpl"), this._destinationSolnPath("index.tsx"), {
            bootstrap: this.answers.CSSBootstrap,
        });
    }

    _writeAppFile() {
        this.fs.copyTpl(this.templatePath("react-router-dom/App.tsx.tmpl"), this._destinationSolnPath("/pages/app/App.tsx"), {
            reactRouterDom: this.answers.reactRouterDom,
            reactHookForm: this.answers.reactHookForm
        });
    }

    _createProject() {
        this.fs.copy(
            this.templatePath('base-template/**'),
            this.destinationPath(""),
            {globOptions: { dot: true}}
        )
    }

    _addCSSBootstrapDependencies() {
        const cssBootstrapDependencies = {
            dependencies: {
                "bootstrap": "^5.0.2",
            }
        };
        this.fs.extendJSON(this.destinationPath("package.json"), cssBootstrapDependencies);
    }

    _addReactRouterDomDependencies() {
        const reactRouterDom = {
            dependencies: {
                "react-router-dom": "^5.2.0",
            }
        };
        this.fs.extendJSON(this.destinationPath("package.json"), reactRouterDom);
    }

    _addReactHookFormDependencies() {
        const reactHookForm = {
            dependencies: {
                "react-hook-form": "^7.11.1",
            }
        };
        this.fs.extendJSON(this.destinationPath("package.json"), reactHookForm);
    }

    _logCapabilityInfo() {
        const isSkipInstall = this.options['skip-install'];
        if (isSkipInstall) {
            this.log(chalk.blue("---------------------------------"))
            this.log(chalk.yellow("Skipping Dependency Installations"))
            this.log(chalk.blue("---------------------------------"))
        }
        const cssBootstrap = this.options['cssBootstrap'];
        if (cssBootstrap) {
            this.log(chalk.blue("--------------------------------------------------------------------------"))
            this.log(chalk.yellow("Bootstrap  will be installed"))
            this.log(chalk.blue("--------------------------------------------------------------------------"))
        }
    }
}