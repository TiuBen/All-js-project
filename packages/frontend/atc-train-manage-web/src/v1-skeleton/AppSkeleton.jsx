import { Skeleton } from "./src/skeleton";
import "./AppSkeleton.css";
import { Link, Routes, Route, BrowserRouter } from "react-router-dom";
const Home = () => (
    <div>
        <h2>Home</h2>
    </div>
);
const Profile = () => (
    <div>
        <h2>Profile</h2>
    </div>
);
const Settings = () => (
    <div>
        <h2>Settings</h2>
    </div>
);

const routes = [
    {
        path: "/",
        main: () => <Home />,
        sidebar: () => <p>This is your home page. You'll see your feed which is made up of the people you follow.</p>,
    },
    {
        path: "/profile",
        main: () => <Profile />,
        sidebar: () => (
            <p>
                This is your profile page. You'll be able to see all your profile information as well as the people you
                follow.
            </p>
        ),
    },
    {
        path: "/settings",
        main: () => <Settings />,
        sidebar: () => (
            <p>
                This is your settings page. You can change your name, image, and anything else associated with your
                account.
                <Link to={"/"}>Back to Home</Link>
            </p>
        ),
    },
];

function AppSkeleton() {
    return (
        <BrowserRouter>
            <Skeleton
                leftSidebar={
                    <ul className="nav">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/profile">Profile</Link>
                        </li>
                        <li>
                            <Link to="/settings">Settings</Link>
                        </li>
                    </ul>
                }
                rightSidebar={
                    <div className="border border-red-300">
                        <Routes>
                            {routes.map(({ path, sidebar }) => (
                                <Route key={path} path={path} element={sidebar()} />
                            ))}
                        </Routes>
                    </div>
                }
            >
                <div className="border bg-slate-500">
                    <Routes>
                        {routes.map(({ path, main }) => (
                            <Route key={path} path={path} element={main()} />
                        ))}
                    </Routes>
                </div>
            </Skeleton>
        </BrowserRouter>

        // <Skeleton
        //     topNav={<div>Top Navigation</div>}
        //     leftSidebar={<div>Left </div>}
        //     rightSidebar={<div>Right Sidebar</div>}
        //     bottomBar={<div>Bottom Bar</div>}
        //     floatingAction={<span>+</span>}
        // >
        //     <Routes>
        //         {routes.map(({ path, sidebar }) => (
        //             <Route key={path} path={path} element={sidebar()} />
        //         ))}
        //     </Routes>
        //     <Routes>
        //         {routes.map(({ path, main }) => (
        //             <Route key={path} path={path} element={main()} />
        //         ))}
        //     </Routes>
        // </Skeleton>
    );
}

export default AppSkeleton;
