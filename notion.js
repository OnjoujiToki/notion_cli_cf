import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.DATABASE_ID;

export async function storeProblemsInNotion(problems) {
  for (const problem of problems) {
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
            number: problem.rating || 0,
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
