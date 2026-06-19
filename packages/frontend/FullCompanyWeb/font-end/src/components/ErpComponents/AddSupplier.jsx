import { FormGroup } from "@mui/material";
import { useState } from "react";
import { Form, Button, Col, Row } from "react-bootstrap";
import useSWR, { SWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

// const fetcher = (...args) => fetch(...args).then((res) => res.json());

// async function sendRequest(url, { arg }) {
//     return fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(arg),
//     }).then((res) => res.json());
// }

function AddSupplier({ isFinance }) {
    const fianceComponent = isFinance ? { display: "none" } : { "": "" };

    // const { data, mutate } = useSWR("http://localhost:3100/api/test", fetcher);
    // const { trigger, isMutating } = useSWRMutation("http://localhost:3100/api/test", sendRequest);

    const [supplierData, setSupplierData] = useState({});
    const changeValue = (e) => {
        console.log(e.target.name);
        console.log(e.target.value);
        setSupplierData({ ...supplierData, [e.target.name]: e.target.value });
    };

    return (
        <Form className=" p-2 m-1">
            <Row className=" border border-dark-subtle p-2 m-1">
                <Form.Group as={Col} controlId="name">
                    <Form.Label>供应商名称</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        placeholder="例如:深圳航嘉电子"
                        onChange={(e) => changeValue(e)}
                        value={supplierData?.name}
                    />
                    <Form.Text className="text-muted">工商局代码(自动生成 链接)</Form.Text>
                </Form.Group>
                <Form.Group as={Col} controlId="code">
                    <Form.Label>供应商代码</Form.Label>
                    <Form.Control
                        type="text"
                        name="code"
                        placeholder="20230001"
                        onChange={(e) => changeValue(e)}
                        value={supplierData?.code}
                    />
                    <Form.Text className="text-muted">由系统自动生成,无需修改</Form.Text>
                </Form.Group>
            </Row>
            <Form.Group as={Col} controlId="detail" className="border border-dark-subtle p-2 m-1">
                <Form.Label>简介</Form.Label>
                <Form.Control
                    as="textarea"
                    name="detail"
                    placeholder="简答描述下这个公司"
                    onChange={(e) => changeValue(e)}
                    value={supplierData?.detail}
                />
            </Form.Group>

            <div className="border border-dark-subtle p-2 m-1">
                <Form.Label>财务相关内容</Form.Label>
                <Form.Group as={Col} controlId="financeInfo" className="border border-dark-subtle p-2 m-1">
                    <Form.Label column>纳税人资格</Form.Label>
                    <Col>
                        <Form.Select name="financeInfo" onChange={(e) => changeValue(e)}>
                            <option value="小规模纳税人">小规模</option>
                            <option value="一般规模纳税人">一般</option>
                            <option value="非大陆企业">非大陆企业</option>
                        </Form.Select>
                    </Col>
                </Form.Group>
                <Row className="border border-dark-subtle p-2 m-1" style={{ display: "none" }}>
                    <Col>
                        <figure class="text-center">
                            <blockquote class="blockquote text-body-tertiary">$$$$$$$</blockquote>
                            <figcaption class="blockquote-footer">历史交易金额</figcaption>
                        </figure>
                    </Col>
                    <div class="vr" style={{ maxWidth: "1px", padding: "0px" }}></div>
                    <Col>
                        <figure class="text-center">
                            <blockquote class="blockquote text-danger">$$$$$$$</blockquote>
                            <figcaption class="blockquote-footer">未收金额</figcaption>
                        </figure>
                    </Col>
                    <div class="vr" style={{ maxWidth: "1px", padding: "0px" }}></div>

                    <Col>
                        <figure class="text-center">
                            <blockquote class="blockquote text-primary">$$$$$$$</blockquote>
                            <figcaption class="blockquote-footer">未支付金额</figcaption>
                        </figure>
                    </Col>
                </Row>
                <Row className=" p-2 m-1"></Row>
            </div>
            <Form.Group as={Col} className=" p-2 m-1">
                <Button
                    variant="primary"
                    type="submit"
                    onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                            // const result = await trigger( supplierData/* options */);
                            // console.log(result);
                        } catch (e) {
                            // 错误处理
                        }
                    }}
                >
                    保存
                </Button>
            </Form.Group>
        </Form>
    );
}

export default AddSupplier;

/** ERP 系统 的 添加  供应商  */
// 供应商名称
// 供应商在本公司的代号
// 供应商的详细信息
// 工商局代码
// 公司网站
// 公司销售的产品
// 建档日期
// 历史交易
// 历史交易金额
// 平均回款周期
// 平均收益率
// 收付款方式(现金 月结 )
// 目前交易金额( 用颜色表示 )
