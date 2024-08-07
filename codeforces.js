import axios from 'axios';

export async function fetchProblems(tags, minDifficulty, maxDifficulty) {
  try {
    const response = await axios.get(
      'https://codeforces.com/api/problemset.problems'
    );
    const problems = response.data.result.problems;
    const problemStatistics = response.data.result.problemStatistics;

    return problems
      .filter((problem) => {
        const matchesTags = tags.every((tag) => problem.tags.includes(tag));
        const matchesDifficulty =
          (!minDifficulty || problem.rating >= minDifficulty) &&
          (!maxDifficulty || problem.rating <= maxDifficulty);
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
  } catch (error) {
    console.error('Error fetching problems from Codeforces:', error);
    return [];
  }
}

export async function fetchSolvedProblems(handle) {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
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
