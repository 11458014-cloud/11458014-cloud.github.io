# 英文單字測驗 - Google Apps Script

## 說明

這是一個完整的 Google Apps Script（GAS）解決方案，用於進行英文單字測驗。

## 功能特性

✅ **動態單字提取** - 從 Google Sheet 自動提取英文單字和翻譯  
✅ **隨機題目順序** - 每次測驗題目順序都不同  
✅ **多選題格式** - 4 個選項，每次隨機排序  
✅ **滿分 100 制** - 自動計算分數（總分 = 正確數/總題數 × 100）  
✅ **詳細成績單** - 顯示每題的答對/答錯情況  
✅ **及格判定** - 60 分及以上為及格  
✅ **自適應 UI** - 響應式設計，支持各種設備  

## 使用步驟

### 1. 建立 Google Apps Script 項目

1. 在 Google Sheet 中打開你的英文單字試算表
   - 連結：https://docs.google.com/spreadsheets/d/169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M/edit?usp=sharing

2. 選擇 **工具** > **指令碼編輯器** 開啟 Apps Script

3. 複製 `Code.gs` 文件中的所有代碼到指令碼編輯器

### 2. 建立 HTML 文件

1. 在指令碼編輯器中，選擇 **+ 新增檔案** > **HTML**

2. 將其命名為 `TestUI`

3. 複製 `TestUI.html` 中的所有代碼到該文件

### 3. 配置試算表

在 `Code.gs` 中修改以下變數以匹配你的試算表：

```javascript
const SPREADSHEET_ID = '169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M';
const SHEET_NAME = '工作表1';  // 修改為你的工作表名稱
```

你的試算表格式應該為：
| 英文單字 | 中文翻譯 |
|---------|---------|
| Apple   | 蘋果    |
| Book    | 書      |
| Cat     | 貓      |

### 4. 部署應用

1. 點擊 **部署** > **新增部署**

2. 選擇類型為 **網頁應用**

3. 執行者選擇 **我** 

4. 誰可以存取選擇 **任何人**

5. 複製部署連結並在瀏覽器中打開

## 試算表格式要求

試算表必須有以下結構：

- **第 1 列**：標題行（英文、中文）
- **第 2 列及以後**：單字資料
- **第 1 欄**：英文單字
- **第 2 欄**：中文翻譯

示例：
```
英文 | 中文
----|----
Hello | 你好
World | 世界
Learn | 學習
```

## API 函數文檔

### `initializeQuiz(numberOfQuestions)`
初始化測驗

**參數：**
- `numberOfQuestions` (number): 測驗題數

**返回值：**
```javascript
{
  success: true/false,
  totalQuestions: number,
  firstQuestion: {
    finished: false,
    questionNumber: 1,
    totalQuestions: 10,
    english: "Hello",
    options: ["你好", "世界", "學習", "書"],
    correctAnswer: "你好"
  }
}
```

### `getNextQuestion()`
取得下一題

**返回值：** 同上

### `submitAnswer(userAnswer)`
提交答案並取得下一題

**參數：**
- `userAnswer` (string): 用戶選擇的答案

**返回值：** 下一題對象

### `getQuizResults()`
計算最終分數

**返回值：**
```javascript
{
  totalQuestions: 10,
  correctCount: 9,
  wrongCount: 1,
  score: 90,
  percentage: 90,
  details: [...],
  passed: true
}
```

### `getAllVocabulary()`
取得所有單字列表

**返回值：**
```javascript
[
  { english: "Hello", chinese: "你好", index: 1 },
  { english: "Book", chinese: "書", index: 2 },
  ...
]
```

## 分數計算

- **總分 = 100**
- **每題分值 = 100 / 總題數**
- **最終分數 = 正確題數 × 每題分值**

例如：10 題測驗，答對 9 題
- 分數 = (9 / 10) × 100 = 90 分

## 故障排除

### 問題 1：無法獲取單字資料
**解決方案：**
- 檢查 `SPREADSHEET_ID` 是否正確
- 檢查工作表名稱是否匹配 `SHEET_NAME`
- 確保試算表有 View 權限

### 問題 2：選項為空或不完整
**解決方案：**
- 確保試算表第 1 欄和第 2 欄都有數據
- 檢查是否有空行

### 問題 3：分數計算不正確
**解決方案：**
- 確認答案與試算表中的翻譯完全相同（區分大小寫和空格）

## 修改和擴展

### 修改及格分數
在 `getQuizResults()` 函數中修改：
```javascript
passed: score >= 60  // 修改 60 為你想要的及格線
```

### 改變選項數量
在 `generateOptions()` 函數中修改循環次數：
```javascript
for (let i = 0; i < 3 && availableIndexes.length > 0; i++)  // 改為你想要的數量 - 1
```

### 自定義 UI 樣式
直接編輯 `TestUI.html` 中的 CSS 部分

## 許可證

MIT License

## 支持

如有問題，請檢查：
1. Sheet ID 是否正確
2. 試算表格式是否符合要求
3. 瀏覽器控制台（F12）中是否有錯誤信息
