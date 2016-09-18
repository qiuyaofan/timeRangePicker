/*

//html
<div class="J-timeRangePicker-1">
    <input type="text" role="timePicker">
    <input type="text" role="timePicker">
</div>

//隐藏的数据
可根据每个父元素的data值获得所需的时间
this.target:元素父元素，包含data-target,data-object,data-time

//调用方式
$('.J-timeRangePicker-1').timeRangePicker({
    //是否是范围选择
    isRange: true,
    format:'YYYY-MM-DD hh:mm'
});
 */


$(function() {
    var  dateTimeRes=/^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/;
    var minuteTimeRes=/^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])\s(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1})$/;
    var secondTimeRes=/^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])\s(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1}):([0-5]\d{1})$/;
    var $body=$('body');
    var timePickerDefaults = {
        isRange: false,
        format:'YYYY-MM-DD hh:mm:ss',
        minDate:'',
        maxDate:'',
        show:function(){},
        hide:function(){},
        beforeHide:function(){},
        chooseDay:function(){}
    };
    var renderTimeResult = renderTime();
    var templateParent = '<div class="timeRangePicker-wrap">' +
                           '{{item}}'+
                        '</div>';
    var template = '<div class="timePicker-nav" data-timepicker="">' +
                            '<span class="timePicker-prev"><</span>' +
                            '<span class="timePicker-year">{{year}}年</span>' +
                            '<span class="timePicker-month">{{month}}月</span>' +
                            '<span class="timePicker-day">{{day}}日</span>' +
                            '<span class="timePicker-next">></span>' +
                    '</div>' +

                    '<div class="timePicker-content timePicker-content-date">' +
                            '<div class="timePicker-day-main timePicker-main ">' +
                            '<div class="timePicker-day-title-list clearfix">' +
                            '<div class="timePicker-item">日</div>' +
                            '<div class="timePicker-item">一</div>' +
                            '<div class="timePicker-item">二</div>' +
                            '<div class="timePicker-item">三</div>' +
                            '<div class="timePicker-item">四</div>' +
                            '<div class="timePicker-item">五</div>' +
                            '<div class="timePicker-item">六</div>' +
                            '</div>' +
                            '<div class="timePicker-day-list clearfix">' +
                            '{{dayItem}}' +
                            '</div>' +
                            '</div>' +
                            '<div class="timePicker-month-main timePicker-main hide">' +
                            '<div class="timePicker-month-list clearfix">' +
                            '{{monthItem}}' +
                            '</div>' +
                            '</div>' +
                            '<div class="timePicker-year-main timePicker-main hide">' +
                            '<div class="timePicker-year-list clearfix">' +
                            '{{yearItem}}' +
                            '</div>' +
                            '</div>' +
                    '</div>'+
                    '<div class="timePicker-footer timePicker-time-main ">' +
                        '<div class="timePicker-main clearfix">' +
                            '时间：' +
                            '<div class="timePicker-hour-main">' +
                                '<div class="timePicker-hour-list-main timePicker-dropDown-main">' +
                                    '<div class="timePicker-item timePicker-select"><span>&nbsp;</span><img src="http://img.yi114.com/201682102710_triangle.png" class="timePicker-triangle"></div>' +
                                    '<div class="timePicker-hour-list hide clearfix" role="list">' +
                                         renderTimeResult.h+
                                    '</div>' +
                                '</div>' +
                                 '时' +
                            '</div>' +

                            '<div class="timePicker-minute-main">' +
                                '<div class="timePicker-minute-list-main timePicker-dropDown-main">' +
                                    '<div class="timePicker-item timePicker-select"><span>&nbsp;</span><img src="http://img.yi114.com/201682102710_triangle.png" class="timePicker-triangle"></div>' +
                                    '<div class="timePicker-minute-list hide clearfix" role="list">' +
                                       renderTimeResult.m +
                                    '</div>' +
                                '</div>' +
                                '分' +
                            '</div>' +

                            '<div class="timePicker-second-main">' +
                                '<div class="timePicker-second-list-main timePicker-dropDown-main">' +
                                    '<div class="timePicker-item timePicker-select"><span>&nbsp;</span><img src="http://img.yi114.com/201682102710_triangle.png" class="timePicker-triangle"></div>' +
                                    '<div class="timePicker-second-list hide clearfix" role="list">' +
                                        renderTimeResult.s +
                                    '</div>' +
                                '</div>' +
                                '秒' +
                            '</div>' +

                        '</div>' +
                    '</div>' +
                    '<div class="timePicker-footer">' +
                        '<a href="javascript:;" class="timePicker-btn timePicker-clean">清空</a>' +
                        '<a href="javascript:;" class="timePicker-btn timePicker-confirm">确定</a>' +
                    '</div>';

    function TimeRangePicker(ele, options) {
        if (!ele.length) {
            return false;
        }
        this.target = ele;
        this.options = $.extend({}, timePickerDefaults, options);
        if (diffTime(this.options.minDate, this.options.maxDate)) {
            this.options.maxDate = '';
        }
        this.maxDate = getDate(this.options.maxDate);
        this.minDate = getDate(this.options.minDate);
        this.init();
        this.event();
    }

    TimeRangePicker.prototype = {
        init: function() {
            var $picker = this.target.find('[role="timePicker"]');
            var dateStart = getInitDate.call(this,$picker.eq(0));
            var time = dateStart.time;
            var cache = {};
            cache.begin = dateStart;
            if (this.options.isRange) {
                var dateEnd = getInitDate.call(this,$picker.eq(1));
                time = time + ';' + dateEnd.time;
                cache.end = dateEnd;
            }
            cache.time = time;

            this.target.data('time', cache);
            //存储实例到target
            this.target.data('object', this);

            this.target.css('position', 'relative');
            //this.render();
        },
        /*===========生成年份===============*/
        renderYear: function(index, year) {
            index = (index === 0 || index === 1) ? index : timePickerDataResult.call(this).index;
            year = year || Number(this.getDate()[index].year);
            var html = '';
            var next = 'y-next';
            var prev = "y-prev";
            var min = year - 6;
            var max = year + 3;

            if (this.maxDate) {
                if (year + 4 > this.maxDate.year) {
                    next = '';
                    max = this.maxDate.year <= this.minDate.year ? this.minDate.year : this.maxDate.year;
                }
            }
            if (this.minDate) {
                if (year - 7 < this.minDate.year) {
                    prev = '';
                    min = this.minDate.year >= this.maxDate.year ? this.maxDate.year : this.minDate.year;
                }
            }
            // html += '<div class="timePicker-item timePicker-disable '+prev+'">' + (year - 7) + '</div>';
            var k = year - 7;
            for (; k < min; k++) {
                html += '<div class="timePicker-item timePicker-disable ' + prev + '">' + k + '</div>';
            }
            for (; k <= max; k++) {
                html += '<div class="timePicker-item">' + k + '</div>';
            }
            for (; k <= year + 4; k++) {
                html += '<div class="timePicker-item timePicker-disable ' + next + '">' + k + '</div>';
            }
            return html;
        },
        /*===========生成12个月份===============*/
        renderMonth: function(index) {
            index = (index === 0 || index === 1) ? index : timePickerDataResult.call(this).index;
            var date = this.getDate()[index];
            var year=date.year;
            var month = date.month;
            var html = '';
            var min = 0;
            var max = 12;

            if (this.maxDate) {
                if (year > this.maxDate.year) {
                    max = 0;
                }
                if (year == this.maxDate.year) {
                    max = Number(this.maxDate.month);
                }
            }
            if (this.minDate) {
                if (year < this.minDate.year) {
                    min = 12;
                }
                if (year == this.minDate.year) {
                    min = Number(this.minDate.month) - 1;
                }
            }
            var k = 0;
            for (; k < min; k++) {
                html += '<div class="timePicker-item timePicker-disable">' + (k + 1) + '</div>';
            }
            for (; k < max; k++) {
                html += '<div class="timePicker-item">' + (k + 1) + '</div>';
            }
            for (; k < 12; k++) {
                html += '<div class="timePicker-item timePicker-disable">' + (k + 1) + '</div>';
            }
            return html;
        },

        renderDate: function(index, date) {
            index = (index === 0 || index === 1) ? index : timePickerDataResult.call(this).index;
            var resultDate = this.getDate()[index];
            var month = resultDate.month;
            var day = resultDate.day;
            var year = resultDate.year;
            date = new Date(resultDate.time);
            var firstDate = new Date(date.setDate(1));
            var firstDateWeek = firstDate.getDay();

            /*===========生成每个月的天数===============*/
            var secondMonthDay = year / 4 === 0 ? 29 : 28;
            var everyMonthDay = [31, secondMonthDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            var activeMonthDay = everyMonthDay[formatMonth2(month - 1)];
            var prevMonthDay = everyMonthDay[formatMonth2(month - 2)];
            var nextMonthDay = everyMonthDay[Number(month)];
            var html = '';
            var j = 1;
            var next = 'timePicker-next';
            var prev = "timePicker-prev";
            var min = 0;
            var max = activeMonthDay;
            if (this.minDate) {
                if (year < this.minDate.year) {
                    prev = '';
                    min = activeMonthDay;
                }
                if (year == this.minDate.year && month <= this.minDate.month) {
                    prev = '';
                    min = this.minDate.day - 1;
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year) {
                    next = '';
                    max = 0;
                }
                if (year == this.maxDate.year && month >= this.maxDate.month) {
                    next = '';
                    max = this.maxDate.day;
                }
            }

            for (var i = 0; i < firstDateWeek; i++) {
                html += '<div class="timePicker-item timePicker-disable ' + prev + '">' + (prevMonthDay - firstDateWeek + i + 1) + '</div>';
            }
            var k = 0;
            for (; k < min; k++) {
                html += '<div class="timePicker-item timePicker-disable">' + (k + 1) + '</div>';
            }
            for (; k < max; k++) {
                html += '<div class="timePicker-item">' + (k + 1) + '</div>';
            }
            for (; k < activeMonthDay; k++) {
                html += '<div class="timePicker-item timePicker-disable">' + (k + 1) + '</div>';
            }
            for (var r = firstDateWeek + activeMonthDay; r < 42; r++) {
                html += '<div class="timePicker-item timePicker-disable ' + next + '">' + j + '</div>';
                j++;
            }
            return html;
        },

        event: function() {
            var _this = this;

            $body.off('click', '.timePicker-next,.timePicker-prev').on('click', '.timePicker-next,.timePicker-prev', function(event) {
                var $this = $(this);
                var _this = $('.timeRangePicker-wrap').data('object');
                var date = timePickerDataResult.call(_this).date;
                var month = date.month;
                if ($this.hasClass('timePicker-prev')) {
                    month = month - 2;
                }
                if (month < 0) {
                    setCache.call(_this, date.year - 1, 'year', true,false);
                    setCache.call(_this, 12, 'month', true);
                    _this.updateRenderPicker();
                    return;
                    // month = 11;
                }
                if (month > 11) {
                    setCache.call(_this, Number(date.year) + 1, 'year', true,false);
                    setCache.call(_this, 1, 'month', true);
                    _this.updateRenderPicker();
                    return;
                    // month = 0;
                }
                $('.timePicker-month-list .timePicker-item').eq(formatMonth(month)).trigger('click');
            });
            //点击选择日期
            $body.off('click', '.timePicker-day-list .timePicker-item').on('click', '.timePicker-day-list .timePicker-item', function(event) {
                var $this = $(this);
                var _this = $('.timeRangePicker-wrap').data('object');
                if ($this.hasClass('timePicker-disable')) {
                    return false;
                }
                addClassActive($this);
                setCache.call(_this, $this, 'day');
                _this.options.chooseDay.call(_this,$this);
            });

            //点击选择月份
            $body.off('click', '.timePicker-month-list .timePicker-item').on('click', '.timePicker-month-list .timePicker-item', function(event) {

                var $this = $(this);
                var _this = $('.timeRangePicker-wrap').data('object');
                var dayHtml = '';
                if ($this.hasClass('timePicker-disable')) {
                    return false;
                }
                addClassActive($this);
                showDayMain.call(_this, 'day');
                //设置时间值
                setCache.call(_this, $this, 'month');
                //获取day html
                dayHtml = _this.renderDate();
                $('.timePicker-day-list').html(dayHtml);
                //渲染选中的active
                initActiveItem.call(_this, 'day');
            });

            //点击选择年份
            $body.off('click', '.timePicker-year-list .timePicker-item').on('click', '.timePicker-year-list .timePicker-item', function(event) {
                var $this = $(this);
                var _this = $('.timeRangePicker-wrap').data('object');
                if ($this.hasClass('timePicker-disable')) {
                    var year = Number($this.text());
                    if ($this.hasClass('y-prev')) {
                        year = year - 3;
                    } else if ($this.hasClass('y-next')) {
                        year = year + 6;
                    } else {
                        return;
                    }
                    var html = _this.renderYear(0, year);
                    $('.timePicker-year-list').html(html);
                    initActiveItem.call(_this, 'year');
                    return false;
                }
                addClassActive($this);
                showDayMain.call(_this, 'day');
                setCache.call(_this, $this, 'year');
                _this.updateRenderPicker();
            });

            //点击选择小时
            $body.off('click', '.timePicker-hour-list .timePicker-item').on('click', '.timePicker-hour-list .timePicker-item', function(event) {
                if ($(this).hasClass('timePicker-disable')) {
                    return false;
                }
                var _this = $('.timeRangePicker-wrap').data('object');
                $(this).parents('.timePicker-hour-list').find('.timePicker-item.active').removeClass('active');
                $(this).addClass('active');
                setCache.call(_this, $(this), 'hour');
            });

            //点击选择分钟
            $body.off('click', '.timePicker-minute-list .timePicker-item').on('click', '.timePicker-minute-list .timePicker-item', function(event) {

                if ($(this).hasClass('timePicker-disable')) {
                    return false;
                }
                var _this = $('.timeRangePicker-wrap').data('object');
                $(this).addClass('active').siblings('.timePicker-item').removeClass('active');
                setCache.call(_this, $(this), 'minute');
            });

            //点击选择秒
            $body.off('click', '.timePicker-second-list .timePicker-item').on('click', '.timePicker-second-list .timePicker-item', function(event) {

                if ($(this).hasClass('timePicker-disable')) {
                    return false;
                }
                var _this = $('.timeRangePicker-wrap').data('object');
                $(this).addClass('active').siblings('.timePicker-item').removeClass('active');
                // showDayMain.call(_this, 'day');
                setCache.call(_this, $(this), 'second');
            });

            //点击标题年份，选择年份
            $body.off('click', '.timePicker-year').on('click', '.timePicker-year', function(event) {
                var _this = $('.timeRangePicker-wrap').data('object');
                _this.updateRenderPicker();
                $('.timeRangePicker-wrap .timePicker-time-main').addClass('hide');
                showDayMain.call(_this, 'year');
            });

            //点击标题月份，选择月份
            $body.off('click', '.timePicker-month').on('click', '.timePicker-month', function(event) {
                var _this = $('.timeRangePicker-wrap').data('object');
                $('.timeRangePicker-wrap .timePicker-time-main').addClass('hide');
                showDayMain.call(_this, 'month');

            });
            $body.off('click', '.timePicker-day').on('click', '.timePicker-day', function(event) {
                var _this = $('.timeRangePicker-wrap').data('object');
                $('.timeRangePicker-wrap .timePicker-time-main').removeClass('hide');
                showDayMain.call(_this, 'day');
            });

            //点击时间输入框，弹出时间插件
            this.target.on('click', '[role="timePicker"]', function(event) {
                event.stopPropagation();
                var index = _this.target.data('target');
                var nowIndex = _this.target.find('[role="timePicker"]').index($(this));
                var length = _this.target.find('.timeRangePicker-wrap').length;
                //1.如果不是范围则不处理第二个输入框。
                //2.不处理大于2的输入框
                if ((!_this.options.isRange && nowIndex >= 1) || nowIndex > 1) {
                    return false;
                }
                if (!length || ((index === 0 || index === 1) && (index != nowIndex))) {
                    _this.hidePicker();
                }
                if (!$('.timeRangePicker-wrap').length) {
                    _this.showPicker($(this));
                }
            });

            //阻止冒泡
            $body.off('click', '.timeRangePicker-wrap').on('click', '.timeRangePicker-wrap', function(event) {
                event.stopPropagation();
            });

            //点击body隐藏时间插件
            $body.off('click.hidePicker').on('click.hidePicker', function(event) {
                hide();
            });

            //点确定隐藏时间插件
            $body.off('click.timePickerConfirm').on('click.timePickerConfirm', '.timePicker-confirm', function(event) {
                hide();
            });

            //清空时间值
            $body.off('click.timePickerClean').on('click.timePickerClean', '.timePicker-clean', function(event) {
                var _this = $('.timeRangePicker-wrap').data('object');
                _this.target.find('[role="timePicker"]').val('');
            });

            //输入框输入日期
            this.target.on('keyup', '[role="timePicker"]', function(event) {
                _this.updatePicker($(this));
            });

            //点击下啦
            $body.off('click.dropDown', '.timePicker-dropDown-main .timePicker-select').on('click.dropDown', '.timePicker-dropDown-main .timePicker-select', function(event) {
                var $this = $(this);
                var $parent = $this.parents('.timePicker-dropDown-main');
                $('.timePicker-dropDown-main').not($parent).find('[role="list"]').addClass('hide');
                $parent.find('[role="list"]').toggleClass('hide');
            });

            $body.off('click.dropDown', '.timePicker-dropDown-main [role="list"] .timePicker-item').on('click.dropDown', '.timePicker-dropDown-main [role="list"] .timePicker-item', function(event) {
                var $this = $(this);
                var $parent = $this.parents('.timePicker-dropDown-main');
                var $select = $parent.find('.timePicker-select span');
                $select.html($this.text());
                $('.timePicker-dropDown-main').find('[role="list"]').addClass('hide');
            });
        },

        showPicker: function(target) {
            checkPicker.call(this);
            var index = this.target.find('[role="timePicker"]').index(target);
            var date = this.getDate()[index];

            var html = template.replace('{{dayItem}}', this.renderDate(index))
                .replace('{{monthItem}}', this.renderMonth(index))
                .replace('{{yearItem}}', this.renderYear(index))
                .replace('{{month}}', date.month)
                .replace('{{year}}', date.year)
                .replace('{{day}}', date.day);
            html = templateParent.replace('{{item}}', html);
            this.target.append(html);
            //是否可以上一页下一页
            setNavDisable.call(this,date);

            if (formatType(this.options.format) === 1) {
                $('.timeRangePicker-wrap .timePicker-time-main').remove();
            }
            if (formatType(this.options.format) === 2) {
                $('.timeRangePicker-wrap .timePicker-second-main').remove();
            }

            //存储时间输入框index
            this.target.data('target', index);
            //定位显示插件
            pos.call(this);

            index = this.target.find('[role="timePicker"]').index(target);
            if (index === -1) {
                return;
            }
            this.target.data('target', index);
            initActiveItem.call(this);
            //存储实例化对象到时间显示元素timeRangePicker-wrap
            $('.timeRangePicker-wrap').data('object', this.target.data('object'));
            this.options.show(this.target, index);
        },

        hidePicker: function() {
            var _this = this;
            //隐藏前回调
            _this.options.beforeHide(_this.target);
            var result = timePickerDataResult.call(this);
            var $target = result.$target;
            //格式化输入框内的时间值
            fillFormatValue.call(_this, $target);
            //清空当前操作的input index
            _this.target.data('target', '');
            $body.find('.timeRangePicker-wrap').remove();
            //隐藏后回调
            _this.options.hide(_this.target);
        },
        //根据value更新data-time的值
        updatePicker: function() {
            var result = timePickerDataResult.call(this);
            var value = result.$target.val();
            var index = result.index;
            var key = ['begin', 'end'];
            var name = key[index];
            var time = JSON.parse(JSON.stringify(result.time));
            var $picker = this.target.find('[role="timePicker"]');
            if (!isFormat(value)) {
                return false;
            }

            var timeNew = getDate(value);
            time[name] = timeNew;
            var times = result.time.time.split(';');
            times[index] = timeNew.time;
            var isUpdate=filterRange.call(this,time[name]).isUpdate;

            if (this.options.isRange) {
                if (diffTime(times[0], times[1]) && value &&$picker.eq(1 - index).val()) {
                    $picker.eq(1 - index).val(value);
                    time = updateTime.call(this, timeNew, time);
                }
                time.time = times.join(';');
            } else {
                time.time = time[name].time;
            }
            time=timeRangeCompare.call(this,time);

            this.target.data('time', time);

            if(isUpdate){
                this.updateRenderPicker();
                $picker.eq(index).val(time[name].time);
            }
        },

        //根据data-time获取日期
        getDate: function() {
            var date = this.target.data('time').time;
            if (this.options.isRange) {
                return getRangeDate(date);
            }
            return [getDate(date)];
        },
        //更新html结构
        updateRenderPicker: function() {
            var result = timePickerDataResult.call(this);
            var date = result.date;
            var html = template.replace('{{dayItem}}', this.renderDate(result.index))
                .replace('{{monthItem}}', this.renderMonth(result.index))
                .replace('{{yearItem}}', this.renderYear(result.index))
                .replace('{{month}}', date.month)
                .replace('{{year}}', date.year)
                .replace('{{day}}', date.day);
            $('.timeRangePicker-wrap').html(html);
            initActiveItem.call(this);
            if (formatType(this.options.format) === 1) {
                $('.timeRangePicker-wrap .timePicker-time-main').remove();
            }
            if (formatType(this.options.format) === 2) {
                $('.timeRangePicker-wrap .timePicker-second-main').remove();
            }
        }
    };

    function hide() {
        var _this = $('.timeRangePicker-wrap').data('object');
        if (_this) {
            _this.hidePicker();
        }
    }

    //格式化输入框内的时间值
    function fillFormatValue($target) {
        var result, value;
        for (var i = 0; i < $target.length; i++) {
            result = timePickerDataResult.call(this, i);
            value = $target.eq(i).val();
            //如果有val但是格式不对，则自动填充
            if (value && !isFormat(value)) {
                var _value = formatType(this.options.format) === 0 ? result.date.time : result.date.time.split(' ')[0];
                $target.eq(i).val(_value);
            }
        }
    }

    //控制月份范围
    function formatMonth(month) {
        month = month < 0 ? 0 : month;
        month = month > 11 ? 11 : month;
        return month;
    }

    function formatMonth2(month) {
        month = Number(month);
        month = month < 0 ? 11 : month;
        month = month > 11 ? 0 : month;
        return month;
    }

    //初始化data-time的值，判断是否有默认值
    function checkPicker() {
        var _this=this;
        var key = ['begin', 'end'];
        var time = JSON.parse(JSON.stringify(this.target.data('time')));
        var $picker = this.target.find('[role="timePicker"]');
        var dataTime = [];
        var date = getNowDate();
        //时间范围
        if (this.options.isRange) {
            var _time = time.time.split(';');
            $.each($picker, function(index, el) {
                var result=getInitDate.call(_this,$(el));
                dataTime.push(result.time);
            });
            time.time = dataTime.join(';');
            this.target.data('time', time);
            return;
        }
        //单个时间
        if (!$picker.val()) {
            time.begin = date;
            time.time = date;
        }
    }

    //初始化获取数据并返回
    function getInitDate($picker) {
        var value = $picker.val();
        var format = isFormat(value);
        var result=format ? getDate(value) : getNowDate();
        value=filterRange.call(this,result).time;
        return value;
    }

    //比较是否不在选择范围内
    function timeRangeCompare(time) {
        time = JSON.parse(JSON.stringify(time));
        if(this.options.isRange){
            time.begin=filterRange.call(this,time.begin).time;
            time.end=filterRange.call(this,time.end).time;
            time.time=time.begin.time+';'+time.end.time;
        }else{
            time.begin=filterRange.call(this,time.begin).time;
            time.time=time.begin.time;
        }

        //console.info('timeRangeCompare',time);
        return time;
    }

    function filterRange(time){
        var isUpdate;
        if(this.maxDate&&diffTime(time.time,this.maxDate.time)){
            time=this.maxDate;
            isUpdate=1;
        }
        if(this.minDate&&diffTime(this.minDate.time,time.time)){
            time=this.minDate;
            isUpdate=1;
        }
        return {
            time:time,
            isUpdate:isUpdate
        };
    }

    //是否符合时间格式
    function isFormat(value) {
        return minuteTimeRes.test(value) || dateTimeRes.test(value) || secondTimeRes.test(value);
    }

    //获取时间格式类型
    function formatType(format) {
        //默认type＝0,有时分的格式
        var type = 0;
        switch (format) {
            case 'YYYY-MM-DD':
                type = 1;
                break;
            case 'YYYY-MM-DD hh:mm':
                type = 2;
                break;
        }
        return type;
    }

    //定位时间选择框
    function pos() {
        var top = this.target.outerHeight();
        var index = this.target.data('target');
        var $picker = this.target.find('[role="timePicker"]').eq(index);
        var left = $picker.offset().left - this.target.offset().left;
        $('.timeRangePicker-wrap').css({
            top: top,
            left: left
        });
    }

    //更新nav的值，type不传默认为全部
    function updateNav(time, type) {
        var navText = { year: '年', month: '月', day: '日' };
        var typeStr = type ? [type] : ['year', 'month', 'day'];
        var key;
        for (var i = 0; i < typeStr.length; i++) {
            key = typeStr[i];
            $('.timePicker-' + key).text(time[key] + navText[key]);
        }
    }

    //设置自定义的json 缓存数据
    function setCache(ele, type, isValue ,isCompare) {
        //this是原型：timeRangePicker
        var result = timePickerDataResult.call(this);
        var name = result.key;
        var time = JSON.parse(JSON.stringify(result.time));
        var navText = { year: '年', month: '月', day: '日' };
        //设置相应的json的值，type为key值，如：year,month..
        if (isValue) {
            time[name][type] = formatTime(ele);
        } else {
            time[name][type] = formatTime(ele.text());
        }

        if (type === 'year' || type === 'month' || type === 'day') {
            updateNav(time[name], type);
            // $('.timePicker-' + type).text(time[name][type] + navText[type]);
        }
        setTime.call(this, result.index, time, type,isCompare);
    }

    //设置自定义的json 缓存数据
    function setTime(index, time, type,isCompare) {
        var $picker = this.target.find('[role="timePicker"]');
        var key = ['begin', 'end'];
        var name = key[index];
        var date = time[name];
        var val = $picker.eq(index).val();
        var format = formatType(this.options.format);

        if (format === 0 && (!val || type === 'minute' || type === 'hour' || type === 'second' || secondTimeRes.test(val))) {
            time[name].time = date.year + '-' + formatTime(date.month) + '-' + formatTime(date.day) + ' ' + formatTime(date.hour) + ':' + formatTime(date.minute) + ':' + formatTime(date.second);
        } else if (format === 2 && (!val || type === 'minute' || type === 'hour' || minuteTimeRes.test(val))) {
            time[name].time = date.year + '-' + formatTime(date.month) + '-' + formatTime(date.day) + ' ' + formatTime(date.hour) + ':' + formatTime(date.minute);
        } else {
            time[name].time = date.year + '-' + formatTime(date.month) + '-' + formatTime(date.day);
        }

        //比较是否不在选择范围内,返回范围内的值

        if (this.options.isRange) {
            var dateTime = time.time.split(';');
            dateTime[index] = time[name].time;
            if (diffTime(dateTime[0], dateTime[1]) && $picker.eq(1 - index).val()) {
                dateTime[1 - index] = dateTime[index];
                $picker.eq(1 - index).val(dateTime[1 - index]);
                time = updateTime.call(this, date, time);
                //更新头部nav的值
                updateNav(time[name]);
            }
            time.time = dateTime.join(';');
        } else {
            time.time = time[name].time;
        }
        if(isCompare!==false&&(type==='year'||type==='month'||type==='day')){
            time=timeRangeCompare.call(this,time);
            updateNav(time[name]);
        }

        //根据最大值，最小值设置头部上一月下一月状态
        if(type==='year'||type==='month'){
            setNavDisable.call(this, time[name]);
        }

        this.target.data('time', time);
        $picker.eq(index).val(time[name].time);
    }

    //根据最大值，最小值设置头部上一月下一月状态
    function setNavDisable(time) {
        if ((time.year > this.maxDate.year) || (time.year == this.maxDate.year && time.month >= this.maxDate.month)) {
            $('.timeRangePicker-wrap .timePicker-next').removeClass('timePicker-next');
            return;
        }
        if ((time.year < this.minDate.year) || (time.year == this.minDate.year && time.month <= this.minDate.month)) {
            $('.timeRangePicker-wrap .timePicker-prev').removeClass('timePicker-prev');
            return;
        }
        // $('.timeRangePicker-wrap .timePicker-next').removeClass('timePicker-disable');
        // $('.timeRangePicker-wrap .timePicker-prev').removeClass('timePicker-disable');
    }

    //更新时间 date：新的时间，time：旧的时间
    function updateTime(date, time) {
        var format = formatType(this.options.format);
        var name = ['begin', 'end'];
        var str = [
            ['year', 'month', 'day', 'hour', 'minute', 'second'],
            ['year', 'month', 'day'],
            ['year', 'month', 'day', 'hour', 'minute']
        ];
        str = str[format];
        for (var j = 0; j < name.length; j++) {
            for (var i = 0; i < str.length; i++) {
                time[name[j]][str[i]] = date[str[i]];
            }
        }

        return time;
    }

    //显示日期选择界面
    function showDayMain(classType) {
        // var result = timePickerDataResult.call(this);
        var $content = $('.timePicker-content-date');
        var $time = $('.timeRangePicker-wrap .timePicker-time-main');
        $('.timePicker-content-time').addClass('hide');
        $content.find('.timePicker-main').addClass('hide');
        $content.find('.timePicker-' + classType + '-main').removeClass('hide');
        initActiveItem.call(this);
        if (classType === 'day') {
            $time.removeClass('hide');
        } else {
            $time.addClass('hide');
        }
    }
    //初始化选中日期状态
    function initActiveItem(type) {
        var index = this.target.data('target');
        if (index !== 0 && index !== 1) {
            return false;
        }
        var result = timePickerDataResult.call(this);
        var typeStr = type ? [type] : ['year', 'month', 'day', 'hour', 'minute', 'second'];
        for (var i = 0; i < typeStr.length; i++) {
            type = typeStr[i];
            var value = result.date[type];
            var $item = $('.timePicker-' + type + '-list').find('.timePicker-item').not('.timePicker-disable');
            var hasActive;
            if (!$item.length) {
                return false;
            }
            $item.removeClass('active');
            $.each($item, function(index, el) {
                if (Number($(el).text()) == value) {
                    $(el).addClass('active');
                    hasActive = 1;
                    if (type === 'minute' || type === 'second' || type === 'hour') {
                        $('.timePicker-' + type + '-list-main .timePicker-select span').html(formatTime(value));
                    }
                    return false;
                }
            });
            //找不到日期的时候，比如2月的31号
            if (!hasActive && type === 'day') {
                $item.eq(0).addClass('active');
                setCache.call(this, $item.eq(0), type);
            }
        }
    }
    //返回常用的data
    function timePickerDataResult(index) {
        index = index || this.target.data('target');
        var $target = this.target.find('[role="timePicker"]').eq(index);
        var key = ['begin', 'end'];
        var time = this.target.data('time');
        return {
            index: index, //输入框的序号
            $target: $target, //输入框元素
            time: time, //时间json
            key: key[index], //begin还是end
            date: time[key[index]]
        };
    }
    //添加active类
    function addClassActive($this) {
        $this.addClass('active').siblings('.timePicker-item').removeClass('active');
    }


    //获取时间范围年月日时分秒
    function getRangeDate(time) {
        var range = time.split(';');
        var begin = getDate(range[0]);
        var end = getDate(range[1]);
        return [begin, end];
    }

    //获取时间年月日时分秒
    function getDate(time) {
        var date = time.split(' ');
        var hour = '',minute = '', second = '', year = '', month = '', day = '';

        if (!isFormat(time)) {
            return false;
        }

        if (date.length > 1) {
            var _date = date[1].split(':');
            hour = _date[0];
            minute = _date[1];
            second = _date.length > 2 ? _date[2] : 0;
        }else{
            hour = minute = second = '00';
        }
        date = date[0].split('-');
        year = date[0];
        month = date[1];
        day = date[2];
        return {
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            time: year + '-' + formatTime(month) + '-' + formatTime(day) + ' ' + formatTime(hour) + ':' + formatTime(minute) + ':' + formatTime(second)
        };
    }

    //获取当前日期
    function getNowDate() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return {
            month: month,
            year: year,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            time: year + '-' + formatTime(month) + '-' + formatTime(day) + ' ' + formatTime(hour) + ':' + formatTime(minute) + ':' + formatTime(second)
        };
    }

    //格式化
    function formatTime(time) {
        return Number(time) >= 10 ? time : '0' + Number(time);
    }

    //渲染分钟小时html
    function renderTime() {
        var hour = '',minute = '', second = '';
        for (var j = 0; j < 24; j++) {
            hour += '<div class="timePicker-item">' + formatTime(j) + '</div>';
        }
        for (var k = 0; k < 60; k++) {
            minute += '<div class="timePicker-item">' + formatTime(k) + '</div>';
            second += '<div class="timePicker-item">' + formatTime(k) + '</div>';
        }
        return {
            h: hour,
            m: minute,
            s: second
        };
    }

    //判断时间大小
    function diffTime(start,end){
        return Date.parse(start) > Date.parse(end);
    }

    $.fn.timeRangePicker = function (options) {
        return this.each(function () {
            new TimeRangePicker($(this), options);
        });
    };
}());

$(function(){
    $('.J-timeRangePicker-3').timeRangePicker({
        //是否是范围选择
        isRange: true,
        minDate:'1980-10-22',
        maxDate:'1993-10-29'
    });
    $('.J-timeRangePicker').timeRangePicker({
        //是否是范围选择
        isRange: true
    });

    $('.J-timeRangePicker-1').timeRangePicker({
        //是否是范围选择
        isRange: true,
        format:'YYYY-MM-DD hh:mm'
    });

    $('.J-timeRangePicker-2').timeRangePicker({
        isRange: false,
        format:'YYYY-MM-DD',
        chooseDay:function($target){
            this.hidePicker();
        }
    });
});
