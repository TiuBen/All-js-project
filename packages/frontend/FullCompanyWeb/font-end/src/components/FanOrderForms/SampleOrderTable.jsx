import "./SampleOrderTable.scss";
// A4 896 * 1264

function SampleOrderTable() {
    const _order = {};
    return (
        <div className="sample-order-table">
            <label
                style={{ display: "flex", fontSize: "24px", textAlign: "center", fontWeight: "700", marginTop: "10px" }}
            >
                东 莞 市 鼎 道 电 子 科 技 有 限 公 司
            </label>
            <label style={{ fontSize: "20px", textAlign: "center", fontWeight: "700", marginTop: "-5px" }}>
                样 品 订 单
            </label>
            <section
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "calc( 896px - 72px )",
                    justifyContent: "stretch",
                    margin: "10px 0px 0px 0px",
                }}
            >
                <div className="item-container" style={{ maxWidth: "140px" }}>
                    <label className="item-title" style={{ maxWidth: "30px" }}>
                        编号
                    </label>
                    <div className="item-content" style={{ justifyContent: "center" }}>
                        {_order.orderNo || "20230314001"}
                    </div>
                </div>
                <div style={{ flexGrow: "1" }}>
                    <div className="item-container">
                        <label className="item-title" style={{ paddingLeft: "0.5rem", width: "100px" }}>
                            客户代码
                        </label>
                        <div className="item-content">{_order.customCode || "创盈芯"}</div>
                    </div>
                    <div className="item-container">
                        <label className="item-title" style={{ width: "100px", fontWeight: "bold" }}>
                            客户交期
                        </label>
                        <div className="item-content" style={{ fontWeight: "bold" }}>
                            {_order.customCode || "2023/4/1"}
                        </div>
                    </div>
                </div>
            </section>
            <section
                style={{
                    display: "grid",
                    width: "calc( 896px - 72px )",
                    justifyContent: "stretch",
                    margin: "0px 0px 0px 0px",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr  ",
                }}
            >
                <div className="item-container" style={{ display: "flex", flexDirection: "column" }}>
                    <label className="item-title">业务订单号码</label>
                    <div className="item-content" style={{ display: "grid", placeContent: "center", height: "60px" }}>
                        {_order.customCode || "业务订单号码"}
                    </div>
                </div>
                <div className="item-container" style={{ display: "flex", flexDirection: "column" }}>
                    <label className="item-title">接单日期</label>
                    <div className="item-content" style={{ display: "grid", placeContent: "center" }}>
                        {_order.customCode || "2023/3/28"}
                    </div>
                </div>
                <div className="item-container" style={{ display: "flex", flexDirection: "column" }}>
                    <label className="item-title">机种名称</label>
                    <div className="item-content" style={{ display: "grid", placeContent: "center" }}>
                        {_order.customCode || "2023/3/28"}
                    </div>
                </div>
                <div className="item-container" style={{ display: "flex", flexDirection: "column" }}>
                    <label className="item-title">订单数量</label>
                    <div className="item-content" style={{ display: "grid", placeContent: "center" }}>
                        {_order.customCode || "2023/3/28"}
                    </div>
                </div>
            </section>
            <section
                style={{
                    display: "grid",
                    width: "calc( 896px - 72px )",
                    margin: "10px 0px 0px 0px",
                    gridTemplateColumns: "60px 0.8fr 30px 1fr 30px 0.8fr  30px 1fr  30px 2fr ",
                    gridGap: "1px",
                    textAlign: "center",
                }}
            >
                <label
                    className="item-title"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div style={{ width: "30px" }}>风扇类型</div>
                </label>
                <div
                    className="item-content"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div className="item-cell">
                        <input type="radio" name="" />
                        <label for="huey">轴流</label>
                    </div>
                    <div className="item-cell">
                        <input type="radio" name="" />
                        <label for="huey">鼓风机</label>
                    </div>
                    <div className="item-cell">
                        <input type="radio" name="" />
                        <label for="huey">离心风机</label>
                    </div>
                    <div className="item-cell">
                        <input type="radio" name="" />
                        <label for="huey">贯流风机</label>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    性能参数
                </div>
                <div
                    className="item-content"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                        paddingLeft: "0.25rem",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "40px 1fr",
                            alignContent: "start",
                            justifyItems: "start",
                            marginRight: "0.25rem",
                        }}
                    >
                        <label className="item-title"> 电压</label>
                        <div className="item-content">{"5VDC "}</div>
                        <label className="item-title"> 电流</label>
                        <div className="item-content">{"0.15A "}</div>
                        <label className="item-title"> 转速</label>
                        <div className="item-content">{"8400RPM "}</div>
                    </div>
                </div>
                <label
                    className="item-title"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    轴承结构
                </label>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div
                        className="item-content"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "start",
                            alignItems: "start",
                            margin: " 0.25rem",
                        }}
                    >
                        <div className="item-cell">
                            <input type="radio" name="drone" checked />
                            <label for="huey">含油</label>
                        </div>

                        <div className="item-cell">
                            <input type="radio" name="drone" />
                            <label for="dewey">双滚珠 </label>
                        </div>

                        <div className="item-cell">
                            <input type="radio" name="drone" />
                            <label for="louie">液压</label>
                        </div>
                        <div className="item-cell">
                            <input type="radio" name="drone" />
                            <label for="louie">单滚珠</label>
                        </div>
                    </div>
                </div>
                <label
                    className="item-title"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    信号
                </label>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div
                        className="item-content"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "start",
                            alignItems: "start",
                            margin: " 0.25rem",
                        }}
                    >
                        <div className="item-cell">
                            <input type="radio" name="" />
                            <label for="huey">FG</label>
                        </div>

                        <div className="item-cell">
                            <input type="radio" name="" />
                            <label for="dewey">RD </label>
                        </div>

                        <div className="item-cell">
                            <input type="radio" name="" />
                            <label for="louie">FG＆ PWM</label>
                        </div>
                        <div className="item-cell">
                            <input type="radio" name="" />
                            <label for="louie">RD＆ PWM</label>
                        </div>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    线材
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div
                        className="item-content"
                        style={{
                            display: "grid",
                            // alignItems: "start",
                            // justifyItems: "start",
                            gridTemplateColumns: "80px 1fr",
                            gridGap: "1px",
                        }}
                    >
                        <label className="item-title" style={{ boxShadow: "0 0 0 1px black" }}>
                            线材AWG
                        </label>
                        <div style={{ boxShadow: "0 0 0 1px black" }}></div>
                        <label className="item-title" style={{ boxShadow: "0 0 0 1px black" }}>
                            {" "}
                            线径
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", boxShadow: "0 0 0 1px black" }}>
                            <div>
                                <input type="radio" name="" />
                                <label for="louie">24#</label>
                            </div>
                            <div>
                                <input type="radio" name="" />
                                <label for="louie">26#</label>
                            </div>
                            <div>
                                <input type="radio" name="" />
                                <label for="louie">28#</label>
                            </div>
                            <div>
                                <input type="radio" name="" />
                                <label for="louie">30#</label>
                            </div>
                        </div>
                        <label className="item-title" style={{ boxShadow: "0 0 0 1px black" }}>
                            长度
                        </label>
                        <div style={{ boxShadow: "0 0 0 1px black" }}> UL10064#32 100±10mm</div>
                        <label className="item-title" style={{ boxShadow: "0 0 0 1px black" }}>
                            颜色：
                        </label>
                        <div style={{ boxShadow: "0 0 0 1px black" }}>红黑黄蓝</div>
                        <label className="item-title" style={{ boxShadow: "0 0 0 1px black" }}>
                            线序排列
                        </label>
                        <div style={{ boxShadow: "0 0 0 1px black" }}>线序排列</div>
                    </div>
                </div>
                {/* ///// */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div
                        style={{
                            borderRight: "solid 1px black",
                        }}
                    >
                        外框
                    </div>
                    <div>扇框</div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">方框</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">圆框</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">半圆框</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">支架框</label>
                    </div>
                    <div>
                        <label for="louie">孔径：</label>
                    </div>
                    <div>
                        <label for="louie">孔距：</label>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    扇叶
                </div>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">弯叶（ 片叶）</label>
                    </div>
                    <div>
                        <label for="louie">叶片数量</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie"> 直叶（ 片叶）</label>
                    </div>
                    <div>
                        <label for="louie">叶片数量</label>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    材料
                </div>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">PBT料</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">PC料</label>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    材质
                </div>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">ROHS料</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">非ROHS料</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">防火料</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">不防火料</label>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    防护
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 0 0 1px black",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">防潮</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">防水</label>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    螺丝孔
                </div>
                <div
                    className="item-container"
                    style={{
                        gridColumnStart: 2,
                        gridColumnEnd: 5,
                        display: "grid",
                        placeItems: "start",
                        placeContent: "start",
                        paddingLeft: "0.5rem",
                        gridTemplateColumns: "1fr",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">平孔</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">沉孔</label>
                        <input type="radio" name="" />
                        <label for="louie">沉孔深度</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">上孔径</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">下孔径</label>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    端子
                </div>
                <div
                    className="item-content"
                    style={{
                        gridColumnStart: 6,
                        gridColumnEnd: 9,
                        display: "grid",
                        gridTemplateColumns: "auto auto auto ",
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "self-start",
                        }}
                    >
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">无端子</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">2P</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">3P</label>
                        </div>{" "}
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">4P</label>
                        </div>{" "}
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">连体大4P</label>
                        </div>{" "}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "self-start",
                        }}
                    >
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">1.0</label>
                        </div>{" "}
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">1.25</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">2.0</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">2.5</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">2510</label>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "self-start",
                        }}
                    >
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">SM飞机头</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">SM公端</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">带扣</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">不带扣</label>
                        </div>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    标签信息
                </div>
                <div
                    className="item-content"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        display: "grid",
                        gridTemplateColumns: "auto auto",
                    }}
                >
                    <label
                        className="item-title"
                        style={{ borderBottom: "1px solid black", borderRight: "1px solid black" }}
                    >
                        {" "}
                        型号
                    </label>
                    <div className="item-content" style={{ borderBottom: "1px solid black" }}>
                        {"5VDC "}
                    </div>
                    <label
                        className="item-title"
                        style={{ borderBottom: "1px solid black", borderRight: "1px solid black" }}
                    >
                        {" "}
                        电压
                    </label>
                    <div className="item-content" style={{ borderBottom: "1px solid black" }}>
                        {"0.15A "}
                    </div>
                    <label
                        className="item-title"
                        style={{ borderBottom: "1px solid black", borderRight: "1px solid black" }}
                    >
                        {" "}
                        电流
                    </label>
                    <div className="item-content" style={{ borderBottom: "1px solid black" }}>
                        {"0.15A "}
                    </div>
                    <label className="item-title" style={{ borderRight: "1px solid black" }}>
                        张贴方式
                    </label>
                    <div
                        className="item-content"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "auto auto",
                        }}
                    >
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">线下</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">线上</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">线左</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">线右</label>
                        </div>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    包装
                </div>
                <div
                    className="item-content"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        gridColumnStart: 2,
                        gridColumnEnd: 5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        paddingLeft: "0.5rem",
                    }}
                >
                    <div className="d-flex flex-row">
                        <label htmlFor="">正唛内容</label>
                        <div></div>
                    </div>
                    <div className="d-flex flex-row">
                        <label htmlFor="">侧唛内容</label>
                        <div></div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                            paddingLeft: "0.5rem",
                        }}
                    >
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">外箱＆平卡</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">蜂窝包装</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">吸塑包装</label>
                        </div>{" "}
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">彩盒</label>
                        </div>
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">外箱＆小内箱</label>
                        </div>{" "}
                        <div>
                            <input type="radio" name="" />
                            <label for="louie">白盒</label>
                        </div>{" "}
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    管控参数
                </div>
                <div
                    style={{
                        boxShadow: "0 0 0 1px black",
                        gridColumnStart: 6,
                        gridColumnEnd: 11,
                        display: "grid",
                        justifyItems: "start",
                        paddingLeft: "0.5rem",
                        gridTemplateColumns: "1fr 1fr 1fr ",
                    }}
                >
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">矽钢片型号</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">矽钢片厂家</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">矽钢片材质</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">漆包线绕线参数</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">润滑油型号</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">漆包线厂家</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">绕线张力</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">线圈阻抗</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">定子高度</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">合铜高度</label>
                    </div>
                    <div>
                        <input type="radio" name="" />
                        <label for="louie">磁框高度</label>
                    </div>
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    特别
                    <br />
                    事项
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        gridColumnStart: 2,
                        gridColumnEnd: 11,
                    }}
                ></div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                    }}
                >
                    备注
                </div>
                <div
                    className="item-title"
                    style={{
                        boxShadow: "0 0 0 1px black",
                        gridColumnStart: 2,
                        gridColumnEnd: 11,
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "left",
                    }}
                >
                    <div>深圳市龙华区华荣路科伦特低碳产业园C栋西边3楼 谢利娜 15016748382</div>
                    <div>收件人：谢利娜 15016748382</div>
                </div>
            </section>
        </div>
    );
}

export default SampleOrderTable;
