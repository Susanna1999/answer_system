(function ($, window, undefined) {

    function AnswerCard($elem, opt) {
        //容器
        this.container = $elem;
        //图片路径
        this.imageUrl = opt.imageUrl || '';
        //图片
        this.images = [
            'index_bg.png',
            't_b.png',
            't_w.png',
            'uncheck.png',
            'checked.png',
            'right.png',
            'wrong.png',
            'finish.png',
            '0f.png',
            '1f.png',
            '2f.png',
            '3f.png',
            '4f.png',
            '5f.png',
            '6f.png',
            '7f.png',
            '8f.png',
            '9f.png',
        ];
        //随机生成
        this.random = opt.random || false;
        //抽题参数
        this.rangeOpt = $.extend(true, {
            radio: {
                number: -1,
                score: -1
            },
            checking: {
                number: -1,
                score: -1
            },
            multi: {
                number: -1,
                score: -1
            }
        }, opt.rangeOpt);
        //范围（个数）
        this.range = opt.range || null;
        //题库数据
        (function () {
            this.data = opt.data;
            this.getRangeQuestions();
        }).call(this);
        //主题
        this.title = opt.title;
        //当前的序号
        this.currentIndex = 0;
        //统计
        this.statistics = {
            pass: [],
            fail: [],
            notDone: []
        };
        //答题卡
        this._opt = {
            question: '',
            // checking radio multi
            type: 'radio',
            options: [],
            result: [],
            selected: [],
            explain: []
        };
        //浏览状态
        this.display = {
            question: true,
            explain: false,
            answer: true,
            browse: false,
            check_answers: false
        };
        //显示错误答题的时机
        this.fail = {
            instantly: false,
            end: true
        };
        //语言
        this.language = {
            "ok": "确定",
            "check_answers": "查看答案",
            "no_choice": "您还没选择！",
            'checking': '判断',
            'radio': '单选',
            'multi': '多选',
            'right_answers': '正确答案',
            'yes': "是",
            'no': "否",
            'no_question': "题库中没有考题",
            'stamp-text': {
                right: '回答正确',
                wrong: '回答错误'
            }
        };
        //选项序号
        this.index = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
            'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];

        this.finishedcallback = opt.finishedcallback;
    }

    AnswerCard.prototype.create = function () {
        var container = this.container,
            title = this.createHeader(),
            question = this.createQuestion(),
            explain = this.createExplain(),
            btn = this.createButton();

        if (this.data.length === 0) {
            container.append(['<div>', title, '<p class="no-question">', this.language.no_question, '</p>', '</div>'].join(''));
        } else {
            container.append(['<div>', title, question, explain, btn, '</div>'].join(''));
        }
    }

    AnswerCard.prototype.createNext = function () {
        this.currentIndex = this.currentIndex + 1;

        var container = this.container,
            question = this.createQuestion(),
            explain = this.createExplain();

        container.find('.question,.explain').remove();
        container.find('header').after([question, explain].join(''));
    }

    AnswerCard.prototype.createHeader = function () {
        var title = ['<header>',
            '<div class="title">',
            this.title,
            '</div>',
            '</header>'
        ].join('');

        return title;
    }

    AnswerCard.prototype.createQuestion = function () {

        if (!this.data || this.data.length === 0) {
            return "";
        }
        var data = this.data,
            question,
            item = $.extend(true, {}, this._opt, data[this.currentIndex]),
            type = this.language[item.type || 'radio'],
            index = this.currentIndex + 1;

        data[this.currentIndex] = item;

        if (!this.display.question) {
            return "";
        }

        question = ['<div class="question">',
            '<div class="question-content">',
            '   <span  class="question-statistics">',
            '       <span class="question-statistics-index">', index, ' / ', '</span>',
            '       <span class="question-statistics-total">', this.data.length, '</span>',
            '   </span>',
            '   <p class="question-subject">', index, '、',
            '       <span class="question-type">[', type, ']</span>', item.question,
            '   </p>',
            this.createQuestionOptions(item),
            '</div>',
            '</div>'
        ].join('');

        return question;
    }

    AnswerCard.prototype.createQuestionOptions = function (questionInfo) {

        var options = [],
            type = questionInfo.type,
            item,
            index = this.index,
            option,
            data = questionInfo.options,
            result = questionInfo.selected,
            selected;

        if (type === 'checking') {
            data = [this.language.yes, this.language.no];
        }

        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            option = index[i];
            selected = '';

            if (this.display.check_answers) {
                if (result.indexOf(option) !== -1) {
                    selected = 'quest-option-selected quest-option-check-answer-selected';
                }
            }
            options.push('<p class="question-option ' + selected + '" data-index="' + i + '">' +
                '<span class="option-check"></span>' +
                '<label for="">' + option + '.' + item + '</label>' +
                '</p>');
        }

        return options.join('');
    }

    AnswerCard.prototype.createExplain = function () {
        var data = this.data,
            explain,
            stamp = this.statistics.pass.indexOf(this.currentIndex) !== -1 ? 'right' : 'wrong',
            item = data[this.currentIndex];

        if (!this.display.explain && !this.display.check_answers) {
            return "";
        }

        explain = ['<div class="explain">',
            '<div class="explain-content">',
            '<p class="stamp-text ' + stamp + '" >' + this.language['stamp-text'][stamp] + '</p>',
            '<p class="explain-subject">', this.language.right_answers, '： ', item.result.join('、'), '</p>',
            this.createExplainContent(item),
            '<span class="stamp ', stamp, '"></span>',
            '</div>',
            '</div>'
        ].join('');

        return explain;
    }

    AnswerCard.prototype.createExplainContent = function (explainInfo) {
        var content = [],
            data = explainInfo.explain,
            item;

        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            content.push('<p>' + item + '</p>');
        }

        return content.join('');
    }

    AnswerCard.prototype.createGrade = function () {

        var container = this.container,
            singleGrade = Math.ceil(100 / this.data.length),
            //total = singleGrade * this.statistics.pass.length || 0,
            score,
            total = 0,
            type,
            passList = this.statistics.pass,
            grade;

        for (var i = 0, len = passList.length; i < len; i++) {
            type = this.data[passList[i]].type;
            switch (type) {
                case 'radio':
                    score = this.rangeOpt.radio.score;
                    break;
                case 'checking':
                    score = this.rangeOpt.checking.score;
                    break;
                case 'multi':
                    score = this.rangeOpt.multi.score;
                    break;
                default:
                    break;
            }

            if (score <= 0) {
                score = singleGrade;
            }

            total += score;
        }

        if (!total || isNaN(total)) {
            total = '000';
        }

        if (total >= 100) {
            total = '100';
        }

        if (total < 10) {
            total = '00' + total;
        } else if (total < 100) {
            total = '0' + total;
        }

        grade = ['<div class="grade">',
            '<div class="grade-img">',
            '</div>',
            '</div>'
        ].join('');

        container.find('.question,.explain').remove();
        container.find('header').after([grade].join(''));
    }

    AnswerCard.prototype.createButton = function () {

        var btn = ['<div class="button-container">',
            '<div class="button-msg">', this.language.no_choice, '</div>',
            '<div class="button-ok">', '<a>', this.language.ok, '</a>', '</div>',
            '</div>'
        ].join('');

        return btn;
    }

    AnswerCard.prototype.createFinished = function () {
        var finished;

        finished = ['<div class="finish-container">',
            '</div>'
        ].join('');

        this.container.find('.question,.explain,.button-container').remove();
        this.container.find('header').after([finished].join(''));

        if (typeof this.finishedcallback === 'function') {
            this.finishedcallback();
        }
    }

    AnswerCard.prototype.setButtonText = function (text) {
        this.container.find('.button-ok>a').text(text);
    }

    AnswerCard.prototype.toggleQuestionOption = function ($elem) {
        var question = this.data[this.currentIndex],
            self = this;

        if ($elem.hasClass('quest-option-selected')) {
            this.cancelQuestionOption($elem);
        } else {
            this.selectQuestionOption($elem);
        }

        if (question.type !== 'multi') {
            $elem.siblings().each(function () {
                self.cancelQuestionOption($(this));
            });
        }
    }

    AnswerCard.prototype.selectQuestionOption = function ($elem) {
        $elem.addClass('quest-option-selected');
    }

    AnswerCard.prototype.cancelQuestionOption = function ($elem) {
        $elem.removeClass('quest-option-selected');
    }

    AnswerCard.prototype.markingQuestion = function (index) {

        this.getQuestionSelectedOption(index);

        var question = this.data[index],
            result = question.result.toString(),
            selected = question.selected.toString();

        if (!selected) {
            this.statistics.notDone.push(index);
        } else if (result === selected) {
            this.statistics.pass.push(index);
        } else {
            this.statistics.fail.push(index);
        }
    }

    AnswerCard.prototype.getQuestionSelectedOption = function (index) {
        var question = this.data[index],
            $elem = this.container,
            self = this;

        $elem.find('.quest-option-selected').each(function () {
            var index = $(this).index('.question-option');
            if (index !== -1) {
                question.selected.push(self.index[index]);
            }
        });
    }

    AnswerCard.prototype.showButtonMessage = function (text) {
        var $elem = this.container.find('.button-msg');
        $elem.text(text).show();
    }

    AnswerCard.prototype.hideButtonMessage = function () {
        var $elem = this.container.find('.button-msg');
        $elem.hide();
    }

    AnswerCard.prototype.getCurrentQuestion = function () {
        return this.data[this.currentIndex];
    }

    AnswerCard.prototype.checkAnswers = function () {

        if (this.display.check_answers) {

            if (this.currentIndex + 1 >= this.data.length) {
                this.createFinished();
                return;

            } else {
                this.container.find('.grade').remove();
                this.hideButtonMessage();
                this.setButtonText(this.language.ok);
            }
            //下一题
            this.createNext();
        }
    }

    AnswerCard.prototype.answerQuestion = function () {

        if (this.display.answer) {
            this.markingQuestion(this.currentIndex);

            if (this.getCurrentQuestion().selected.length === 0) {
                this.showButtonMessage(this.language.no_choice);
                return;
            }
            this.hideButtonMessage();

            if (this.currentIndex + 1 >= this.data.length) {
                //评分界面
                this.createGrade();
                this.display.answer = false;
                this.display.check_answers = true;
                this.currentIndex = -1;
                this.setButtonText(this.language.check_answers);
            } else {
                //下一题
                this.createNext();
            }
        }
    }

    AnswerCard.prototype.preloadImage = function () {
        images = this.images;
        for (var i = 0, len = images.length; i < len; i++) {
            var img = new Image();
            img.onload = function () {};
            img.onerror = function () {};
            img.src = this.imageUrl + images[i];
        }
    }

    AnswerCard.prototype.getRangeQuestions = function () {

        if (this.range && this.random === false) {
            this.data = this.data.slice(this.range[0], this.range[1]);
        }

        if (!this.random) {
            return;
        }

        function sortNumber(a, b) {
            //升序
            return a - b;
        }

        //iStart到iEnd-1范围内取值
        function getRandom(iStart, iEnd) {
            var iChoice = iStart - iEnd;
            return Math.abs(Math.floor(Math.random() * iChoice)) + iStart - 1;
        }

        //js实现随机选取n个数字，存入一个数组，并排序
        var questions = [],
            start = this.range[0] || 0,
            end = this.range[1] || 10,
            length = end - start,
            total = this.data.length,
            data = [],
            checkings = [],
            radioes = [],
            multis = [],
            next = true,
            index;

        if (total <= length) {
            return;
        }
        for (var i = start; i < end; i++) {
            var index = getRandom(0, total);
            if (questions.indexOf(index) === -1) {
                //按类型抽题

                //checking
                if (this.rangeOpt.checking && this.rangeOpt.checking.number > 0 && checkings.length < this.rangeOpt.checking.number) {
                    if (this.data[index].type === 'checking') {
                        checkings.push(index);
                        questions.push(index);
                        continue;
                    } else {
                        --i;
                        continue;
                    }
                }

                //radio
                if (this.rangeOpt.radio && this.rangeOpt.radio.number > 0 && radioes.length < this.rangeOpt.radio.number) {
                    if (this.data[index].type === 'radio') {
                        radioes.push(index);
                        questions.push(index);
                        continue;
                    } else {
                        --i;
                        continue;
                    }
                }

                //multi
                if (this.rangeOpt.multi && this.rangeOpt.multi.number > 0 && multis.length < this.rangeOpt.multi.number) {
                    if (this.data[index].type === 'multi') {
                        multis.push(index);
                        questions.push(index);
                        continue;
                    } else {
                        --i;
                        continue;
                    }
                }

                questions.push(index);
            } else {
                --i;
                continue;
            }
        }

        //questions.sort(sortNumber);

        for (var i = 0, len = questions.length; i < len; i++) {
            data.push(this.data[questions[i]]);
        }

        this.data = data;
    }


    var methods = {
        init: function (options) {
            return this.each(function () {
                var $elem = $(this),
                    answercard = $elem.data('answer-card');

                //初始化
                if (answercard) {
                    this.destroy();
                }

                answercard = new AnswerCard($elem, options);
                $elem.addClass('answer-card-container').data('answer-card', answercard);
                answercard.create();
                // 取消默认的右键菜单
                this.oncontextmenu = function () {
                    return false;
                };

                //绑定问题选项事件
                $elem.on('click', '.question-option', function () {
                    var $elem = $(this);
                    if (answercard.display.check_answers) {
                        return false;
                    }
                    answercard.toggleQuestionOption($elem);
                });

                //绑定按钮事件
                $elem.on('click', '.button-ok', function () {

                    if (answercard.display.answer) {
                        //答题
                        answercard.answerQuestion();
                    } else if (answercard.display.check_answers) {
                        //查看答案
                        answercard.checkAnswers();
                    }

                    $(document).scrollTop(0);
                })

                answercard.preloadImage();

            });
        },
        destroy: function () {
            return this.each(function () {
                var $elem = $(this);
                $elem.removeClass('answer-card-container');
                $elem.removeData('answer-card');
                $elem.empty();
            });
        }
    };

    jQuery.fn.answercard = function () {
        var method = arguments[0],
            arg = arguments;

        if (methods[method]) {
            method = methods[method];
            arg = Array.prototype.slice.call(arguments, 1);
        } else if (typeof (method) === 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.menubar');
            return this;
        }

        return method.apply(this, arg);
    };

})(jQuery, window, undefined);