#c

const { exec } = require("child_process");

function installKwami() {
  console.log("Installing kwami globally...");
  exec(
    "npm install -g /path/to/your/kwami/package",
    (error, stdout, stderr) => {
      if (error) {
        console.error("An error occurred during installation:", error.message);
      } else {
        console.log("kwami has been installed successfully!");
        console.log(stdout);
        console.error(stderr);
      }
    }
  );
}

installKwami();
