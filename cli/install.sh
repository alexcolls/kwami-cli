#!/bin/bash

# Function to print the ASCII art
function printAsciiArt() {
  cat << "EOF"
 ____  __.__      __  _____      _____  .___ 
|    |/ _/  \    /  \/  _  \    /     \ |   |
|      < \   \/\/   /  /_\  \  /  \ /  \|   |
|    |  \ \        /    |    \/    Y    \   |
|____|__ \ \__/\  /\____|__  /\____|__  /___|
        \/      \/         \/         \/     
                            
EOF
}

# Function to print the welcome message with program name and version
function printWelcomeMessage() {
  local version="1.0.0"  # Replace this with the actual version of kwami-cli
  echo ""
  echo "Welcome to kwami-cli installer. (Version: $version)"
  echo ""
  echo "To install kwami-cli in yournos. The program will install or re-install/update global dependencies like node, python, npm and yarn."
  echo ""
}

# Function to print the menu and ask for user choice
function showMenuAndGetChoice() {
  local prompt="$1"
  local options=("${@:2}")

  echo ""
  echo "- $prompt"
  echo ""
  echo "Choose an option:"
  echo ""
  for ((i = 0; i < ${#options[@]}; i++)); do
    echo "$(($i + 1)). ${options[$i]}"
  done
  echo ""
  echo "x. Exit"
  echo ""

  read -rp "> " choice
  echo ""

  if [[ "$choice" == "x" ]]; then
    exit 0
  elif ! [[ "$choice" =~ ^[1-9][0-9]*$ ]] || ((choice < 1 || choice > ${#options[@]})); then
    echo "Invalid choice. Please select again."
    echo ""
    return 1
  fi

  selected_option="${options[$((choice - 1))]}"
  echo "Selected option: $selected_option"
  echo ""

  return 0
}

# Function to install Node.js, npm, Yarn, and Python globally with privileges
function installGlobalDependencies() {
  echo ""
  echo "Installing global dependencies..."
  echo ""

  # Resolve unmet dependencies
  apt --fix-broken install

  # Install Node.js using the NodeSource repository (LTS version)
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs

  # Update Node.js and npm
  npm install -g n
  n latest

  # Install Yarn
  npm i -g yarn

  # Install Python 3.10
  apt-get install -y python3.10

  echo ""
  echo "Global dependencies installed successfully!"
  echo ""
}

# Function to install kwami-cli dependencies and kwami program globally
function installKwamiGlobally() {
  echo ""
  echo "Installing kwami-cli dependencies and kwami globally..."
  echo ""

  # Install figlet, fs, inquirer
  npm i -g figlet fs inquirer

  # Check if commander is already installed
  if npm list -g commander &>/dev/null; then
    echo "commander is already installed."
  else
    # Install commander with the specified version (8.2.0)
    if npm i -g commander@8.2.0; then
      echo "commander@8.2.0 installed successfully!"
    else
      echo "Installation of commander@8.2.0 failed. Please try again or manually install the dependency."
      return 1
    fi
  fi

  # Get the absolute path of the kwami-cli directory
  KWAMI_CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  # Install kwami-cli
  if npm i -g "$KWAMI_CLI_DIR"; then
    echo ""
    echo "We are done! kwami-cli is now installed! You can use it by calling \$ kwami in your terminal."
    echo ""
  else
    echo ""
    echo "Installation of kwami-cli failed. Please try again or manually install kwami-cli."
    echo ""
    return 1
  fi
}

# Function to uninstall global dependencies
function uninstallGlobalDependencies() {
  echo ""
  echo "Uninstalling global dependencies..."
  echo ""

  # Ask for confirmation to uninstall global programs
  showMenuAndGetChoice "Do you want to uninstall global dependencies (Node.js, npm, Yarn, Python) as well?" "Yes" "No"
  echo ""

  case $selected_option in
    Yes)
      # Uninstall Node.js and npm
      apt-get remove -y nodejs npm

      # Uninstall Yarn
      npm uninstall -g yarn

      # Uninstall Python 3.10
      apt-get remove -y python3.10

      echo ""
      echo "Global dependencies uninstalled successfully!"
      echo ""
      ;;
    No)
      echo ""
      echo "Skipping uninstallation of global dependencies."
      echo ""
      ;;
    *)
      echo ""
      echo "Invalid option, skipping uninstallation of global dependencies."
      echo ""
      ;;
  esac
}

# Function to uninstall kwami-cli dependencies and kwami program globally
function uninstallKwamiGlobally() {
  echo ""
  echo "Uninstalling kwami-cli dependencies and kwami..."
  echo ""

  # Uninstall figlet, fs, inquirer
  npm uninstall -g figlet fs inquirer

  # Uninstall kwami-cli
  if npm uninstall -g kwami-cli; then
    echo ""
    echo "Uninstallation of kwami-cli completed successfully!"
    echo ""
  else
    echo ""
    echo "Uninstallation of kwami-cli failed. Please try again or manually uninstall kwami-cli."
    echo ""
  fi
}

# Check if running with root permissions
if [[ $EUID -ne 0 ]]; then
  echo ""
  echo "This script requires administrative privileges. Please run it with 'sudo'."
  echo ""
  exit 1
fi

# Main program
function main() {
  printAsciiArt
  printWelcomeMessage

  # Ask user what to do
  while true; do
    showMenuAndGetChoice "What would you like to do?" "Install" "Uninstall"
    case $selected_option in
      Install)
        installGlobalDependencies
        break
        ;;
      Uninstall)
        uninstallKwamiGlobally
        uninstallGlobalDependencies
        break
        ;;
      Exit)
        echo ""
        echo "Exiting the program. Goodbye!"
        echo ""
        exit 0
        ;;
      *)
        echo ""
        echo "Invalid option, please select again."
        echo ""
        ;;
    esac
  done

  # Ask user if they want to install kwami globally with privileges
  while true; do
    echo ""
    showMenuAndGetChoice "Do you want to install kwami globally with privileges?" "Yes" "No"
    case $selected_option in
      Yes)
        installKwamiGlobally
        break
        ;;
      No)
        echo ""
        echo "Skipping kwami installation. See you soon!"
        echo ""
        break
        ;;
      *)
        echo ""
        echo "Invalid option, please select again."
        echo ""
        ;;
    esac
  done

  # Install commander module
  if npm install -g commander; then
    echo ""
    echo "commander installed successfully!"
  else
    echo ""
    echo "Installation of commander failed. Please try again or manually install the dependency."
    echo ""
    exit 1
  fi

  # Call the main program
  kwami
}

main
