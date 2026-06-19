// ! 常见的input 的type
const AvailableControlTypes = {
    button: "button",// ! 我个人觉得 input[type="button"] 没有什么太大的意义
    checkbox: "checkbox",
    color: "color",// 颜色选择器
    date: "date", // 输入日期的控件（年、月、日，不包括时间）
    datetimeLocal: "datetime-local", //输入日期和时间的控件，不包括时区
    email: "email",
    file: "file",//	让用户选择文件的控件。使用 accept 属性规定控件能选择的文件类型。
    hidden: "hidden",//	不显示的控件，其值仍会提交到服务器。举个例子，右边就是一个隐形的控件。
    image: "image", //! 这个要特别注意 感觉没有什么用;图形化 submit 按钮。显示的图像由 src 属性决定。如果 src 属性缺失，就会显示 alt 的内容
    month: "month",//输入年和月的控件，没有时区
    number: "number",//用于输入数字的控件。如果支持的话，会显示滚动按钮并提供缺省验证（即只能输入数字）。
    password: "password",
    radio: "radio",// 单选按钮，允许在多个拥有相同 name 值的选项中选中其中一个。
    range: "range", // 范围选择器
    reset: "reset", //! 不推荐使用
    search: "search",
    submit: "submit",
    tel: "tel",
    text: "text",
    time: "time",
    url: "url",
    week: "week",
    textarea: "textarea",
    select: "select", // option 是在 select 元素里的,配合<optgroup>
    option: "option", //option 是在 select 元素里的,配合<optgroup>
};

export  {AvailableControlTypes}
