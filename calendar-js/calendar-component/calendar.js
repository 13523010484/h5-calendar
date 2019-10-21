/**
 * user：jqh
 * date：2019/10/8
 * 说明：
 * 参照去哪儿酒店入住日历，使用h5+js实现酒店入住组件
 * 页面当中使用使用日期组件：
 *  <span class="start-date">开始日期<span>
 *  <span class="end-date">结束日期<span>
 *
 * **/


/**
 * 格式化数字不足10补0
 * **/
const formatNumber = (num) => {
    num = num.toString();
    return num[1] ? num : '0' + num;
};


/**
 * 格式化日期
 * **/
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return [year, month, day].map(formatNumber).join('-');
};


const date = new Date();
const nowYear = date.getFullYear();
const nowMonth = date.getMonth() + 1;
const today = formatDate(new Date());
const tomorrow = formatDate(new Date(new Date(today).getTime() + 86400000));
const maxMonth = 3;//最多渲染月数
let dateList = [];//日历数据
let checkInDate = today;//默认入住日期为今天
let checkOutDate = tomorrow;//默认离店日期明天
let betweenDateLen = 1;//入住和离店之间的天数


/**
 * 获取月的总天数
 * **/
const getTotalDayByMonth = (year, month) => {
    month = parseInt(month, 10);
    const d = new Date(year, month, 0);
    return d.getDate();
};


/**
 * 获取月的第一天是星期几
 * **/
const getWeek = (date) => {
    const d = new Date(new Date(date));
    return d.getDay();
};


/**
 * 比较日期大小
 * **/
const compareDate = (date1, date2) => {
    return new Date(date1).getTime() - new Date(date2).getTime();
};


/**
 * 创建显示的日期
 * **/
const dateListData = () => {
    for (let i = 0; i < maxMonth; i++) {
        let panelYear = nowYear;
        let panelMonth = nowMonth + i;
        if (panelMonth > 12) {
            panelYear = panelYear + Math.floor(panelMonth / 12);
            panelMonth = panelMonth % 12 ? panelMonth % 12 : 12;
        }

        let days = [];
        const panelMonthDays = getTotalDayByMonth(panelYear, panelMonth);
        for (let j = 1; j <= panelMonthDays; j++) {
            days.push({
                day: formatDate(new Date(`${panelYear}-${panelMonth}-${j}`))
            })
        }

        dateList.push({
            yearMonthDay: formatDate(new Date(`${panelYear}-${panelMonth}-1`)),
            days: days
        });
    }

    return dateList;
};


/**
 * 日历面板页面渲染
 * **/
(
    () => {
        const marginLeft = (date) => {
            return Number(1 / 7) * (getWeek(date)) * 100 + 'vw';
        };
        const formatShowDate = (dateStr) => {
            return dateStr.split('-').map(num => parseInt(num));
        };

        document.querySelector('.calendar-component').insertAdjacentHTML('beforeend', `<div class="modal-mask"></div>
        <div class="calendar-part">
            <div class="calendar-header">
                <div class="title">请选择入住酒店的日期</div>
                <div class="cur-year-month">2019年10月</div>
                <div class="week">
                    <span>周日</span>
                    <span>周一</span>
                    <span>周二</span>
                    <span>周三</span>
                    <span>周四</span>
                    <span>周五</span>
                    <span>周六</span>
                </div>
            </div>
            <div class="calendar-panel-wrap">
                ${dateListData().map(item => `<div class="calendar-panel">
                    <div class="date">${formatShowDate(item.yearMonthDay)[0]}年${formatShowDate(item.yearMonthDay)[1]}月</div>
                    <div class="days">
                        ${item.days.map(itemChild => `<span data-date="${itemChild.day}" class="${compareDate(itemChild.day, today) >= 0 ? '' : 'forbidden-date'}${itemChild.day === today ? 'active in-date' : ''}${itemChild.day === tomorrow ? 'active out-date' : ''}" style="${formatShowDate(itemChild.day)[2] === 1 ? 'margin-left:' + marginLeft(item.yearMonthDay) + ';' : ''}">${formatShowDate(itemChild.day)[2]}</span>`).join('')}
                    </div>
                </div>`).join('')}
            </div>
        </div>
        <div class="confirm-select">确定</div>`);
    }
)();


/**
 * 关闭日历
 * **/
const closeModalMask = () => {
    document.querySelector('.calendar-component').classList.toggle('hide');
};


/**
 * 初始化日历面板样式
 * **/
const initCalendarPanel = (initCheckDate = '') => {
    if (initCheckDate) {
        checkInDate = checkOutDate = '';
    }

    [].forEach.call(document.querySelectorAll('.days span.active'), item => {
        item.classList.remove('active', 'in-date', 'out-date')
    });

    [].forEach.call(document.querySelectorAll('.days span.between-date'), item => {
        item.classList.remove('between-date');
    });
};


/**
 * 选择驻点离店日期
 * **/
document.querySelector('.calendar-panel-wrap').addEventListener('click', (e) => {
    if (e.target.parentNode.classList.contains('days')) {
        const target = e.target;
        let curSpanDate = target.dataset.date;
        const calendarSelectIsInDate = () => {//日历面板仅选择入住日期，无离店日期
            checkInDate = curSpanDate;
            target.classList.add('active', 'in-date');
            document.querySelector('.confirm-select').classList.add('confirm-select-no-out-date');
            document.querySelector('.confirm-select').innerHTML = `请选择离店时间`;
        };
        const calendarSelectIsOutDate = () => {//日历面板有入住日期、离店日期
            target.classList.add('active', 'out-date');
            document.querySelector('.confirm-select').classList.remove('confirm-select-no-out-date');
            document.querySelector('.confirm-select').innerHTML = `确定(共${betweenDateLen}晚)`;
        };

        if (target.classList.contains('forbidden-date')) {//用户选择的日期为禁选日期
            return
        }

        if (document.querySelectorAll('.days span.active').length === 1 && !target.classList.contains('active')) {//用户已选入住日期，且再次选择的日期不为入住日期
            checkOutDate = curSpanDate;
            if (compareDate(checkOutDate, checkInDate) < 0) {//显示为入住：用户选择的结束日期小于开始日期，此时将清空开始日期样式并将结束日期设置为开始日期
                initCalendarPanel(true);//清空日历面板新增的一些样式及将住店和离店日期置为""
                calendarSelectIsInDate();//用户只选择了入住日期

            } else {//显示为离店：用户选择的结束日期大于开始日期，此时计算开始日期和结束日期的日期间隔，并设置其样式
                const checkInDateTimestamp = new Date(checkInDate).getTime();
                betweenDateLen = compareDate(checkOutDate, checkInDate) / 86400000;
                for (let i = 1; i < betweenDateLen; i++) {//计算入住日期和离店日期之间的日期，并设置其样式
                    const betweenDateOneDay = formatDate(new Date(checkInDateTimestamp + i * 86400000));
                    [].forEach.call(document.querySelectorAll('.days span'), item => {
                        if (item.dataset.date === betweenDateOneDay) {
                            item.classList.add('between-date');
                        }
                    });
                }

                calendarSelectIsOutDate();//设置离店日期样式及底部确定按钮样式
            }

        } else {
            initCalendarPanel(true);//初始化日历面板
            calendarSelectIsInDate();//用户仅仅选择了入住日期
        }
    }
});


/**
 * 点击遮罩层关闭模态框
 * **/
document.querySelector('.modal-mask').addEventListener('click', () => {
    closeModalMask();
    initCalendarPanel();
    checkInDate = document.querySelector('.start-date').innerText;
    checkOutDate = document.querySelector('.end-date').innerText;
    document.querySelector('.confirm-select').classList.remove('confirm-select-no-out-date');
    document.querySelector('.confirm-select').innerHTML = `确定`;
});


/**
 * 用户为选择离店日期关闭弹层时，首先将入住日期和离店日期更新为页面当中获取到的日期
 * 其次，当用户再次打开日历面板时，更新日历面板默认选中的入住日期、离店日期、区间日期的样式
 * **/
const updateCalendarDefaultStyle = () => {
    [].forEach.call(document.querySelectorAll('.days span'), item => {
        if (item.dataset.date === checkInDate) {//span标签的日期等于入住日期，设置入住日期样式
            item.classList.add('active', 'in-date');

        } else if (item.dataset.date === checkOutDate) {//span标签的日期等于离店日期，设置离店日期样式
            item.classList.add('active', 'out-date');

        } else if (compareDate(item.dataset.date, checkInDate) > 0 && compareDate(checkOutDate, item.dataset.date) > 0) {//span标签的日期等于入住日期和离店日期的区间日期，设置区间日期样式
            item.classList.add('between-date');
        }
    });
};


/**
 * 选择入住日期
 * **/
document.querySelector('.start-date').addEventListener('click', () => {
    closeModalMask();
    updateCalendarDefaultStyle();//更新日历面板默认显示的入住日期、离店日期、区间日期
});


/**
 * 选择离店日期
 * **/
document.querySelector('.end-date').addEventListener('click', () => {
    closeModalMask();
    updateCalendarDefaultStyle();//更新日历面板默认显示的入住日期、离店日期、区间日期
});


/**
 * 点击确定，关闭遮罩层
 * **/
document.querySelector('.confirm-select').addEventListener('click', (e) => {
    if (!e.target.classList.contains('confirm-select-no-out-date')) {
        closeModalMask();
        initCalendarPanel();
        document.querySelector('.start-date').innerText = checkInDate;
        document.querySelector('.live-day').innerText = `共${betweenDateLen}晚`;
        document.querySelector('.end-date').innerText = checkOutDate;
    }
});
