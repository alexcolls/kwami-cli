#!/usr/bin/env node

const path = "cli/";

const fs = require("fs");
const { program } = require("commander");
const figlet = require("figlet");
const inquirer = require("inquirer");

// Function to display ASCII art from a file
function displayAsciiArtFromFile() {
  fs.readFile(path + "ascii-art.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading ASCII art file:", err);
      displayAsciiArt(); // Fallback to the original ASCII art function if the file cannot be read
      return;
    }
    console.log(data);
    displayAsciiArt(); // Call the original ASCII art function after printing the file content
  });
}

// Function to display ASCII art
function displayAsciiArt() {
  figlet("Kwami CLI", (err, data) => {
    if (err) {
      console.error("Error displaying ASCII art:", err);
      return;
    }
    console.log(data);
    displayMainOptions(); // Call the function to display the main options after displaying the ASCII art
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

  askForOption(); // Call the function to ask the user for their choice
}

// Function to ask the user for their option
function askForOption() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "option",
        message: "Choose an option:",
      },
    ])
    .then((answer) => {
      handleOption(answer.option.toLowerCase()); // Call the function to handle the selected option
    })
    .catch((error) => {
      console.error("Error while prompting for option:", error);
    });
}

// Function to handle the selected option
function handleOption(option) {
  switch (option) {
    case "1":
    case "create":
      displayCreateOptions();
      break;
    case "2":
    case "test":
      console.log("Running tests...");
      break;
    case "3":
    case "build":
      console.log("Building project...");
      break;
    case "4":
    case "deploy":
      console.log("Deploying project...");
      break;
    case "5":
    case "?":
    case "help":
      displayHelp();
      break;
    default:
      console.log("Invalid option. Please select again.");
      askForOption(); // Ask the user for option again in case of invalid input
      break;
  }
}

// Function to display create options
function displayCreateOptions() {
  console.log("\n> options:");
  console.log("   1. kapp");
  console.log("   2. kwam");
  console.log("   3. vite");
  console.log("   4. ? help");
  console.log("   5. < back");

  inquirer
    .prompt([
      {
        type: "input",
        name: "option",
        message: "Choose an option:",
      },
    ])
    .then((answer) => {
      switch (answer.option.toLowerCase()) {
        case "1":
        case "kapp":
          console.log("Creating a new kapp project...");
          break;
        case "2":
        case "kwam":
          console.log("Creating a new kwam project...");
          break;
        case "3":
        case "vite":
          console.log("Creating a new vite project...");
          break;
        case "4":
        case "?":
        case "help":
          displayHelp();
          displayCreateOptions();
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
    })
    .catch((error) => {
      console.error("Error while prompting for create option:", error);
    });
}

// Function to display help message
function displayHelp() {
  // Implement help content here
  console.log("Welcome to Kwami CLI Help");
  console.log("========================================");
  console.log("Usage: kwami [options]");
  console.log("");
  console.log("Options:");
  console.log("  create       Create a new project");
  console.log("  test         Run tests");
  console.log("  build        Build project");
  console.log("  deploy       Deploy project");
  console.log("  ? help       Display help");
  console.log("");
  console.log("For more information, visit https://kwami.io");
}

// Main program
program.version("1.0.0");
displayAsciiArtFromFile(); // Load and print the ASCII art from the file
