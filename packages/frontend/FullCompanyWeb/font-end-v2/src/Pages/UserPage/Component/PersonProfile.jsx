import { Types, formGenerator } from "../../../utils";
import { useFormGenerator } from "../../../utils/hooks/useFormGenerator";

const block1 = [
    { label: "姓名", keyName: "name" },
    { label: "性别", keyName: "sex", type: Types.radio, options: ["男", "女"] },
    { label: "手机号码", keyName: "personalPhone", type: Types.tel },
    { label: "公司配手机号码", keyName: "companyPhone", type: Types.tel },
    { label: "邮箱", keyName: "email", type: Types.email },
    { label: "快递收件地址", keyName: "expressAddress" },
];

const block2 = [
    { label: "公司职务", keyName: "job", type: Types.select, options: ["业务", "经理", "财务", "老板"] },
    {
        label: "OA系统权限",
        keyName: "permissions",
        type: Types.checkbox,
        options: ["基础员工", "项目经理", "财务权限", "财务主管", "管理员"],
    },
    { label: "初始登录密码", keyName: "password" },
    { label: "确认修改密码", keyName: "" },
];

const block3 = [
    { label: "头像", keyName: "avatar", type: Types.image, custom: { width: 300, height: 300 } },
    { label: "身份证号码", keyName: "IDCardNo" },
    { label: "紧急联系人", keyName: "emergencyContact" },
    { label: "与紧急联系人关系", keyName: "emergencyContactRelation" },
    { label: "紧急联系人手机号码", keyName: "emergencyPhone" },
    { label: "紧急联系地址", keyName: "emergencyAddress" },
];

const block4 = [
    { label: "薪酬", keyName: "salary" },
    { label: "合同编号", keyName: "contractID" },
    { label: "入职时间", keyName: "entryDate", type: Types.date },
];

function PersonProfile(props) {
    const form1 = useFormGenerator(block1,{...props.user});
    const form2 = useFormGenerator(block2, {...props.user});
    const form3 = useFormGenerator(block3, props.user);
    const form4 = useFormGenerator(block4, props.user);

    console.log(props);
    return (
        <form className="flex flex-row flex-wrap  gap-6   items-center">
            <div className="border border-slate-400 p-4 rounded-lg">{form1.items}</div>
            <div className="border border-slate-400 p-4 rounded-lg">{form2.items}</div>
            <div className="border border-slate-400 p-4 rounded-lg">{form3.items}</div>
            <div className="border border-slate-400 p-4 rounded-lg">{form4.items}</div>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(form1.value);
                    console.log(form2.value);
                }}
            >
                提交
            </button>
        </form>
    );
}

export default PersonProfile;
