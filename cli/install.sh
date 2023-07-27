#!/bin/bash

# Cool welcome with ASCII art
echo ""
cat ./cli/ascii_art.txt
echo ""

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

  # Install Node.js and npm
  sudo apt-get update
  sudo apt-get install -y nodejs npm

  # Install Yarn
  sudo npm i -g yarn

  # Install Python
  sudo apt-get install -y python3

  echo ""
  echo "Global dependencies installed successfully!"
  echo ""
}

# Function to install kwami-cli dependencies and kwami program globally
function installKwamiGlobally() {
  echo ""
  echo "Installing kwami-cli dependencies and kwami globally..."
  echo ""

  # Navigate to the correct directory
  pushd ./cli

  # Install figlet, fs, inquirer
  sudo npm i -g figlet fs inquirer

  # Install kwami-cli
  if sudo npm i -g ./; then
    echo ""
    echo "We are done! kwami-cli is now installed! You can use it by calling \$ kwami in your terminal."
    echo ""
  else
    echo ""
    echo "Installation of kwami-cli failed. Please try again or manually install kwami-cli."
    echo ""
    # Return to the original directory
    popd
    return 1
  fi

  # Return to the original directory
  popd
}

# Function to uninstall Node.js, npm, Yarn, and Python if requested
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
      sudo apt-get remove -y nodejs npm

      # Uninstall Yarn
      sudo npm uninstall -g yarn

      # Uninstall Python
      sudo apt-get remove -y python3

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
  sudo npm uninstall -g figlet fs inquirer

  # Uninstall kwami-cli
  if sudo npm uninstall -g kwami-cli; then
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
