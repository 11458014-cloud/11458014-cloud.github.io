// Google Apps Script - 英文單字測驗程式
// 連接試算表：https://docs.google.com/spreadsheets/d/169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M/edit?usp=sharing

const SPREADSHEET_ID = '169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M';
const SHEET_NAME = '工作表1'; // 根據實際情況修改工作表名稱

// 全局變數
let vocabularyData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let totalQuestions = 0;

/**
 * 獲取測驗UI界面
 */
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('TestUI')
    .setWidth(800)
    .setHeight(600);
  return html;
}

/**
 * 從 Google Sheet 獲取英文單字資料
 * @returns {Array} 單字陣列
 */
function getVocabularyData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // 假設格式為：第1列是標題，之後的列為 [英文單字, 中文翻譯, ...]
    const vocabulary = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        vocabulary.push({
          english: data[i][0].toString().trim(),
          chinese: data[i][1].toString().trim(),
          index: i
        });
      }
    }
    
    Logger.log('取得單字數量：' + vocabulary.length);
    return vocabulary;
  } catch (error) {
    Logger.log('錯誤：' + error.toString());
    return [];
  }
}

/**
 * 初始化測驗
 * @param {number} numberOfQuestions 測驗題數
 * @returns {Object} 包含測驗信息的對象
 */
function initializeQuiz(numberOfQuestions) {
  vocabularyData = getVocabularyData();
  
  if (vocabularyData.length === 0) {
    return {
      success: false,
      message: '無法獲取單字資料，請檢查 Sheet ID 和工作表名稱'
    };
  }
  
  // 隨機打亂順序
  vocabularyData = shuffleArray(vocabularyData);
  
  // 限制題數不超過總單字數
  totalQuestions = Math.min(numberOfQuestions, vocabularyData.length);
  currentQuestionIndex = 0;
  userAnswers = [];
  
  return {
    success: true,
    totalQuestions: totalQuestions,
    firstQuestion: getNextQuestion()
  };
}

/**
 * 取得下一題
 * @returns {Object} 題目信息
 */
function getNextQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    return {
      finished: true,
      questionNumber: currentQuestionIndex + 1,
      totalQuestions: totalQuestions
    };
  }
  
  const question = vocabularyData[currentQuestionIndex];
  
  // 生成四個選項
  const options = generateOptions(question);
  
  return {
    finished: false,
    questionNumber: currentQuestionIndex + 1,
    totalQuestions: totalQuestions,
    english: question.english,
    options: options,
    correctAnswer: question.chinese
  };
}

/**
 * 生成選項（4個）
 * @param {Object} correctQuestion 正確的題目
 * @returns {Array} 打亂順序的4個選項
 */
function generateOptions(correctQuestion) {
  const options = [correctQuestion.chinese];
  
  // 隨機選擇其他選項
  const availableIndexes = [];
  for (let i = 0; i < vocabularyData.length; i++) {
    if (i !== currentQuestionIndex) {
      availableIndexes.push(i);
    }
  }
  
  // 隨機取3個其他選項
  for (let i = 0; i < 3 && availableIndexes.length > 0; i++) {
    const randomIdx = Math.floor(Math.random() * availableIndexes.length);
    const index = availableIndexes.splice(randomIdx, 1)[0];
    options.push(vocabularyData[index].chinese);
  }
  
  return shuffleArray(options);
}

/**
 * 提交答案並取得下一題
 * @param {string} userAnswer 用戶答案
 * @returns {Object} 下一題或結果
 */
function submitAnswer(userAnswer) {
  const currentQuestion = vocabularyData[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion.chinese;
  
  userAnswers.push({
    questionNumber: currentQuestionIndex + 1,
    english: currentQuestion.english,
    userAnswer: userAnswer,
    correctAnswer: currentQuestion.chinese,
    isCorrect: isCorrect
  });
  
  currentQuestionIndex++;
  
  return getNextQuestion();
}

/**
 * 計算最終分數和結果
 * @returns {Object} 分數和詳細結果
 */
function getQuizResults() {
  const correctCount = userAnswers.filter(ans => ans.isCorrect).length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  
  return {
    totalQuestions: totalQuestions,
    correctCount: correctCount,
    wrongCount: totalQuestions - correctCount,
    score: score,
    percentage: Math.round((correctCount / totalQuestions) * 100),
    details: userAnswers,
    passed: score >= 60  // 及格分數為 60 分
  };
}

/**
 * 陣列隨機打亂函數
 * @param {Array} array 要打亂的陣列
 * @returns {Array} 打亂後的陣列
 */
function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 取得所有單字列表（用於顯示）
 * @returns {Array} 單字列表
 */
function getAllVocabulary() {
  return getVocabularyData();
}

/**
 * 測試函數 - 檢查連接是否成功
 */
function testConnection() {
  const data = getVocabularyData();
  Logger.log('測試連接');
  Logger.log('取得單字數：' + data.length);
  if (data.length > 0) {
    Logger.log('第一個單字：' + data[0].english + ' - ' + data[0].chinese);
  }
}
