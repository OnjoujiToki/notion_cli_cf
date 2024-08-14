#!/usr/bin/env node

import 'dotenv/config';
import inquirer from 'inquirer';
import { fetchProblems, fetchSolvedProblems } from './codeforces.js';
import {
  storeProblemsInNotion,
  listProblems,
  archiveProblem,
  deleteAllProblems,
} from './notion.js';

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Please select an option:',
      choices: [
        'fetch and store problems',
        'list problems',
        'archive problem',
        'delete all problems',
        'quit',
      ],
    },
  ]);

  if (action === 'fetch and store problems') {
    const { handle, tags, minDifficulty, maxDifficulty, limit } =
      await inquirer.prompt([
        {
          type: 'input',
          name: 'handle',
          message: 'Enter your Codeforces handle:',
        },
        { type: 'input', name: 'tags', message: 'Tags (comma separated):' },
        { type: 'number', name: 'minDifficulty', message: 'Min Difficulty:' },
        { type: 'number', name: 'maxDifficulty', message: 'Max Difficulty:' },
        {
          type: 'number',
          name: 'limit',
          message: 'Limit the number of problems to fetch:',
          default: 500,
        },
      ]);

    const solvedProblems = await fetchSolvedProblems(handle);

    // Split the tags input, trim each tag, and filter out empty strings
    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    // Fetch the problems using the cleaned tags array
    let problems = await fetchProblems(tagArray, minDifficulty, maxDifficulty);

    const unsolvedProblems = problems
      .filter(
        (problem) =>
          !solvedProblems.includes(`${problem.contestId}-${problem.index}`)
      )
      .slice(0, limit);

    await storeProblemsInNotion(unsolvedProblems);

    console.log('Problems fetched and stored in Notion successfully.');
  } else if (action === 'list problems') {
    await listProblems();
  } else if (action === 'archive problem') {
    const { problemId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'problemId',
        message: 'Enter the ID of the problem to archive:',
      },
    ]);
    await archiveProblem(problemId);
    console.log('Problem archived successfully.');
  } else if (action === 'delete all problems') {
    await deleteAllProblems();
    console.log('All problems deleted successfully.');
  } else if (action === 'quit') {
    console.log('Goodbye!');
    process.exit(0);
  }
}

main();
