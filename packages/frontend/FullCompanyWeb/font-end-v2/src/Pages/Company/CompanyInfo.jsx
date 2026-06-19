import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Request } from "../../utils";
import "./_company.scss";

const items = [
    { title: "公司全称", keyName: "FullCompanyName" },
    { title: "公司简称", keyName: "CompanyAbbreviation" },
    { title: "英文名称", keyName: "EnglishName" },
    { title: "logo", keyName: "Logo" },
    { title: "营业地址", keyName: "BusinessAddress" },
    { title: "电话", keyName: "Telephone" },
    { title: "开户行", keyName: "BankName" },
    { title: "开户账号", keyName: "BankAccountNumber" },
    { title: "法人", keyName: "LegalRepresentative" },
    { title: "公司简介营业范围", keyName: "CompanyIntroduction" },
    { title: "公章", keyName: "OfficialSeal" },
    { title: "营业执照", keyName: "BusinessLicense" },
    { title: "纳稅人识别号", keyName: "TaxpayerIdentificationNumber" },
    { title: "企业名称", keyName: "CompanyName" },
    { title: "企业地址", keyName: "CompanyAddress" },
];

function CompanyInfo() {
    let location = useLocation();
    const [company, setCompany] = useState({});
    useEffect(() => {
        console.log(location);
        Request(`/company${location.search}`).then((res) => {
            if (res) {
                setCompany(res);
            }else{
                setCompany({});
            }

            // return res.json();
        });
    }, [location]);

    return (
        <div className="company_info_page ">
            <h2>{"公司信息" ?? "Applicant Information"}</h2>
            <h4 className="text-blue-800">公司相关信息 宣传|法规 适用</h4>
            <ul class="mt-8 divide-y">
                {items.map((item, index) => {
                    return (
                        <li>
                            <label className="item_label">{item.title ?? "Full name"}</label>
                            <div className="item_value">
                                {company?.[item.keyName] ?? "" }
                            </div>
                        </li>
                    );
                })}
                <li>
                    <label className="item_label">营业执照</label>
                    <div className="item_value">
                        <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
                            <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                <div class="flex w-0 flex-1 items-center">
                                    <svg
                                        class="h-5 w-5 flex-shrink-0 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span class="truncate font-medium">resume_back_end_developer.pdf</span>
                                        <span class="flex-shrink-0 text-gray-400">2.4mb</span>
                                    </div>
                                </div>
                                <div class="ml-4 flex-shrink-0">
                                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                                        Download
                                    </a>
                                </div>
                            </li>
                            <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                <div class="flex w-0 flex-1 items-center">
                                    <svg
                                        class="h-5 w-5 flex-shrink-0 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span class="truncate font-medium">coverletter_back_end_developer.pdf</span>
                                        <span class="flex-shrink-0 text-gray-400">4.5mb</span>
                                    </div>
                                </div>
                                <div class="ml-4 flex-shrink-0">
                                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                                        Download
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    );
}

export default CompanyInfo;
