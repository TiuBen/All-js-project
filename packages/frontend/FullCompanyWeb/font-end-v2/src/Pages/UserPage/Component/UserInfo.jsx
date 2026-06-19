import React, { useState, useEffect } from "react";
import { Request } from "../../../utils";

// ! 这是一个临时版本,先通过这个让员工可以提交最基本的数据

const userData = {
    uuid: "e2a8e7e9-aa3f-4cd1-9023-123456789abc",
    name: "John Doe",
    sex: "男",
    personalPhone: "1234567890",
    email: "johndoe@example.com;john.doe@example.com",
    expressAddress: "123 Main Street, City, Country",
    companyPhone: "9876543210",
    companyEmail: "john.doe@company.com",
    job: "Software Engineer",
    emergencyContact: "Jane Doe",
    emergencyContactRelation: "Spouse",
    emergencyPhone: "987654321",
    emergencyAddress: "456 Emergency Avenue, City, Country",
    IDCardNo: "1234567890123456",
    avatar: "base64-encoded-image-data",
    salary: 5000.0,
    entryDate: "2023-07-15T00:00:00.000Z",
    contractID: "CONTRACT123",
    SSCardNo: "SSCARD98765",
    permissions: "read;write;admin",
    password: "hashed-password",
};

function UserInfo({ user }) {
    // console.log(user);
    const [name, setName] = useState(user?.name);
    const [sex, setSex] = useState(user?.sex);
    const [personalPhone, setPersonalPhone] = useState(user?.personalPhone);
    // const [personalPhone, setPersonalPhone] = useState([]);
    const [email, setEmail] = useState(user?.email);
    const [expressAddress, setExpressAddress] = useState(user?.expressAddress);
    const [companyPhone, setCompanyPhone] = useState(user?.companyPhone);
    const [companyEmail, setCompanyEmail] = useState(user?.companyEmail);

    useEffect(() => {
        setName(user?.name);
        setSex(user?.sex);
        setPersonalPhone(user?.personalPhone);
        setEmail(user?.email);
        setExpressAddress(user?.expressAddress);
        setCompanyPhone(user?.companyPhone);
        setCompanyEmail(user?.companyEmail);
    }, [user]);

    return (
        <div className="flex flex-col  w-5/12  bg-white p-8 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">个人信息</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50  "
                    placeholder="请输入姓名"
                    name="name"
                    value={name}
                    onChange={(e) => {
                        e.preventDefault();
                        setName(e.target.value);
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">性别</label>
                <select
                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    name="sex"
                    value={sex}
                    onChange={(e) => {
                        e.preventDefault();
                        setSex(e.target.value);
                    }}
                >
                    <option value="男">男</option>
                    <option value="女">女</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">头像</label>
                <label className="block text-xs font-medium text-red-600 font-semibold">*暂时不可用</label>
                <input type="file" className="mt-1" disabled />
            </div>
            <div className="mb-4 ">
                <label className="block text-sm font-medium text-gray-700">手机</label>
                {personalPhone !== undefined ? (
                    personalPhone.split(";").map((phone, index) => {
                        return (
                            <div key={index} className="flex flex-row">
                                <input
                                    type="tel"
                                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder="请输入手机"
                                    name="personalPhone"
                                    value={phone}
                                    onChange={(e) => {
                                        e.preventDefault();

                                        if (personalPhone.includes(";")) {
                                            const _phones = personalPhone.split(";");

                                            var _newValue = _phones.slice(index, index + 1);

                                            _newValue = e.target.value;
                                            _phones[index] = _newValue;
                                            setPersonalPhone(_phones.join(";"));
                                        } else {
                                            setPersonalPhone(e.target.value);
                                        }
                                    }}
                                />
                                <button
                                    className="border bg-gray-300 w-12 m-1 hover:bg-slate-200 hover:rounded"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const _phones = personalPhone.split(";");
                                        _phones.splice(index, index + 1);
                                        setPersonalPhone(_phones.join(";"));
                                    }}
                                >
                                    删除
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <></>
                )}

                <button
                    className="border border-blue-700 flex m-1 hover:bg-slate-200 hover:rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        setPersonalPhone(personalPhone + ";");
                    }}
                >
                    <span class="material-symbols-outlined hover:text-blue-800 ">add</span>
                </button>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">邮箱</label>

                {email !== undefined ? (
                    email.split(";").map((phone, index) => {
                        return (
                            <div key={index} className="flex flex-row">
                                <input
                                    type="tel"
                                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder="请输入邮箱"
                                    name="email"
                                    value={phone}
                                    onChange={(e) => {
                                        e.preventDefault();

                                        if (email.includes(";")) {
                                            const _emails = email.split(";");

                                            var _newValue = _emails.slice(index, index + 1);

                                            _newValue = e.target.value;
                                            _emails[index] = _newValue;
                                            setPersonalPhone(_emails.join(";"));
                                        } else {
                                            setPersonalPhone(e.target.value);
                                        }
                                    }}
                                />
                                <button
                                    className="border bg-gray-300 w-12 m-1 hover:bg-slate-200 hover:rounded"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const _emails = email.split(";");
                                        _emails.splice(index, index + 1);
                                        setPersonalPhone(_emails.join(";"));
                                    }}
                                >
                                    删除
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <></>
                )}

                <button
                    className="border border-blue-700 flex m-1 hover:bg-slate-200 hover:rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        setPersonalPhone(email + ";");
                    }}
                >
                    <span class="material-symbols-outlined hover:text-blue-800 ">add</span>
                </button>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">快递收件地址</label>
                <textarea
                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="请输入收件地址"
                    rows="4"
                    name="expressAddress"
                    value={expressAddress}
                    onChange={(e) => {
                        e.preventDefault();
                        setExpressAddress(e.target.value);
                    }}
                ></textarea>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">公司分配手机</label>
                <input
                    type="tel"
                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="请输入公司分配手机"
                    name="companyPhone"
                    value={companyPhone}
                    onChange={(e) => {
                        e.preventDefault();
                        setCompanyPhone(e.target.value);
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm text font-medium text-gray-700">公司分配邮箱</label>
                <label className="block text-xs font-medium  text-blue-600">*填写公司已分配用来接收邮件的邮箱</label>
                <input
                    type="email"
                    className="mt-1 block w-full rounded p-[4px] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="请输入公司分配邮箱"
                    name="companyEmail"
                    value={companyEmail}
                    onChange={(e) => {
                        e.preventDefault();
                        setCompanyEmail(e.target.value);
                    }}
                />
            </div>
            <button
                className="px-4 py-2 bg-indigo-500 text-white rounded p-[4px] hover:bg-indigo-600"
                onClick={(e) => {
                    e.preventDefault();
                    const _newValue = { ...user };
                    _newValue.name = name;
                    _newValue.sex = sex;
                    _newValue.personalPhone = personalPhone;
                    _newValue.email = personalPhone;
                    _newValue.expressAddress = expressAddress;
                    _newValue.companyPhone = companyPhone;
                    _newValue.companyEmail = companyEmail;

                    console.log(_newValue);
                    if (_newValue.uuid) {
                        Request.put("/user", _newValue).then((data) => {
                            console.log(data);
                        });
                    }
                }}
            >
                提交
            </button>
        </div>
    );
}

function TestUserInfo() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Simulate an API call to fetch data after 2 seconds
        const fetchData = async () => {
            try {
                // Simulate the API response data
                const mockData = userData;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a 2-second delay
                setUser(mockData);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
        };

        fetchData();
    }, []);

    return <UserInfo user={user} />;
}
export { TestUserInfo, UserInfo };
