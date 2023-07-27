#!/bin/bash

echo chmod +x ./install.sh

# Function to install kwami globally with privileges
function installKwamiGlobally() {
  echo "Installing kwami globally with privileges..."
  sudo npm i -g ./.

  # Verify installation
  kwami --version
}

# Function to uninstall kwami globally with privileges
function uninstallKwamiGlobally() {
  echo "Uninstalling kwami..."
  sudo npm uninstall -g kwami-cli

  # Verify uninstallation
  kwami --version 2>/dev/null
  if [[ $? -eq 0 ]]; then
    echo "Uninstallation failed. Please try again or manually uninstall kwami."
  else
    echo "Uninstallation completed successfully!"
  fi
}

# Check if running with root permissions
if [[ $EUID -eq 0 ]]; then
  echo "This script should not be run with 'sudo'. Please run it as a regular user."
  exit 1
fi

# Ask user if they want to install or uninstall kwami globally with privileges
echo "Do you want to install or uninstall kwami globally?"
select installOption in "Install" "Uninstall" "Cancel"; do
  case $installOption in
    Install)
      installKwamiGlobally
      break
      ;;
    Uninstall)
      uninstallKwamiGlobally
      break
      ;;
    Cancel)
      echo "Installation/uninstallation canceled."
      break
      ;;
    *)
      echo "Invalid option, please select again."
      ;;
  esac
done
