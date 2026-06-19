import Tree from "./Components/Tree";
import useSWR from "swr";
import { Request } from "../../utils/index";

const fetcher = (url) => Request.get(url).then((res) => res);

export const DiskPage = () => {
    const { data, error, isLoading } = useSWR("disk", fetcher);

    if (error) {
        return <div>error</div>;
    }
    if (isLoading) {
        return <div>isLoading</div>;
    }

    return (
        <div className="flex flex-row flex-1  gap-2 m-2">
            <div className="flex flex-col p-2 gap-2  rounded shadow ">
                <button className=" appearance-auto">上传文件</button>
                <button className=" appearance-auto">上传文件夹</button>
                <button className=" appearance-auto">删除</button>
            </div>
            <Tree data={data.children} />
            <div className="flex flex-col flex-1 p-2 rounded shadow ">
                <div> AAA/BBB/CCC/ddd.exe</div>
                <div className="flex border flex-1  text-center  items-center justify-center">
                    <h1>暂时不支持预览</h1>
                </div>
            </div>
        </div>
    );
};
