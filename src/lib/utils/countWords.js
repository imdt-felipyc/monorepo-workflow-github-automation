export default function countMainWords(expectedAnswer) {
    const rawTokens = expectedAnswer.trim().split(/\s+/);
    const combinedTokens = [];
  
    // Merge "@@word" followed by "|variant" into a single token
    for (let index = 0; index < rawTokens.length; index++) {
      let currentToken = rawTokens[index];
  
      if (
        currentToken.startsWith('@@') &&
        index + 1 < rawTokens.length &&
        rawTokens[index + 1].startsWith('|')
      ) {
        currentToken += rawTokens[index + 1]; // Merge with the next token
        index++; // Skip the next token
      }
  
      combinedTokens.push(currentToken);
    }
  
    // Count only the primary words (the first option in @@tokens)
    let mainWordCount = 0;
  
    for (const token of combinedTokens) {
      if (token.startsWith('@@')) {
        const options = token.slice(2).split('|');
        if (options[0]) mainWordCount++;
      } else {
        mainWordCount++;
      }
    }
  
    return mainWordCount;
  }
