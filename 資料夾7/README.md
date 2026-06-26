# 英文單字測驗 - Google Apps Script

一個完整的英文單字測驗系統，使用 Google Apps Script 從 Google 試算表自動提取單字。

## 功能特性

✅ **簡單易用** - 自動從 Google 試算表讀取單字  
✅ **選擇題模式** - 全部為單選題，4個選項  
✅ **自動評分** - 滿分100，自動計算分數  
✅ **美觀界面** - 現代化的響應式設計  
✅ **詳細回顧** - 完成後查看所有題目的答案分析  

## 設置步驟

### 1. 準備 Google 試算表

確保您的試算表結構如下：
- **第1列**: 標題行（可選）
- **第2列開始**:
  - A欄: 英文單字
  - B欄: 中文翻譯（或其他語言）

示例：
```
| 英文單字 | 中文翻譯 |
|---------|--------|
| apple   | 蘋果   |
| book    | 書     |
| cat     | 貓     |
```

參考試算表：https://docs.google.com/spreadsheets/d/169b8NtWtT2oJnLRkam-p21sBIGrScyEpfzGVwsUeT2M

### 2. 創建 Google Apps Script 專案

1. 打開 Google 雲端硬碟
2. 點擊「+ 建立」→ 「更多」→ 「Google Apps Script」
3. 將提供的代碼複製到編輯器中

### 3. 配置試算表 ID 和工作表名稱

打開 `Code.gs` 文件，修改以下內容：

```javascript
const SPREADSHEET_ID = "你的試算表ID";
const SHEET_NAME = "工作表名稱"; // 默認為 "Sheet1"
```

如何獲取試算表 ID：
- 打開您的 Google 試算表
- 從 URL 中複製 ID：`https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 4. 部署為 Web 應用

1. 在 Google Apps Script 編輯器中，點擊「部署」
2. 選擇「新增部署」→ 選擇類型 → 「Web 應用」
3. 執行身份：選擇您的帳戶
4. 可以存取的使用者：選擇「任何人」或「指定人員」
5. 點擊「部署」
6. 複製生成的 URL

### 5. 使用應用

在瀏覽器中打開部署的 URL 即可開始測驗。

## 文件說明

| 文件 | 說明 |
|------|------|
| `Code.gs` | Google Apps Script 主程式碼 |
| `Index.html` | 測驗前端 HTML 和 CSS/JavaScript |
| `README.md` | 本說明文檔 |

## 功能詳解

### 自動生成選擇題

系統會：
1. 從試算表中隨機選擇單字
2. 自動從其他單字中選擇錯誤選項
3. 將所有選項進行隨機排序
4. 生成格式化的選擇題

### 評分系統

- **滿分**: 100 分
- **計算方式**: (正確答案數 / 總題數) × 100
- **最多題目**: 取決於試算表中的單字數量（默認10題）

### 詳細反饋

完成測驗後，用戶可以：
- 查看總分和正確率
- 逐題回顧各自的答案
- 對比正確答案
- 了解自己的學習情況

## 故障排除

### 錯誤: "無法從試算表獲取單字資料"

**原因**:
1. 試算表 ID 不正確
2. 工作表名稱不正確
3. 無權限訪問試算表
4. 試算表中沒有數據

**解決**:
- 檢查 `Code.gs` 中的 `SPREADSHEET_ID` 和 `SHEET_NAME`
- 確保試算表在 Google 雲端硬碟中可訪問
- 確保試算表至少有2行數據（標題+至少1個單字）

### 應用加載緩慢

- 等待網絡連接穩定
- 檢查是否有多個標籤同時訪問應用
- 嘗試清除瀏覽器緩存

## 自定義選項

### 修改題目數量

編輯 `Code.gs` 中的：
```javascript
const questionCount = 10; // 改為其他數字
```

### 修改題目選項數量

編輯 `Code.gs` 中的 `generateQuestions` 函數：
```javascript
while (wrongAnswers.length < 3) { // 改為其他數字
    // ...
}
```

### 自定義評分標準

編輯 `Index.html` 中的結果判斷：
```javascript
if (result.score === 100) {
    message = '🎉 完美！滿分通過！';
} else if (result.score >= 80) {
    message = '😊 不錯！繼續加油！';
}
// ... 根據需要修改
```

## 技術棧

- **後端**: Google Apps Script
- **前端**: HTML5, CSS3, Vanilla JavaScript
- **數據源**: Google 試算表
- **部署**: Google Apps Script Web App

## 許可證

自由使用和修改。

## 支持

如遇問題，請檢查：
1. 試算表連接是否正確
2. Google Apps Script 權限設置
3. 瀏覽器控制台是否有錯誤信息（F12 打開開發者工具）
