import { Stepper } from "../../../../Components";
import { useContext, useState, useCallback } from "react";
import { BillContext } from "../../Context/BillContext";
import ImageViewer from "react-simple-image-viewer";

function DetailBill() {
    const { BillHeader, BillBody } = useContext(BillContext);
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const images = [
        "http://placeimg.com/1200/800/nature",
        "http://placeimg.com/800/1200/nature",
        "http://placeimg.com/1920/1080/nature",
        "http://placeimg.com/1500/500/nature",
    ];
    const openImageViewer = useCallback((index) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    return (
        <div className="overflow-x-auto px-2 flex-1  flex flex-col bg-white m-1 border border-dark-subtle rounded shadow-xl">
            <div className=" flex flex-col flex-1  m-12">
                <section className="flex flex-row border ">
                    {Array(5)
                        .fill({ status: "", content: "" })
                        .map((x) => {
                            return <Stepper status={x.status} content={x.content} />;
                        })}
                </section>

                {/* 第一部分
                标题 */}

                <section className="grid grid-flow-col justify-stretch text-2xl font-bold  ">
                    <div className="text-2xl font-bold">
                        <div className="">个人报销</div>
                        <div>编号:000001</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div>{BillHeader.companyName || "公司的名字"}</div>
                        <div className=" text-xl font-sans font-medium">沈宁</div>
                        <div className=" text-xl font-sans font-medium">{BillHeader.applyTime || "2023-04-26s"}</div>
                    </div>
                </section>
                {/* 第二部分
                描述 */}
                <section className=" ">
                    <h1 className="text-xl font-bold">详细:</h1>

                    <div className="flex flex-row">
                        <span class="material-icons-outlined inline-block">edit</span>
                        <p>{BillHeader.title || "这个发票是因为什么事情产生的,需要报销"} </p>
                    </div>
                </section>

                <form className="flex-1">
                    <table className="w-full border border-gray-200 p-4 rounded-lg space-y-4">
                        <thead className="border-b border-gray-400">
                            <tr>
                                <td className="text-center ">操作</td>
                                <td>序号</td>
                                <td>项目</td>
                                <td>单价</td>
                                <td>数量</td>
                                <td>合计</td>
                            </tr>
                        </thead>
                        <tbody>
                            {BillBody.map((bill, index) => {
                                return (
                                    <>
                                        <tr key={index} className="leading-9 border-b border-gray-200">
                                            <td></td>
                                            <td>{index + 1}</td>
                                            <td>{bill.title}</td>
                                            <td>{bill.price}</td>
                                            <td>{bill.count}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="6" className="border ">
                                                {images.map((src, index) => (
                                                    <img
                                                        className="inline-block"
                                                        src={src}
                                                        onClick={() => openImageViewer(index)}
                                                        width="150"
                                                        key={index}
                                                        style={{ margin: "2px" }}
                                                        alt=""
                                                    />
                                                ))}
                                                {isViewerOpen && (
                                                    <ImageViewer
                                                        src={images}
                                                        backgroundStyle={{ backgroundColor: "#00000077" }}
                                                        currentIndex={currentImage}
                                                        disableScroll={false}
                                                        closeOnClickOutside={true}
                                                        onClose={closeImageViewer}
                                                        closeComponent={
                                                            <span style={{
                                                                color: "white",
                                                                position: "absolute",
                                                                top: "15px",
                                                                right: "15px",
                                                                fontSize: "40px",
                                                                fontWeight: "bold",
                                                                // opacity: "",
                                                                cursor: "pointer"
                                                            }}>
                                                                ×
                                                            </span>
                                                        }
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    </>
                                );
                            })}

                            <tr className="leading-9 border-b border-gray-200">
                                <td>1</td>
                                <td>Design UX and UI</td>
                                <td>20</td>
                                <td>300</td>
                                <td>6000</td>
                            </tr>
                            <tr className="leading-9">
                                <td>1</td>
                                <td>Design UX and UI</td>
                                <td>20</td>
                                <td>300</td>
                                <td>6000</td>
                            </tr>
                        </tbody>
                    </table>
                </form>
                <div className=" text-right  mb-10">
                    <div>
                        <div>总计</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { DetailBill };
