import axios from 'axios';

export async function fetchProblems(tags, minDifficulty, maxDifficulty) {
  try {
    const response = await axios.get(
      'https://codeforces.com/api/problemset.problems'
    );
    const problems = response.data.result.problems;

    return problems.filter((problem) => {
      const matchesTags = tags.every((tag) => problem.tags.includes(tag));
      const matchesDifficulty =
        (!minDifficulty || problem.rating >= minDifficulty) &&
        (!maxDifficulty || problem.rating <= maxDifficulty);
      return matchesTags && matchesDifficulty;
    });
  } catch (error) {
    console.error('Error fetching problems from Codeforces:', error);
    return [];
  }
}
