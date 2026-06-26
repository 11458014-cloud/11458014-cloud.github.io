// Google Apps Script - 英文單字測驗
// 參考試算表 ID: 169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M

const SPREADSHEET_ID = "169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M";
const SHEET_NAME = "Sheet1"; // 調整為實際的工作表名稱

// 從試算表獲取單字列表
function getVocabulary() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const vocabulary = [];
    // 假設格式為: 第1列=英文單字, 第2列=中文翻譯
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        vocabulary.push({
          word: data[i][0].toString().trim(),
          translation: data[i][1].toString().trim()
        });
      }
    }
    
    return vocabulary;
  } catch (error) {
    Logger.log("錯誤: " + error);
    return [];
  }
}

// 生成選擇題
function generateQuestions(vocabulary, questionCount = 10) {
  if (vocabulary.length === 0) {
    return [];
  }
  
  const questions = [];
  const shuffled = vocabulary.sort(() => Math.random() - 0.5);
  const selectedCount = Math.min(questionCount, vocabulary.length);
  
  for (let i = 0; i < selectedCount; i++) {
    const correctAnswer = shuffled[i];
    
    // 生成3個錯誤選項
    const wrongAnswers = [];
    const used = new Set([i]);
    
    while (wrongAnswers.length < 3 && used.size < vocabulary.length) {
      const randomIdx = Math.floor(Math.random() * vocabulary.length);
      if (!used.has(randomIdx) && randomIdx !== i) {
        wrongAnswers.push(shuffled[randomIdx].translation);
        used.add(randomIdx);
      }
    }
    
    // 如果找不到足夠的錯誤選項，使用虛擬選項
    while (wrongAnswers.length < 3) {
      wrongAnswers.push("選項 " + (wrongAnswers.length + 1));
    }
    
    // 混合正確和錯誤答案
    const options = [correctAnswer.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer.translation);
    
    questions.push({
      word: correctAnswer.word,
      options: options,
      correctAnswerIndex: correctIndex,
      correctAnswer: correctAnswer.translation
    });
  }
  
  return questions;
}

// 計算分數
function calculateScore(answers, questions) {
  let correctCount = 0;
  
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] === questions[i].correctAnswerIndex) {
      correctCount++;
    }
  }
  
  const score = Math.round((correctCount / questions.length) * 100);
  return {
    score: score,
    correct: correctCount,
    total: questions.length,
    percentage: correctCount / questions.length * 100
  };
}

// 部署為 Web App
function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 取得題目資料
function getQuestions() {
  const vocabulary = getVocabulary();
  
  if (vocabulary.length === 0) {
    return {
      success: false,
      message: "無法從試算表獲取單字資料。請檢查：1.試算表ID是否正確 2.工作表名稱是否正確 3.是否有權限訪問試算表"
    };
  }
  
  const questionCount = Math.min(10, vocabulary.length);
  const questions = generateQuestions(vocabulary, questionCount);
  
  // 將問題保存到PropertiesService以供驗證使用
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('quizQuestions', JSON.stringify(questions));
  userProperties.setProperty('quizTimestamp', new Date().getTime().toString());
  
  return {
    success: true,
    questions: questions.map(q => ({
      word: q.word,
      options: q.options
    }))
  };
}

// 批改答案
function submitAnswers(answers) {
  const userProperties = PropertiesService.getUserProperties();
  const storedQuestionsJson = userProperties.getProperty('quizQuestions');
  const timestamp = userProperties.getProperty('quizTimestamp');
  
  // 檢查是否超時（30分鐘）
  const now = new Date().getTime();
  const timeLimit = 30 * 60 * 1000;
  
  if (!storedQuestionsJson || !timestamp || (now - parseInt(timestamp) > timeLimit)) {
    return {
      success: false,
      message: "測驗已過期，請重新開始"
    };
  }
  
  const questions = JSON.parse(storedQuestionsJson);
  
  // 驗證答案數量
  if (!answers || answers.length !== questions.length) {
    return {
      success: false,
      message: "答案數量不匹配"
    };
  }
  
  const result = calculateScore(answers, questions);
  
  // 清除存儲的問題
  userProperties.deleteProperty('quizQuestions');
  userProperties.deleteProperty('quizTimestamp');
  
  return {
    success: true,
    score: result.score,
    correct: result.correct,
    total: result.total,
    percentage: result.percentage.toFixed(2),
    answers: questions.map((q, idx) => ({
      word: q.word,
      correctAnswer: q.correctAnswer,
      userAnswer: q.options[answers[idx]] || "未選擇",
      isCorrect: answers[idx] === q.correctAnswerIndex
    }))
  };
}
