import { useState, useEffect, useRef, forwardRef } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import { UserProvider, ModalProvider } from "./utils/index";
import { Auth, Login } from "./layouts/index";
import { Contact } from "./Page/ClientPage/Contact/Contact";
import { DiskPage } from "./Page";

import Register from "./layouts/Login/Register";
import settingRouter from "./Page/UserPage/main";
import { CalendarPageRoute, FormPageRoute } from "./Page/index";
import AtcTiku from "./Atctiku/AtcTiku";
import QEditor from "./Atctiku/QEditor";
import DDD from "components/DDD";
import TodoPage from "Page/TodoPage/TodoPage";
import FipsPage from "Page/FipsPage/FipsPage";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

const returnRoute = () => {
    return <Route path="d" element={<div>returnRoute</div>} />;
};

function Tel({ children }) {
    return (
        <div>
            ddd
            {children}
            <Outlet />
        </div>
    );
}
function TDDl({ children }) {
    return (
        <div>
            fasdfasdfasdfas
            {children}
        </div>
    );
}

function App() {
    const [point, setPoint] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);

    return (
        <>
            <UserProvider>
                <ModalProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/fips" element={<FipsPage />} />

                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="tiku">
                                <Route index element={<AtcTiku />} />
                                <Route path="editor" element={<QEditor />} />
                            </Route>
                            <Route
                                path="c1"
                                element={
                                    <div>
                                        cccccccccccccc
                                        <br />
                                        <Link to={"/c1/d2"}>c1 d2</Link>
                                        <br />
                                        <Link to={":id"}>c1 :id</Link>
                                        <Outlet />
                                    </div>
                                }
                            >
                                <Route
                                    path=":id"
                                    element={
                                        <div>
                                            ppppppppppppp
                                            <Link to={"/c1"}>c1</Link>
                                        </div>
                                    }
                                />
                                <Route
                                    path="d2"
                                    element={
                                        <div>
                                            dddddddddddddd
                                            <Link to={"/c1"}>c1</Link>
                                        </div>
                                    }
                                />
                            </Route>
                            <Route path="/todo" element={<TodoPage />} />

                            <Route path="/" element={<Auth />}>
                                <Route path="app">
                                    {CalendarPageRoute()}
                                    {FormPageRoute()}
                                    <Route path="gant" element={<TDDl />} />
                                    <Route path="word" element={<TDDl />} />
                                    <Route path="excel" element={<TDDl />} />
                                    <Route path="email" element={<TDDl />} />
                                    <Route path="disk" element={<DiskPage />} />
                                </Route>
                                <Route
                                    index
                                    element={
                                        <ContextMenu>
                                            <ContextMenuTrigger>
                                                <p className="h-[2000px]  bg-red-400 flex-1 text-center text-xl">
                                                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quidem aut
                                                    delectus quas modi est quibusdam sed hic quos distinctio dolor
                                                    excepturi error, vel molestiae possimus maxime similique blanditiis
                                                    tenetur mollitia recusandae consectetur necessitatibus? Voluptates
                                                    ipsa incidunt eum saepe, natus vitae eaque, doloremque similique
                                                    sunt tempore, earum reprehenderit sed? In atque adipisci,
                                                    voluptatibus dolore et ipsa doloribus omnis maxime esse dolorum a
                                                    quod commodi. Error, adipisci itaque. Quod debitis nulla nam quas
                                                    corporis eos eius dignissimos optio neque vitae aliquid commodi
                                                    explicabo dolorum quia, perferendis, accusamus aliquam ad quisquam?
                                                    Error, perferendis molestias sapiente ab ipsam, eligendi quam
                                                    ducimus voluptate laborum totam pariatur, nam omnis vitae nostrum
                                                    ellat, quasi tenetur possimus repudiandae accusantium soluta saepe?
                                                    Architecto, veritatis? Labore quidem beatae explicabo hic, soluta at
                                                    quia unde veniam? Sed ipsum libero autem quos, nihil vitae
                                                    recusandae quae saepe quo exercitationem consequuntur illo minima
                                                    dolor placeat atque quisquam, blanditiis officia eum magnam
                                                    reiciendis. Ipsa, mollitia necessitatibus. Accusantium laboriosam
                                                    amet sapiente saepe, aliquam distinctio magni exercitationem rem
                                                    porro temporibus dolores ducimus, magnam dolore provident illo neque
                                                    culpa eaque fugit. Aut, dicta quasi. Ad odit voluptatum alias,
                                                    commodi itaque quis inventore sit recusandae aliquid explicabo
                                                    consequatur quidem eaque earum numquam non saepe perspiciatis error
                                                    natus est! Possimus quis fuga suscipit necessitatibus quae cumque
                                                    ipsum ratione similique atque a, dolores quaerat id doloribus. Alias
                                                    veritatis soluta ex, velit odio fugiat ipsam modi voluptas incidunt!
                                                    Repellendus voluptate ut consectetur cumque assumenda cupiditate eum
                                                    nesciunt similique incidunt. Voluptates dolores sapiente tenetur
                                                    architecto illo sunt voluptatem culpa dignissimos laudantium tempore
                                                    voluptate distinctio, aliquam maxime vel ad exercitationem eveniet.
                                                    Iusto officiis incidunt labore repudiandae excepturi a voluptatibus
                                                    error, at soluta? Saepe, delectus ipsam accusantium laudantium
                                                    veritatis animi officia eaque corporis ut neque aut illum. Nam
                                                    fugiat vitae beatae veritatis officia quos sequi culpa! Assumenda,
                                                    voluptates rerum amet voluptatibus odit dolor pariatur explicabo
                                                    labore eveniet tempora mollitia non. Dicta dolores aliquam magni
                                                    voluptatibus! Earum tempora quaerat facilis. Molestias ex dolore
                                                    explicabo error sed, temporibus molestiae natus quos commodi
                                                    tempore. Ipsam, excepturi!
                                                </p>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent>
                                                <ContextMenuItem>Profile</ContextMenuItem>
                                                <ContextMenuItem>Billing</ContextMenuItem>
                                                <ContextMenuItem>Team</ContextMenuItem>
                                                <ContextMenuItem>Subscription</ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    }
                                />
                                <Route path="client">
                                    <Route path="contact" element={<Contact />} />
                                    <Route path="product" element={<div>/client/contact</div>} />
                                    <Route path="info" element={<div>/client/contact</div>} />
                                </Route>

                                {settingRouter()}

                                <Route path="disk" element={<DiskPage />} />
                                <Route
                                    path="test"
                                    element={
                                        <div>
                                            test
                                            <Outlet />
                                        </div>
                                    }
                                >
                                    <Route path="2" element={<div>22222</div>} />
                                    {returnRoute()}
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ModalProvider>
            </UserProvider>
        </>
    );
}

export default App;
