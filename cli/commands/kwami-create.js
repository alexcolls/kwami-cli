#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";

program.version("0.1.0");

program
  .command("create <kappName>")
  .description("Create a new kapp with a default folder structure")
  .action(async (kappName) => {
    try {
      const destination = path.join(process.cwd(), kappName);
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to create the kapp named "${kappName}"?`,
        },
      ]);

      if (!confirm) {
        console.log("Aborted.");
        return;
      }

      await fs.mkdir(destination, { recursive: true });

      const folders = ["src", "public", "config", "tests"];
      const files = ["index.js", "index.html", "config.json"];

      for (const folder of folders) {
        await fs.mkdir(path.join(destination, folder));
      }

      for (const file of files) {
        await fs.writeFile(path.join(destination, file), "");
      }

      console.log(`Kapp "${kappName}" created successfully!`);
    } catch (err) {
      console.error("An error occurred:", err);
    }
  });

program.parse(process.argv);
