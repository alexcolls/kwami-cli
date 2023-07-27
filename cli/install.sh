#!/bin/bash

# Function to install kwami globally with privileges
function installKwamiGlobally() {
  echo "Installing kwami globally with privileges..."
  
  # Installing required libraries
  echo "Installing required libraries..."
  sudo npm i -g figlet fs commander inquirer

  # Installing kwami
  echo "Installing kwami package..."
  sudo npm i -g ./

  # Verify installation
  if ! $(which kwami) --version &>/dev/null; then
    echo "Installation completed successfully!"
    
    # Create a symbolic link to make kwami accessible from anywhere
    sudo ln -sf "$(which kwami)" /usr/local/bin/kwami
    
    # Provide a success message for the symbolic link creation
    if [ -L "/usr/local/bin/kwami" ]; then
      echo "Symbolic link for 'kwami' created successfully!"
    else
      echo "Failed to create symbolic link for 'kwami'."
    fi
  else
    echo "Installation failed. Please try again or manually install kwami."
  fi
}

# Function to uninstall kwami globally with privileges
function uninstallKwamiGlobally() {
  echo "Uninstalling kwami..."
  
  # Uninstalling kwami
  sudo npm uninstall -g kwami-cli

  # Verify uninstallation
  if ! kwami --version &>/dev/null; then
    echo "Uninstallation completed successfully!"
    
    # Remove the symbolic link
    sudo rm -f /usr/local/bin/kwami
    
    # Provide a success message for the symbolic link removal
    if [ ! -L "/usr/local/bin/kwami" ]; then
      echo "Symbolic link for 'kwami' removed successfully!"
    fi
  else
    echo "Uninstallation failed. Please try again or manually uninstall kwami."
  fi
}

# Cool welcome with ASCII art
echo ""
cat ./ascii_art.txt
echo ""

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
