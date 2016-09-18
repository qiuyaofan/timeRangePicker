# timeRangePicker
a timePicker use for select time range.you can setting options to choose range or not,format(YYYY-MM-DD hh:mm:ss,YYYY-MM-DD hh:mm,YYYY-MM-DD),maxDate or minDate.

#this is the live demo
<a href="http://codepen.io/anon/pen/ALWPmQ" target="_blank">demo for timeRangePicker:http://codepen.io/anon/pen/ALWPmQ</a>

#defaults options
```
isRange: false,
format:'YYYY-MM-DD hh:mm:ss',
minDate:'',
maxDate:'',
show:function(){},
hide:function(){},
beforeHide:function(){}

```
#note of options
```
isRange:if true mean start time will less than end time,false is no limit
format:YYYY-MM-DD hh:mm:ss||YYYY-MM-DD hh:mm ||YYYY-MM-DD(the option does't work on the input value,but effect the timeRangepicker-wrap style and buttons type)
minDate:the min value of timeRangePicker
maxDate:max
show:work after the picker wrap show
hide:work after the picker wrap remove
beforeHide:work before the picker wrap remove
```
