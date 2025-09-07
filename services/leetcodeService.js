const axios = require('axios');
const POTD = require('../models/potd');

// GraphQL query to get problem of the day info
const getProblemOfDayQuery = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      question {
        title
      }
    }
  }
`;

// GraphQL query for recent accepted submissions
const getRecentAcSubmissionsQuery = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      title
      timestamp
    }
  }
`;

// Function to get problem of the day
const getProblemOfDay = async () => {
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: getProblemOfDayQuery
      },
      timeout: 5000 // 5 second timeout
    });
    
    return {
      date: response.data.data.activeDailyCodingChallengeQuestion.date,
      title: response.data.data.activeDailyCodingChallengeQuestion.question.title
    };
  } catch (error) {
    console.error('Error fetching problem of the day:', error.message);
    throw error;
  }
};

// Function to get today's POTD from database
const getTodayPOTD = async () => {
  try {
    return await POTD.getTodayPOTD();
  } catch (error) {
    console.error('Error fetching POTD from database:', error.message);
    throw error;
  }
};

// Function to get recent accepted submissions
const getRecentAcceptedSubmissions = async (username, limit = 10) => {
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: getRecentAcSubmissionsQuery,
        variables: {
          username: username,
          limit: limit
        }
      },
      timeout: 5000 // 5 second timeout
    });
    
    return response.data.data.recentAcSubmissionList;
   
  } catch (error) {
    console.error('Error fetching recent submissions:', error.message);
    throw error;
  }
};

// Main function to check if problem of the day is solved
const isProblemOfDaySolved = async (username) => {
  try {
    const [recentSubmissions, potd] = await Promise.all([
      getRecentAcceptedSubmissions(username),
      getTodayPOTD()
    ]);
    
    if (!potd) {
      throw new Error('POTD not found in database');
    }
    
    // Parse POTD date in UTC
    const problemOfDayDate = new Date(potd.date);
    
    // Check if the problem of the day is in the recent submissions
    const isSolved = recentSubmissions.some(submission => {
      // Parse submission timestamp in UTC
      const submissionDate = new Date(submission.timestamp * 1000);
      
      // Check if submission is from today and matches the POTD title
      return submissionDate.getUTCDate() === problemOfDayDate.getUTCDate() &&
             submissionDate.getUTCMonth() === problemOfDayDate.getUTCMonth() &&
             submissionDate.getUTCFullYear() === problemOfDayDate.getUTCFullYear() &&
             submission.title === potd.title;
    });
    
    return {
      isSolved,
      problemOfDay: potd
    };
  } catch (error) {
    console.error('Error checking if POTD is solved:', error.message);
    throw error;
  }
};


const getUserProfileQuery = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

/**
 * Fetch comprehensive statistics for a LeetCode user
 * @param {string} username - LeetCode username
 * @returns {Object} User statistics including problems solved by difficulty
 */
const getUserStats = async (username) => {
  if (!username) {
    throw new Error('Username is required');
  }

  try {
    console.log(`🔍 Fetching LeetCode statistics for user: ${username}`);
    
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: getUserProfileQuery,
        variables: {
          username: username
        }
      },
      timeout: 8000 // 8 second timeout
    });

    const userData = response.data.data.matchedUser;
    
    if (!userData) {
      throw new Error(`User '${username}' not found on LeetCode`);
    }

    // Format the response data into a cleaner structure
    const stats = {
      username: userData.username,
      totalSolved: 0,
      solvedByDifficulty: {},
      submissionsByDifficulty: {}
    };

    // Process problems solved by difficulty
    if (userData.submitStats && userData.submitStats.acSubmissionNum) {
      userData.submitStats.acSubmissionNum.forEach(item => {
        if (item.difficulty !== "All") {
          stats.solvedByDifficulty[item.difficulty.toLowerCase()] = item.count;
          stats.submissionsByDifficulty[item.difficulty.toLowerCase()] = item.submissions;
        } else {
          stats.totalSolved = item.count;
          stats.totalSubmissions = item.submissions;
        }
      });
    }
    
    console.log(`✅ Successfully fetched stats for user: ${userData}`);
    return stats;
  } catch (error) {
    console.error(`❌ Error fetching user stats: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    throw new Error(`Failed to fetch LeetCode statistics: ${error.message}`);
  }
};





// Don't forget to add this to your module exports
module.exports = {
  getProblemOfDay,
  getTodayPOTD,
  getRecentAcceptedSubmissions,
  isProblemOfDaySolved,
  getUserStats  // Add the new function to exports
};