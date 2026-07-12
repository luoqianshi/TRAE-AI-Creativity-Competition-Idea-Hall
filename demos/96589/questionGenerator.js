class QuestionGenerator {
    constructor() {
        this.gradeConfig = {
            1: { name: '小学一年级', maxNum: 20, operations: ['+', '-'], useDecimals: false },
            2: { name: '小学二年级', maxNum: 100, operations: ['+', '-'], useDecimals: false },
            3: { name: '小学三年级', maxNum: 100, operations: ['+', '-', '*', '/'], useDecimals: false },
            4: { name: '小学四年级', maxNum: 1000, operations: ['+', '-', '*', '/'], useDecimals: true, decimalPlaces: 1 },
            5: { name: '小学五年级', maxNum: 10000, operations: ['+', '-', '*', '/'], useDecimals: true, decimalPlaces: 2 },
            6: { name: '小学六年级', maxNum: 100000, operations: ['+', '-', '*', '/'], useDecimals: true, decimalPlaces: 2, fractions: true },
            7: { name: '初中一年级', maxNum: 100, operations: ['+', '-', '*', '/'], useDecimals: true, algebra: true, simpleEquations: true },
            8: { name: '初中二年级', maxNum: 100, operations: ['+', '-', '*', '/'], useDecimals: true, algebra: true, equations: true, geometry: true },
            9: { name: '初中三年级', maxNum: 1000, operations: ['+', '-', '*', '/'], useDecimals: true, algebra: true, equations: true, geometry: true, functions: true }
        };
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomDecimal(min, max, places) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(places));
    }

    getRandomOperation(operations) {
        return operations[Math.floor(Math.random() * operations.length)];
    }

    generateNumber(config, difficulty) {
        let maxNum = config.maxNum;
        if (difficulty === 'easy') maxNum = Math.floor(maxNum * 0.3);
        else if (difficulty === 'hard') maxNum = Math.floor(maxNum * 1.2);
        
        if (config.useDecimals) {
            let places = config.decimalPlaces || 1;
            if (difficulty === 'hard') places = Math.min(places + 1, 3);
            return this.getRandomDecimal(1, maxNum, places);
        }
        return this.getRandomInt(1, maxNum);
    }

    generateChoiceQuestion(grade, difficulty) {
        const config = this.gradeConfig[grade];
        let question = '', answer = 0;
        
        if (grade <= 3) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op} ${num2} = ?`;
            answer = eval(`${num1} ${op} ${num2}`);
        } else if (grade <= 6) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op} ${num2} = ?`;
            answer = eval(`${num1} ${op} ${num2}`);
        } else {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op} ${num2} = ?`;
            answer = eval(`${num1} ${op} ${num2}`);
        }

        const options = this.generateOptions(answer, difficulty);
        return {
            type: 'choice',
            content: question,
            answer: answer.toString(),
            options: options,
            grade: grade,
            difficulty: difficulty
        };
    }

    generateFillQuestion(grade, difficulty) {
        const config = this.gradeConfig[grade];
        let question = '', answer = 0;
        
        if (grade <= 2) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(['+', '-']);
            
            const missing = Math.random() > 0.5 ? 'first' : 'second';
            if (missing === 'first') {
                answer = op === '+' ? num2 : num1 + num2;
                question = `? ${op} ${num2} = ${op === '+' ? num1 + num2 : num1}`;
            } else {
                answer = op === '+' ? num1 : num1 - num2;
                question = `${num1} ${op} ? = ${op === '+' ? num1 + num2 : num1 - num2}`;
            }
        } else if (grade <= 4) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(config.operations);
            
            answer = eval(`${num1} ${op} ${num2}`);
            question = `${num1} ${op} ${num2} = ____`;
        } else if (grade <= 6) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const num3 = this.generateNumber(config, difficulty);
            const op1 = this.getRandomOperation(config.operations);
            const op2 = this.getRandomOperation(config.operations);
            
            answer = eval(`${num1} ${op1} ${num2} ${op2} ${num3}`);
            question = `${num1} ${op1} ${num2} ${op2} ${num3} = ____`;
        } else {
            const x = this.getRandomInt(1, 20);
            const a = this.getRandomInt(2, 10);
            const b = this.getRandomInt(1, 50);
            
            answer = x;
            question = `${a}x + ${b} = ${a * x + b}，求 x = ____`;
        }

        return {
            type: 'fill',
            content: question,
            answer: answer.toString(),
            grade: grade,
            difficulty: difficulty
        };
    }

    generateCalculateQuestion(grade, difficulty) {
        const config = this.gradeConfig[grade];
        let question = '', answer = 0;
        
        if (grade <= 2) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(['+', '-']);
            
            question = `${num1} ${op} ${num2}`;
            answer = eval(`${num1} ${op} ${num2}`);
        } else if (grade <= 4) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const op = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op} ${num2}`;
            answer = eval(`${num1} ${op} ${num2}`);
        } else if (grade <= 6) {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const num3 = this.generateNumber(config, difficulty);
            const op1 = this.getRandomOperation(config.operations);
            const op2 = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op1} ${num2} ${op2} ${num3}`;
            answer = eval(`${num1} ${op1} ${num2} ${op2} ${num3}`);
        } else {
            const num1 = this.generateNumber(config, difficulty);
            const num2 = this.generateNumber(config, difficulty);
            const num3 = this.generateNumber(config, difficulty);
            const num4 = this.generateNumber(config, difficulty);
            const op1 = this.getRandomOperation(config.operations);
            const op2 = this.getRandomOperation(config.operations);
            const op3 = this.getRandomOperation(config.operations);
            
            question = `${num1} ${op1} ${num2} ${op2} ${num3} ${op3} ${num4}`;
            answer = eval(`${num1} ${op1} ${num2} ${op2} ${num3} ${op3} ${num4}`);
        }

        return {
            type: 'calculate',
            content: question + ' = ?',
            answer: answer.toString(),
            grade: grade,
            difficulty: difficulty
        };
    }

    generateApplicationQuestion(grade, difficulty) {
        const config = this.gradeConfig[grade];
        let question = '', answer = 0;
        
        if (grade <= 2) {
            const price1 = this.getRandomInt(1, 10);
            const price2 = this.getRandomInt(1, 10);
            const quantity1 = this.getRandomInt(1, 5);
            const quantity2 = this.getRandomInt(1, 5);
            
            const total = price1 * quantity1 + price2 * quantity2;
            question = `小明买了${quantity1}个苹果，每个${price1}元；又买了${quantity2}个香蕉，每个${price2}元。小明一共花了多少钱？`;
            answer = total;
        } else if (grade <= 4) {
            const distance = this.getRandomInt(10, 100);
            const speed = this.getRandomInt(5, 30);
            
            const time = distance / speed;
            question = `一辆汽车以每小时${speed}公里的速度行驶，行驶${distance}公里需要多少小时？`;
            answer = time;
        } else if (grade <= 6) {
            const length = this.getRandomInt(10, 50);
            const width = this.getRandomInt(5, 30);
            const height = this.getRandomInt(3, 20);
            
            const volume = length * width * height;
            question = `一个长方体箱子，长${length}厘米，宽${width}厘米，高${height}厘米，它的体积是多少立方厘米？`;
            answer = volume;
        } else {
            const radius = this.getRandomInt(5, 20);
            
            const circumference = (2 * Math.PI * radius).toFixed(2);
            question = `一个圆的半径是${radius}厘米，求这个圆的周长（π取3.14）。`;
            answer = circumference;
        }

        return {
            type: 'application',
            content: question,
            answer: answer.toString(),
            grade: grade,
            difficulty: difficulty
        };
    }

    generateOptions(correctAnswer, difficulty) {
        const options = [correctAnswer];
        const floatAnswer = parseFloat(correctAnswer);
        
        while (options.length < 4) {
            let offset;
            if (difficulty === 'easy') {
                offset = this.getRandomInt(1, 5);
            } else if (difficulty === 'medium') {
                offset = this.getRandomInt(3, 10);
            } else {
                offset = this.getRandomInt(5, 20);
            }
            
            const isNegative = Math.random() > 0.5;
            const wrongAnswer = isNegative ? floatAnswer - offset : floatAnswer + offset;
            
            if (!options.includes(wrongAnswer.toString()) && wrongAnswer >= 0) {
                options.push(wrongAnswer.toString());
            }
        }
        
        return options.sort(() => Math.random() - 0.5);
    }

    generateQuestion(grade, difficulty, type) {
        const types = type === 'all' ? ['choice', 'fill', 'calculate', 'application'] : [type];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        
        switch (selectedType) {
            case 'choice':
                return this.generateChoiceQuestion(grade, difficulty);
            case 'fill':
                return this.generateFillQuestion(grade, difficulty);
            case 'calculate':
                return this.generateCalculateQuestion(grade, difficulty);
            case 'application':
                return this.generateApplicationQuestion(grade, difficulty);
            default:
                return this.generateChoiceQuestion(grade, difficulty);
        }
    }

    generateQuestions(grade, difficulty, count, type) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateQuestion(grade, difficulty, type));
        }
        return questions;
    }
}