import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.DATABASE_ID;

const difficultyColors = {
  2900: 'red',
  2600: 'red',
  2400: 'red',
  2300: 'orange',
  2200: 'orange',
  1900: 'purple',
  1600: 'blue',
  1400: 'cyan',
  1200: 'green',
  0: 'gray',
};

function getDifficultyColor(rating) {
  if (rating >= 2900) return difficultyColors[2900];
  if (rating >= 2600) return difficultyColors[2600];
  if (rating >= 2400) return difficultyColors[2400];
  if (rating >= 2300) return difficultyColors[2300];
  if (rating >= 2200) return difficultyColors[2200];
  if (rating >= 1900) return difficultyColors[1900];
  if (rating >= 1600) return difficultyColors[1600];
  if (rating >= 1400) return difficultyColors[1400];
  if (rating >= 1200) return difficultyColors[1200];
  return difficultyColors[0];
}

export async function storeProblemsInNotion(problems) {
  for (const problem of problems) {
    const difficultyColor = getDifficultyColor(problem.rating || 0);
    const difficultyText = (problem.rating || 0).toString();
    const solveCountText = (problem.SolveCount || 0).toString();

    try {
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Problem: {
            title: [
              {
                text: {
                  content: problem.name,
                },
              },
            ],
          },
          Tag: {
            multi_select: problem.tags.map((tag) => ({ name: tag })),
          },
          Difficulty: {
            rich_text: [
              {
                text: {
                  content: difficultyText,
                },
                annotations: {
                  color: difficultyColor,
                },
              },
            ],
          },
          SolveCount: {
            rich_text: [
              {
                text: {
                  content: solveCountText,
                },
              },
            ],
          },
          Link: {
            url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
          },
        },
      });
    } catch (error) {
      console.error('Error storing problem in Notion:', error);
    }
  }
}

export async function listProblems() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });
    const problems = response.results.map((page) => ({
      id: page.id,
      name: page.properties.Problem.title[0]?.text.content,
      difficulty: page.properties.Difficulty.rich_text[0]?.text.content,
      solveCount: page.properties.SolveCount.rich_text[0]?.text.content,
      link: page.properties.Link.url,
    }));

    console.log('Problems:');
    problems.forEach((problem, index) => {
      console.log(
        `${index + 1}. ${problem.name} - Difficulty: ${
          problem.difficulty
        } - Solves: ${problem.solveCount} - ${problem.link} (ID: ${problem.id})`
      );
    });
  } catch (error) {
    console.error('Error listing problems:', error);
  }
}

export async function archiveProblem(problemId) {
  try {
    await notion.pages.update({
      page_id: problemId,
      archived: true,
    });
    console.log('Problem archived successfully.');
  } catch (error) {
    console.error('Error archiving problem:', error);
  }
}

export async function deleteAllProblems() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });

    for (const page of response.results) {
      await notion.pages.update({
        page_id: page.id,
        archived: true,
      });
    }

    console.log('All problems deleted successfully.');
  } catch (error) {
    console.error('Error deleting all problems:', error);
  }
}
