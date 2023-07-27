#!/usr/bin/env node

const { program } = require("commander");
const figlet = require("figlet");
const shell = require("shelljs");
const inquirer = require("inquirer");

// Function to display ASCII art
function displayAsciiArt() {
  figlet("Kwami CLI", (err, data) => {
    if (err) {
      console.error("Error displaying ASCII art:", err);
      return;
    }
    console.log(data);
  });
}

// Function to display main options
function displayMainOptions() {
  console.log("\n> options:");
  console.log("   1. create");
  console.log("   2. test");
  console.log("   3. build");
  console.log("   4. deploy");
  console.log("   5. ? help");
}

// Function to display create options
async function displayCreateOptions() {
  console.log("\n> options:");
  console.log("   1. kapp");
  console.log("   2. kwam");
  console.log("   3. vite");
  console.log("   4. ? help");
  console.log("   5. < back");

  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "option",
      message: "Choose an option:",
    },
  ]);

  switch (answer.option.toLowerCase()) {
    case "1":
    case "kapp":
      // Implement logic for copying default kapp folder
      console.log("Creating a new kapp project...");
      break;
    case "2":
    case "kwam":
      // Implement logic for copying default kwam folder
      console.log("Creating a new kwam project...");
      break;
    case "3":
    case "vite":
      // Implement logic for creating a new vite project
      console.log("Creating a new vite project...");
      break;
    case "4":
    case "?":
    case "help":
      displayHelp();
      break;
    case "5":
    case "<":
    case "back":
      displayMainOptions();
      break;
    default:
      console.log("Invalid option. Please select again.");
      displayCreateOptions();
      break;
  }
}

// Function to display help message
function displayHelp() {
  // Implement help content here
  console.log("Help content goes here...");
}

// Main program
program.version("1.0.0");
displayAsciiArt();
displayMainOptions();

program
  .command("create")
  .description("Create a new project")
  .action(displayCreateOptions);

program
  .command("test")
  .description("Run tests")
  .action(() => {
    console.log("Running tests...");
  });

program.parse(process.argv);
