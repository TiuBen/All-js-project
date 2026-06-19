import { Route, Outlet, Link } from "react-router-dom";
import 报销 from "./forms/报销";
import 出差 from "./forms/出差";
import 寄件 from "./forms/寄件";
import 用车 from "./forms/用车";
import 请假 from "./forms/请假";
import TodoForm from "./forms/TodoForm/TodoForm";

function FormLayout() {
    return (
        <div className="flex flex-row flex-1 p-2  gap-2">
            <div className=" bg-neutral-100 rounded shadow p-2 ">
                <ul>
                    <li>
                        <Link to="/app/form/报销">报销</Link>
                    </li>
                    <li>
                        <Link to="/app/form/寄件">寄件</Link>
                    </li>
                    <li>
                        <Link to="/app/form/用车">用车</Link>
                    </li>
                    <li>
                        <Link to="/app/form/请假">请假</Link>
                    </li>
                    <li>
                        <Link to="/app/form/出差">出差</Link>
                    </li>
                    <li>
                        <Link to="/app/form/test">TodoForm</Link>
                    </li>
                </ul>
            </div>
            <div className="flex-1 bg-neutral-100 rounded shadow ">
                <Outlet />
            </div>
        </div>
    );
}

function FormPageRoute() {
    return (
        <Route path="form" element={<FormLayout />}>
            <Route path="报销" element={<报销 />} />
            <Route path="出差" element={<出差 />} />
            <Route path="寄件" element={<寄件 />} />
            <Route path="用车" element={<用车 />} />
            <Route path="请假" element={<请假 />} />
            <Route path="test" element={<TodoForm />} />
        </Route>
    );
}

export  {FormPageRoute};
