import axios from 'axios';

export async function fetchProblems(tags, minDifficulty, maxDifficulty) {
  try {
    const response = await axios.get(
      'https://codeforces.com/api/problemset.problems',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://codeforces.com/',
          Connection: 'keep-alive',
        },
      }
    );

    const problems = response.data.result.problems;
    const problemStatistics = response.data.result.problemStatistics;
    console.log(`tags: ${tags.length}`);
    console.log(`Fetched ${problems.length} problems from Codeforces`);

    const filteredProblems = problems
      .filter((problem) => {
        // Check if tags are empty or problem contains at least one of the tags
        const matchesTags =
          tags.length === 0 || tags.some((tag) => problem.tags.includes(tag));

        // Check if problem's difficulty is within the specified range
        const matchesDifficulty =
          (!minDifficulty || problem.rating >= minDifficulty) &&
          (!maxDifficulty || problem.rating <= maxDifficulty);

        // Return true if both conditions are met
        return matchesTags && matchesDifficulty;
      })
      .map((problem) => {
        const stats = problemStatistics.find(
          (stat) =>
            stat.contestId === problem.contestId && stat.index === problem.index
        );
        return {
          ...problem,
          SolveCount: stats ? stats.solvedCount : 0,
        };
      });

    console.log(`Filtered down to ${filteredProblems.length} problems`);
    return filteredProblems;
  } catch (error) {
    console.error('Error fetching problems from Codeforces:', error);
    return [];
  }
}

export async function fetchSolvedProblems(handle) {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://codeforces.com/',
          Connection: 'keep-alive',
        },
      }
    );
    const submissions = response.data.result;

    const solvedProblems = submissions
      .filter((submission) => submission.verdict === 'OK')
      .map(
        (submission) =>
          `${submission.problem.contestId}-${submission.problem.index}`
      );

    return [...new Set(solvedProblems)]; // Remove duplicates
  } catch (error) {
    console.error(`Error fetching solved problems for user ${handle}:`, error);
    return [];
  }
}
