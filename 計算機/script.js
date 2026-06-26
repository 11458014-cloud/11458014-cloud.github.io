// 計算器核心邏輯
class EngineeringCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.historyList = document.getElementById('history-list');
        this.currentInput = '0';
        this.operator = null;
        this.previousValue = null;
        this.history = [];
        this.radianMode = true; // 三角函數使用弧度制
        
        this.initializeBasicMode();
        this.initializeScientificMode();
        this.initializeComplexMode();
        this.initializeMatrixMode();
        this.initializeUnitsMode();
        this.setupModeButtons();
        this.updateDisplay();
    }

    // 基本計算器初始化
    initializeBasicMode() {
        document.querySelectorAll('#basic-mode [data-value]').forEach(btn => {
            btn.addEventListener('click', () => this.inputNumber(btn.dataset.value));
        });

        document.querySelectorAll('#basic-mode [data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.setOperator(btn.dataset.operator));
        });

        document.querySelectorAll('#basic-mode [data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
        });
    }

    // 科學計算器初始化
    initializeScientificMode() {
        document.querySelectorAll('#scientific-mode [data-value]').forEach(btn => {
            btn.addEventListener('click', () => this.inputNumber(btn.dataset.value));
        });

        document.querySelectorAll('#scientific-mode [data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.setOperator(btn.dataset.operator));
        });

        document.querySelectorAll('#scientific-mode [data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
        });

        document.querySelectorAll('#scientific-mode [data-function]').forEach(btn => {
            btn.addEventListener('click', () => this.applyFunction(btn.dataset.function));
        });
    }

    // 複數模式初始化
    initializeComplexMode() {
        document.getElementById('generate-matrix').addEventListener('click', () => {
            this.generateMatrix();
        });

        const generateMatrixBtn = document.getElementById('generate-matrix');
        if (generateMatrixBtn) {
            generateMatrixBtn.textContent = '輸入複數';
            generateMatrixBtn.addEventListener('click', () => {
                const real = parseFloat(document.getElementById('complex-real').value || 0);
                const imag = parseFloat(document.getElementById('complex-imag').value || 0);
                this.complexNumber1 = { real, imag };
                this.updateDisplay();
            });
        }
    }

    // 矩陣模式初始化
    initializeMatrixMode() {
        document.getElementById('matrix-size').addEventListener('change', () => {
            this.generateMatrixInput();
        });

        document.getElementById('generate-matrix').addEventListener('click', () => {
            this.generateMatrixInput();
        });

        document.querySelectorAll('[data-matrix-op]').forEach(btn => {
            btn.addEventListener('click', () => this.handleMatrixOperation(btn.dataset.matrixOp));
        });

        document.querySelectorAll('[data-matrix-func]').forEach(btn => {
            btn.addEventListener('click', () => this.handleMatrixFunction(btn.dataset.matrixFunc));
        });
    }

    // 單位轉換模式初始化
    initializeUnitsMode() {
        document.getElementById('unit-type').addEventListener('change', () => {
            this.updateUnitOptions();
        });

        document.getElementById('convert-btn').addEventListener('click', () => {
            this.convertUnits();
        });

        this.updateUnitOptions();
    }

    // 模式切換
    setupModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.mode-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const modeId = btn.dataset.mode + '-mode';
                document.getElementById(modeId).classList.add('active');
            });
        });
    }

    // 輸入數字
    inputNumber(num) {
        if (this.currentInput === '0' && num !== '.') {
            this.currentInput = num;
        } else if (num === '.' && this.currentInput.includes('.')) {
            return;
        } else {
            this.currentInput += num;
        }
        this.updateDisplay();
    }

    // 設置運算符
    setOperator(op) {
        if (this.operator !== null && this.currentInput !== '0') {
            this.calculate();
        }
        this.operator = op;
        this.previousValue = parseFloat(this.currentInput);
        this.currentInput = '0';
    }

    // 處理動作
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.currentInput = '0';
                this.operator = null;
                this.previousValue = null;
                break;
            case 'delete':
                this.currentInput = this.currentInput.slice(0, -1) || '0';
                break;
            case 'percent':
                this.currentInput = (parseFloat(this.currentInput) / 100).toString();
                break;
            case 'negate':
                this.currentInput = (parseFloat(this.currentInput) * -1).toString();
                break;
            case 'equals':
                this.calculate();
                break;
        }
        this.updateDisplay();
    }

    // 計算
    calculate() {
        if (this.operator === null || this.previousValue === null) return;

        const current = parseFloat(this.currentInput);
        let result = 0;

        switch (this.operator) {
            case '+':
                result = this.previousValue + current;
                break;
            case '-':
                result = this.previousValue - current;
                break;
            case '*':
                result = this.previousValue * current;
                break;
            case '/':
                result = this.previousValue / current;
                break;
        }

        const expression = `${this.previousValue} ${this.operator} ${current} = ${result}`;
        this.addToHistory(expression);
        
        this.currentInput = result.toString();
        this.operator = null;
        this.previousValue = null;
    }

    // 應用科學函數
    applyFunction(func) {
        let value = parseFloat(this.currentInput);
        let result = 0;

        switch (func) {
            case 'sin':
                result = this.radianMode ? Math.sin(value) : Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = this.radianMode ? Math.cos(value) : Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = this.radianMode ? Math.tan(value) : Math.tan(value * Math.PI / 180);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'pow2':
                result = value * value;
                break;
            case 'pow3':
                result = value * value * value;
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'exp':
                result = Math.exp(value);
                break;
            case 'pi':
                this.currentInput = Math.PI.toString();
                this.updateDisplay();
                return;
            case 'e':
                this.currentInput = Math.E.toString();
                this.updateDisplay();
                return;
            case 'factorial':
                result = this.factorial(Math.floor(value));
                break;
        }

        this.currentInput = result.toString();
        this.updateDisplay();
    }

    // 階乘
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // 複數操作
    handleComplexOperation(op) {
        const real1 = parseFloat(document.getElementById('complex-real').value || 0);
        const imag1 = parseFloat(document.getElementById('complex-imag').value || 0);

        // 模擬輸入第二個複數
        const real2 = parseFloat(prompt('輸入第二個複數的實部:') || 0);
        const imag2 = parseFloat(prompt('輸入第二個複數的虛部:') || 0);

        let resultReal, resultImag;

        switch (op) {
            case 'add':
                resultReal = real1 + real2;
                resultImag = imag1 + imag2;
                break;
            case 'subtract':
                resultReal = real1 - real2;
                resultImag = imag1 - imag2;
                break;
            case 'multiply':
                // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
                resultReal = real1 * real2 - imag1 * imag2;
                resultImag = real1 * imag2 + imag1 * real2;
                break;
            case 'divide':
                // (a + bi)/(c + di) = ((ac + bd) + (bc - ad)i) / (c² + d²)
                const denominator = real2 * real2 + imag2 * imag2;
                resultReal = (real1 * real2 + imag1 * imag2) / denominator;
                resultImag = (imag1 * real2 - real1 * imag2) / denominator;
                break;
        }

        this.displayComplexResult(resultReal, resultImag);
    }

    // 複數函數
    handleComplexFunction(func) {
        const real = parseFloat(document.getElementById('complex-real').value || 0);
        const imag = parseFloat(document.getElementById('complex-imag').value || 0);

        let resultReal, resultImag;

        switch (func) {
            case 'magnitude':
                const magnitude = Math.sqrt(real * real + imag * imag);
                document.getElementById('complex-result').textContent = `模: ${magnitude.toFixed(6)}`;
                return;
            case 'conjugate':
                resultReal = real;
                resultImag = -imag;
                this.displayComplexResult(resultReal, resultImag);
                break;
            case 'clear':
                document.getElementById('complex-real').value = '';
                document.getElementById('complex-imag').value = '';
                document.getElementById('complex-result').textContent = '';
                break;
        }
    }

    // 顯示複數結果
    displayComplexResult(real, imag) {
        const result = imag >= 0 
            ? `${real.toFixed(6)} + ${imag.toFixed(6)}i`
            : `${real.toFixed(6)} - ${Math.abs(imag).toFixed(6)}i`;
        document.getElementById('complex-result').textContent = `結果: ${result}`;
        this.addToHistory(`複數運算 = ${result}`);
    }

    // 矩陣操作
    generateMatrixInput() {
        const size = document.getElementById('matrix-size').value;
        const [rows, cols] = size.split('x').map(Number);
        const matrixInput = document.getElementById('matrix-input');
        matrixInput.innerHTML = '';

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.placeholder = `${i + 1},${j + 1}`;
                input.dataset.row = i;
                input.dataset.col = j;
                row.appendChild(input);
            }
            matrixInput.appendChild(row);
        }
    }

    // 獲取矩陣數據
    getMatrixData() {
        const size = document.getElementById('matrix-size').value;
        const [rows, cols] = size.split('x').map(Number);
        const matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                matrix[i][j] = parseFloat(input.value || 0);
            }
        }
        return matrix;
    }

    // 矩陣運算
    handleMatrixOperation(op) {
        try {
            const matrix = this.getMatrixData();
            let result = '';

            switch (op) {
                case 'transpose':
                    result = this.transposeMatrix(matrix);
                    break;
                case 'determinant':
                    if (matrix.length === matrix[0].length) {
                        result = `行列式: ${this.calculateDeterminant(matrix).toFixed(6)}`;
                    } else {
                        result = '只有方陣才能計算行列式';
                    }
                    break;
                case 'inverse':
                    if (matrix.length === matrix[0].length) {
                        result = this.invertMatrix(matrix);
                    } else {
                        result = '只有方陣才能求反矩陣';
                    }
                    break;
            }

            document.getElementById('matrix-result').textContent = result;
        } catch (e) {
            document.getElementById('matrix-result').textContent = `錯誤: ${e.message}`;
        }
    }

    // 矩陣轉置
    transposeMatrix(matrix) {
        const result = [];
        for (let j = 0; j < matrix[0].length; j++) {
            result[j] = [];
            for (let i = 0; i < matrix.length; i++) {
                result[j].push(matrix[i][j]);
            }
        }
        return this.matrixToString(result);
    }

    // 計算行列式 (2x2 和 3x3)
    calculateDeterminant(matrix) {
        if (matrix.length === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        } else if (matrix.length === 3) {
            return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                   matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                   matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
        }
        throw new Error('只支持2x2和3x3矩陣');
    }

    // 矩陣反演 (使用高斯消元法)
    invertMatrix(matrix) {
        const n = matrix.length;
        if (matrix.length !== matrix[0].length) {
            throw new Error('矩陣必須是方形');
        }

        // 建立擴充矩陣 [A | I]
        const augmented = [];
        for (let i = 0; i < n; i++) {
            augmented[i] = [...matrix[i]];
            for (let j = 0; j < n; j++) {
                augmented[i].push(i === j ? 1 : 0);
            }
        }

        // 高斯-喬丹消元
        for (let i = 0; i < n; i++) {
            // 找到主元
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = j;
                }
            }

            // 交換行
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

            if (Math.abs(augmented[i][i]) < 1e-10) {
                throw new Error('矩陣奇異，無反矩陣');
            }

            // 化簡
            const pivot = augmented[i][i];
            for (let j = 0; j < 2 * n; j++) {
                augmented[i][j] /= pivot;
            }

            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    const factor = augmented[j][i];
                    for (let k = 0; k < 2 * n; k++) {
                        augmented[j][k] -= factor * augmented[i][k];
                    }
                }
            }
        }

        // 提取反矩陣
        const inverse = [];
        for (let i = 0; i < n; i++) {
            inverse[i] = augmented[i].slice(n);
        }

        return this.matrixToString(inverse);
    }

    // 矩陣轉字符串
    matrixToString(matrix) {
        return matrix.map(row => 
            '[' + row.map(v => v.toFixed(4)).join(', ') + ']'
        ).join('\n');
    }

    // 矩陣功能
    handleMatrixFunction(func) {
        switch (func) {
            case 'clear':
                document.getElementById('matrix-input').innerHTML = '';
                document.getElementById('matrix-result').textContent = '';
                break;
        }
    }

    // 單位轉換
    updateUnitOptions() {
        const type = document.getElementById('unit-type').value;
        const units = this.getUnitsForType(type);
        
        const fromSelect = document.getElementById('unit-from');
        const toSelect = document.getElementById('unit-to');

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        units.forEach(unit => {
            fromSelect.appendChild(new Option(unit, unit));
            toSelect.appendChild(new Option(unit, unit));
        });

        if (units.length > 1) {
            toSelect.selectedIndex = 1;
        }
    }

    // 獲取單位類型
    getUnitsForType(type) {
        const unitMap = {
            'length': ['米', '厘米', '毫米', '公里', '英尺', '英寸', '碼', '海里'],
            'weight': ['克', '千克', '毫克', '噸', '磅', '盎司'],
            'temperature': ['攝氏度', '華氏度', '凱爾文'],
            'speed': ['米/秒', '公里/小時', '英里/小時', '節'],
            'area': ['平方米', '平方厘米', '平方公里', '公頃', '平方英尺', '平方英寸'],
            'volume': ['立方米', '立方厘米', '升', '毫升', '加侖', '品脫']
        };
        return unitMap[type] || [];
    }

    // 轉換單位
    convertUnits() {
        const type = document.getElementById('unit-type').value;
        const value = parseFloat(document.getElementById('unit-value').value);
        const from = document.getElementById('unit-from').value;
        const to = document.getElementById('unit-to').value;

        if (isNaN(value)) {
            document.getElementById('unit-result').textContent = '請輸入有效的數值';
            return;
        }

        const result = this.performConversion(type, value, from, to);
        const expression = `${value} ${from} = ${result.toFixed(6)} ${to}`;
        document.getElementById('unit-result').textContent = expression;
        this.addToHistory(`單位轉換: ${expression}`);
    }

    // 執行轉換
    performConversion(type, value, from, to) {
        if (from === to) return value;

        const conversions = {
            'length': {
                '米': 1,
                '厘米': 0.01,
                '毫米': 0.001,
                '公里': 1000,
                '英尺': 0.3048,
                '英寸': 0.0254,
                '碼': 0.9144,
                '海里': 1852
            },
            'weight': {
                '克': 1,
                '千克': 1000,
                '毫克': 0.001,
                '噸': 1000000,
                '磅': 453.592,
                '盎司': 28.3495
            },
            'speed': {
                '米/秒': 1,
                '公里/小時': 0.27778,
                '英里/小時': 0.44704,
                '節': 0.51444
            },
            'area': {
                '平方米': 1,
                '平方厘米': 0.0001,
                '平方公里': 1000000,
                '公頃': 10000,
                '平方英尺': 0.092903,
                '平方英寸': 0.00064516
            },
            'volume': {
                '立方米': 1,
                '立方厘米': 0.000001,
                '升': 0.001,
                '毫升': 0.000001,
                '加侖': 0.00378541,
                '品脫': 0.000473176
            }
        };

        // 溫度特殊處理
        if (type === 'temperature') {
            return this.convertTemperature(value, from, to);
        }

        const factors = conversions[type];
        const fromFactor = factors[from];
        const toFactor = factors[to];

        return (value * fromFactor) / toFactor;
    }

    // 溫度轉換
    convertTemperature(value, from, to) {
        let celsius;

        // 轉換為攝氏度
        switch (from) {
            case '攝氏度':
                celsius = value;
                break;
            case '華氏度':
                celsius = (value - 32) * 5 / 9;
                break;
            case '凱爾文':
                celsius = value - 273.15;
                break;
        }

        // 從攝氏度轉換到目標
        switch (to) {
            case '攝氏度':
                return celsius;
            case '華氏度':
                return celsius * 9 / 5 + 32;
            case '凱爾文':
                return celsius + 273.15;
        }
    }

    // 添加到歷史記錄
    addToHistory(expression) {
        this.history.unshift(expression);
        if (this.history.length > 10) {
            this.history.pop();
        }
        this.updateHistoryDisplay();
    }

    // 更新歷史記錄顯示
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        this.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = item;
            div.addEventListener('click', () => {
                const result = item.split('=').pop().trim();
                this.currentInput = result;
                this.updateDisplay();
            });
            this.historyList.appendChild(div);
        });
    }

    // 更新顯示
    updateDisplay() {
        this.display.value = this.currentInput;
    }

    // 生成矩陣 (修正版本)
    generateMatrix() {
        this.generateMatrixInput();
    }
}

// 初始化計算器
window.addEventListener('DOMContentLoaded', () => {
    new EngineeringCalculator();
});
