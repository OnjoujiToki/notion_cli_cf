#!/usr/bin/env node

import 'dotenv/config';
import inquirer from 'inquirer';
import { fetchProblems } from './codeforces.js';
import { storeProblemsInNotion } from './notion.js';

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Please select an option:',
      choices: ['fetch and store problems', 'quit'],
    },
  ]);

  if (action === 'fetch and store problems') {
    const { tags, minDifficulty, maxDifficulty } = await inquirer.prompt([
      { type: 'input', name: 'tags', message: 'Tags (comma separated):' },
      { type: 'number', name: 'minDifficulty', message: 'Min Difficulty:' },
      { type: 'number', name: 'maxDifficulty', message: 'Max Difficulty:' },
    ]);

    const problems = await fetchProblems(
      tags.split(',').map((tag) => tag.trim()),
      minDifficulty,
      maxDifficulty
    );
    await storeProblemsInNotion(problems);

    console.log('Problems fetched and stored in Notion successfully.');
  } else if (action === 'quit') {
    console.log('Goodbye!');
    process.exit(0);
  }
}

main();
