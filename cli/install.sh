#!/bin/bash

# Function to install kwami globally with privileges
function installKwamiGlobally() {
  echo "Installing kwami globally with privileges..."
  sudo npm i -g ./package/kwami-cli

  # Verify installation
  kwami --version
}

# Check if running with root permissions
if [[ $EUID -eq 0 ]]; then
  echo "This script should not be run with 'sudo'. Please run it as a regular user."
  exit 1
fi

# Ask user if they want to install kwami globally with privileges
echo "Do you want to install kwami globally with privileges?"
select installOption in "Yes" "No"; do
  case $installOption in
    Yes)
      installKwamiGlobally
      break
      ;;
    No)
      echo "Installation canceled."
      break
      ;;
    *)
      echo "Invalid option, please select again."
      ;;
  esac
done

echo "Installation completed successfully!"
