#!/bin/bash

# Function to install kwami globally
function installKwamiGlobally() {
  echo "Installing kwami-cli globally..."
  npm install -g ./package/install.js

  # Add the npm global packages path to your system's PATH variable
  # You might need to adjust this based on your npm global packages path
  echo "export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/home/your-username/.npm-global/bin" >> ~/.bashrc
  source ~/.bashrc

  # Verify installation
  kwami --version
}

# Function to install kwami locally
function installKwamiLocally() {
  echo "Installing kwami-cli locally..."
  npm install ./package/install.js

  # Verify installation
  ./node_modules/.bin/kwami --version
}

# Check if running with root permissions
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run with 'sudo'. Please run it as a regular user."
   exit 1
fi

# Ask user if they want to install kwami locally or globally
echo "Do you want to install kwami locally or globally?"
select installOption in "Locally" "Globally"; do
  case $installOption in
    Locally)
      installKwamiLocally
      break
      ;;
    Globally)
      installKwamiGlobally
      break
      ;;
    *)
      echo "Invalid option, please select again."
      ;;
  esac
done

echo "kwami has been installed successfully! You can now use 'kwami' commands."
