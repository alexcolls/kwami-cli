#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

program.version("1.0.0");

program
  .command("create <projectType> <projectName>")
  .description("Create a new project")
  .action((projectType, projectName) => {
    if (projectType !== "kapp" && projectType !== "kwam") {
      console.error(
        'Invalid project type. It should be either "kapp" or "kwam".'
      );
      process.exit(1);
    }

    const sourceFolder = path.join(__dirname, "templates", projectType);
    const destinationFolder = path.join(process.cwd(), projectName);

    if (!fs.existsSync(sourceFolder)) {
      console.error(`Template folder for "${projectType}" not found.`);
      process.exit(1);
    }

    if (fs.existsSync(destinationFolder)) {
      console.error(`Destination folder "${projectName}" already exists.`);
      process.exit(1);
    }

    try {
      fs.mkdirSync(destinationFolder);
      execSync(`cp -r ${sourceFolder}/* ${destinationFolder}`);
      const packageJsonFile = path.join(destinationFolder, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, "utf8"));
      packageJson.name = projectName;
      fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
      console.log(
        `Project "${projectName}" with type "${projectType}" created successfully.`
      );
    } catch (error) {
      console.error(
        "An error occurred while creating the project:",
        error.message
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
